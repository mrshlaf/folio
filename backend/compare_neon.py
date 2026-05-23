import time
import random
import string
import psycopg2
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

NUM_USERS = 5
NUM_BOOKS = 3
NUM_RATINGS = 10

# Connections
mongo_client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
# Use a specific benchmark collection name to stay safe
benchmark_db = mongo_client["benchmark_test_db"]

def get_neon_conn():
    return psycopg2.connect(os.getenv("NEON_URI"))

def seed_neon():
    print("Connecting to Neon...")
    conn = get_neon_conn()
    cursor = conn.cursor()

    # Clear MongoDB Benchmark Data (Safety check: uses benchmark_db only)
    print("Clearing MongoDB Atlas benchmark data...")
    benchmark_db.users.delete_many({})
    benchmark_db.books.delete_many({})
    
    print("Cleaning Neon database...")
    cursor.execute("DROP TABLE IF EXISTS user_books CASCADE")
    cursor.execute("DROP TABLE IF EXISTS ratings CASCADE")
    cursor.execute("DROP TABLE IF EXISTS book_genres CASCADE")
    cursor.execute("DROP TABLE IF EXISTS comments CASCADE")
    cursor.execute("DROP TABLE IF EXISTS books CASCADE")
    cursor.execute("DROP TABLE IF EXISTS users CASCADE")
    
    # Recalcreate Types if needed
    cursor.execute("DROP TYPE IF EXISTS role_type CASCADE; CREATE TYPE role_type AS ENUM ('user', 'admin');")
    cursor.execute("DROP TYPE IF EXISTS access_type CASCADE; CREATE TYPE access_type AS ENUM ('free', 'sale');")
    cursor.execute("DROP TYPE IF EXISTS status_type CASCADE; CREATE TYPE status_type AS ENUM ('active', 'archived', 'empty');")
    cursor.execute("DROP TYPE IF EXISTS shelf_type CASCADE; CREATE TYPE shelf_type AS ENUM ('cold', 'hot');")
    cursor.execute("DROP TYPE IF EXISTS sentiment_type CASCADE; CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral');")

    print("Creating tables on Neon...")
    cursor.execute("""
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255), email VARCHAR(255) UNIQUE, password VARCHAR(255),
        phone VARCHAR(20), age INT, job VARCHAR(100), country VARCHAR(100), role role_type DEFAULT 'user'
    )""")
    cursor.execute("""
    CREATE TABLE books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255), author VARCHAR(255), release_year INT, access_type access_type,
        price DECIMAL, page_count INT, publisher VARCHAR(255), cover_image VARCHAR(255)
    )""")
    cursor.execute("CREATE TABLE ratings (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), book_id INT REFERENCES books(id), score INT)")
    
    print("Seeding Users to MongoDB Atlas benchmark...")
    mongo_users = []
    for i in range(NUM_USERS):
        u = {"full_name": f"User {i}", "email": f"user{i}@test.com"}
        mongo_users.append(u)
    benchmark_db.users.insert_many(mongo_users)
    inserted_mongo_users = list(benchmark_db.users.find())

    print("Seeding Books to MongoDB Atlas benchmark...")
    mongo_books = []
    for i in range(NUM_BOOKS):
        b = {"title": f"Book {i}", "embeddedRatings": []}
        mongo_books.append(b)
    benchmark_db.books.insert_many(mongo_books)
    inserted_mongo_books = list(benchmark_db.books.find())

    print("Seeding Users to Neon...")
    user_ids = []
    for i in range(NUM_USERS):
        cursor.execute("INSERT INTO users (full_name, email, password, phone, age, job, country) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                       (f"User {i}", f"user{i}@neon.com", "pass", "123", 25, "Dev", "ID"))
        user_ids.append(cursor.fetchone()[0])

    print("Seeding Books to Neon...")
    book_ids = []
    for i in range(NUM_BOOKS):
        cursor.execute("INSERT INTO books (title, author, release_year, access_type, price, page_count, publisher, cover_image) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                       (f"Book {i}", "Author", 2024, "free", 0, 200, "Pub", "img.jpg"))
        book_ids.append(cursor.fetchone()[0])

    print(f"Seeding {NUM_RATINGS} Ratings to both...")
    for _ in range(NUM_RATINGS):
        u_idx = random.randint(0, NUM_USERS - 1)
        b_idx = random.randint(0, NUM_BOOKS - 1)
        score = random.randint(1, 5)

        # Mongo
        benchmark_db.books.update_one(
            {"_id": inserted_mongo_books[b_idx]["_id"]},
            {"$push": {"embeddedRatings": {"userId": inserted_mongo_users[u_idx]["_id"], "score": score}}}
        )

        # Neon
        cursor.execute("INSERT INTO ratings (user_id, book_id, score) VALUES (%s, %s, %s)", 
                       (user_ids[u_idx], book_ids[b_idx], score))

    conn.commit()
    cursor.close()
    conn.close()
    print("Neon Seeding Complete.")

def run_comparison():
    print("\n--- PERFORMANCE: CLOUD MONGODB (ATLAS) vs REMOTE SQL (NEON) ---")
    
    # Ensure we use a book that actually exists after seeding
    sample_book = benchmark_db.books.find_one()
    if not sample_book:
        print("ERROR: No books found in MongoDB to test. Did seeding fail?")
        return
    
    book_title = sample_book["title"]
    print(f"Testing with: {book_title}")
    
    # 1. READ & CALC (DETAILED FETCH)
    start = time.time()
    res = benchmark_db.books.find_one({"title": book_title})
    m_ratings = res.get("embeddedRatings", [])
    if m_ratings:
        m_avg = sum(r["score"] for r in m_ratings) / len(m_ratings)
    mongo_time = time.time() - start
    print(f"MongoDB Atlas (Single Doc Fetch + Math): {mongo_time:.5f}s")

    neon_conn = get_neon_conn()
    cursor = neon_conn.cursor()
    start = time.time()
    cursor.execute("""
        SELECT AVG(score) FROM ratings 
        JOIN books ON ratings.book_id = books.id 
        WHERE books.title = %s
    """, (book_title,))
    cursor.fetchone()
    neon_time1 = time.time() - start
    print(f"Neon SQL (Relation Join + Math):        {neon_time1:.5f}s")

    # 2. SORTING & LIMIT (TOP RATED BOOKS)
    print("\n--- TEST: SORTING & LIMIT (TOP RATED) ---")
    # MongoDB Sorting on nested/calculated fields is complex without aggregation pipeline
    start = time.time()
    list(benchmark_db.books.find().sort("title", 1).limit(10))
    mongo_sort_time = time.time() - start
    print(f"MongoDB Atlas (Sort by Title + Limit 10): {mongo_sort_time:.5f}s")

    start = time.time()
    cursor.execute("SELECT title FROM books ORDER BY title ASC LIMIT 10")
    cursor.fetchall()
    neon_sort_time = time.time() - start
    print(f"Neon SQL (Sort by Title + Limit 10):      {neon_sort_time:.5f}s")

    # 3. BULK JOIN (ALL BOOKS + GENRES)
    print("\n--- TEST: BULK JOIN (MANY-TO-MANY SIMULATION) ---")
    start = time.time()
    list(benchmark_db.books.find({}, {"title": 1})) 
    mongo_bulk_time = time.time() - start
    print(f"MongoDB Atlas (Scan All Documents):       {mongo_bulk_time:.5f}s")

    start = time.time()
    cursor.execute("""
        SELECT b.title, COUNT(r.id) 
        FROM books b 
        LEFT JOIN ratings r ON b.id = r.book_id 
        GROUP BY b.id
    """)
    cursor.fetchall()
    neon_bulk_time = time.time() - start
    print(f"Neon SQL (Complex Group By + Join):      {neon_bulk_time:.5f}s")

    # 4. DELETE (CLEANUP PERFORMANCE)
    print("\n--- TEST: DELETE PERFORMANCE ---")
    start = time.time()
    # MongoDB: Deleting the book also "deletes" its ratings because they are embedded
    benchmark_db.books.delete_one({"title": book_title})
    mongo_del_time = time.time() - start
    print(f"MongoDB Atlas (Delete One):               {mongo_del_time:.5f}s")

    start = time.time()
    # Delete related ratings first to avoid ForeignKeyViolation, or delete a book with no ratings
    # For a fair 'cleanup' test, we simulate deleting a book and its relations
    cursor.execute("DELETE FROM ratings WHERE book_id IN (SELECT id FROM books WHERE title = %s)", (book_title,))
    cursor.execute("DELETE FROM books WHERE title = %s", (book_title,))
    neon_conn.commit()
    neon_del_time = time.time() - start
    print(f"Neon SQL (Delete Ratings + Book + Commit): {neon_del_time:.5f}s")

    # 5. MULTI-COLLECTION JOIN (USER -> BOOK -> RATING)
    # Finding what books a specific user has rated and the details of those books
    print("\n--- TEST: MULTI-LEVEL RELATIONAL JOIN ---")
    u_email = "user0@test.com"
    
    # MongoDB: Requires an aggregation pipeline or multiple queries
    start = time.time()
    # Aggregation is the 'correct' way to join in Mongo (lookup)
    pipeline = [
        {"$match": {"email": u_email}},
        {"$lookup": {
            "from": "books",
            "localField": "_id",
            "foreignField": "embeddedRatings.userId",
            "as": "rated_books"
        }}
    ]
    list(benchmark_db.users.aggregate(pipeline))
    mongo_multi_time = time.time() - start
    print(f"MongoDB Atlas (Aggregate $lookup):        {mongo_multi_time:.5f}s")

    start = time.time()
    cursor.execute("""
        SELECT u.full_name, b.title, r.score 
        FROM users u
        JOIN ratings r ON u.id = r.user_id
        JOIN books b ON r.book_id = b.id
        WHERE u.email = %s
    """, (u_email,))
    cursor.fetchall()
    neon_multi_time = time.time() - start
    print(f"Neon SQL (3-Table Join):                  {neon_multi_time:.5f}s")

    # 6. TEXT SEARCH (FUZZY MATCH)
    print("\n--- TEST: SUBSTRING / SEARCH PERFORMANCE ---")
    search_term = "Book" # Matching many records
    
    start = time.time()
    list(benchmark_db.books.find({"title": {"$regex": search_term, "$options": "i"}}).limit(20))
    mongo_search_time = time.time() - start
    print(f"MongoDB Atlas (Regex Search):             {mongo_search_time:.5f}s")

    start = time.time()
    cursor.execute("SELECT title FROM books WHERE title ILIKE %s LIMIT 20", (f"%{search_term}%",))
    cursor.fetchall()
    neon_search_time = time.time() - start
    print(f"Neon SQL (ILIKE Search):                 {neon_search_time:.5f}s")

    print(f"\nSummary of latency across types:")
    print(f"Read Match: SQL is {neon_time1/mongo_time:.1f}x slower")
    print(f"Bulk Scan:  SQL is {neon_bulk_time/mongo_bulk_time:.1f}x slower")

    cursor.close()
    neon_conn.close()

    cursor.close()
    neon_conn.close()

if __name__ == "__main__":
    if "your_neon_connection_string_here" in os.getenv("NEON_URI", ""):
        print("ERROR: Please put your Neon URI in the .env file first!")
    else:
        seed_neon()
        run_comparison()
