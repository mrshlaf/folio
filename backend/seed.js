import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const DAY = 86400000

const daysAgo = (d) => new Date(Date.now() - d * DAY)

const pickRandom = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n)

const cover = (seed) => `https://picsum.photos/seed/${seed}/1000/1500`

const analyzeSentiment = (text) => {
  const lower = text.toLowerCase()
  const pos = ['bagus', 'keren', 'mantap', 'luar biasa', 'suka', 'recommend', 'good', 'great', 'excellent', 'amazing']
  const neg = ['buruk', 'jelek', 'payah', 'sampah', 'tidak suka', 'bad', 'terrible', 'awful', 'membosankan', 'gagal']
  let score = 0
  pos.forEach(w => { if (lower.includes(w)) score++ })
  neg.forEach(w => { if (lower.includes(w)) score-- })
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

const computeWeightedRating = (R, v, C = 3, m = 10, ageDays = 5) => {
  const bayesian = (v / (v + m)) * R + (m / (v + m)) * C
  const timeFactor = 1 / (1 + ageDays / 30)
  return parseFloat((bayesian * (0.8 + 0.2 * timeFactor)).toFixed(4))
}

const userSchema = new mongoose.Schema({
  fullName: String, phone: String, email: { type: String, unique: true },
  password: String, age: Number, job: String, country: String,
  role: { type: String, default: 'user' },
  genrePreferences: { liked: { type: Array, default: undefined }, avoided: { type: Array, default: undefined } },
  myRecommendation: { bookId: mongoose.Schema.Types.ObjectId, reason: String, source: String, lockedAt: Date },
  myRatings: { type: Array, default: undefined },
  myComments: { type: Array, default: undefined },
  viewedBooks: { type: Array, default: undefined }
}, { timestamps: true })

const commentSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, userName: String,
  text: String, sentiment: String,
  likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  createdAt: { type: Date, default: Date.now }
})

const bookSchema = new mongoose.Schema({
  title: String, author: String, releaseYear: Number, isbn: { type: String, sparse: true, unique: true },
  accessType: String, price: { type: Number, default: 0 },
  pageCount: Number, publisher: String, genre: [String], coverImage: String,
  status: { type: String, default: 'active' }, shelf: { type: String, default: 'cold' },
  totalViews: { type: Number, default: 0 }, uniqueViewers: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 }, totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }, weightedRating: { type: Number, default: 0 },
  clickLogs: { type: Array, default: [] },
  embeddedComments: { type: [commentSchema], default: [] },
  embeddedRatings: { type: Array, default: [] },
  optionalAttributes: { type: Array, default: [] },
  registeredAt: Date
}, { timestamps: true })

bookSchema.index({ title: 'text', author: 'text' })

const bookByUsersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
  books: { type: Array, default: [] }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Book = mongoose.model('Book', bookSchema)
const BookByUsers = mongoose.model('BookByUsers', bookByUsersSchema)

const GENRES = ['Fiksi', 'Non-Fiksi', 'Sains & Teknologi', 'Sejarah', 'Biografi', 'Bisnis & Ekonomi', 'Psikologi', 'Filsafat', 'Self-Help', 'Romance', 'Thriller', 'Petualangan', 'Fantasi', 'Kesehatan', 'Anak-anak']

const BOOK_DATA = [
  { title: 'Laskar Pelangi', author: 'Andrea Hirata', releaseYear: 2005, isbn: '978-979-1kls01-1', publisher: 'Bentang Pustaka', genre: ['Fiksi', 'Petualangan'], pageCount: 529 },
  { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', releaseYear: 1980, isbn: '978-979-1kls02-2', publisher: 'Hasta Mitra', genre: ['Fiksi', 'Sejarah'], pageCount: 535 },
  { title: 'Atomic Habits', author: 'James Clear', releaseYear: 2018, isbn: '978-979-1kls03-3', publisher: 'Avery', genre: ['Self-Help', 'Psikologi'], pageCount: 320 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', releaseYear: 2011, isbn: '978-979-1kls04-4', publisher: 'Harper', genre: ['Sejarah', 'Non-Fiksi'], pageCount: 443 },
  { title: 'The Alchemist', author: 'Paulo Coelho', releaseYear: 1988, isbn: '978-979-1kls05-5', publisher: 'HarperCollins', genre: ['Fiksi', 'Petualangan'], pageCount: 208 },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', releaseYear: 1997, isbn: '978-979-1kls06-6', publisher: 'Warner Books', genre: ['Bisnis & Ekonomi', 'Self-Help'], pageCount: 336 },
  { title: 'Thinking Fast and Slow', author: 'Daniel Kahneman', releaseYear: 2011, isbn: '978-979-1kls07-7', publisher: 'Farrar Straus', genre: ['Psikologi', 'Non-Fiksi'], pageCount: 499 },
  { title: 'Dune', author: 'Frank Herbert', releaseYear: 1965, isbn: '978-979-1kls08-8', publisher: 'Chilton Books', genre: ['Fiksi', 'Fantasi'], pageCount: 688 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', releaseYear: 2020, isbn: '978-979-1kls09-9', publisher: 'Harriman House', genre: ['Bisnis & Ekonomi', 'Psikologi'], pageCount: 256 },
  { title: 'Meditations', author: 'Marcus Aurelius', releaseYear: 180, isbn: '978-979-1kls10-0', publisher: 'Penguin Classics', genre: ['Filsafat', 'Self-Help'], pageCount: 254 },
  { title: 'Zero to One', author: 'Peter Thiel', releaseYear: 2014, isbn: '978-979-1kls11-1', publisher: 'Crown Business', genre: ['Bisnis & Ekonomi'], pageCount: 224 },
  { title: 'The Pragmatic Programmer', author: 'David Thomas', releaseYear: 1999, isbn: '978-979-1kls12-2', publisher: 'Addison-Wesley', genre: ['Sains & Teknologi'], pageCount: 352 },
  { title: 'Sebuah Seni untuk Bersikap Bodo Amat', author: 'Mark Manson', releaseYear: 2016, isbn: '978-979-1kls13-3', publisher: 'HarperOne', genre: ['Self-Help', 'Psikologi'], pageCount: 224 },
  { title: 'Perahu Kertas', author: 'Dewi Lestari', releaseYear: 2009, isbn: '978-979-1kls14-4', publisher: 'Bentang', genre: ['Fiksi', 'Romance'], pageCount: 444 },
  { title: 'The 7 Habits', author: 'Stephen Covey', releaseYear: 1989, isbn: '978-979-1kls15-5', publisher: 'Free Press', genre: ['Self-Help'], pageCount: 432 },
  { title: 'Clean Code', author: 'Robert C. Martin', releaseYear: 2008, isbn: '978-979-1kls16-6', publisher: 'Prentice Hall', genre: ['Sains & Teknologi'], pageCount: 464 },
  { title: 'Homo Deus', author: 'Yuval Noah Harari', releaseYear: 2015, isbn: '978-979-1kls17-7', publisher: 'Harper', genre: ['Sejarah', 'Non-Fiksi'], pageCount: 464 },
  { title: 'The Lean Startup', author: 'Eric Ries', releaseYear: 2011, isbn: '978-979-1kls18-8', publisher: 'Crown Business', genre: ['Bisnis & Ekonomi'], pageCount: 336 },
  { title: 'Start With Why', author: 'Simon Sinek', releaseYear: 2009, isbn: '978-979-1kls19-9', publisher: 'Portfolio', genre: ['Bisnis & Ekonomi', 'Self-Help'], pageCount: 256 },
  { title: 'Ikigai', author: 'Hector Garcia', releaseYear: 2016, isbn: '978-979-1kls20-0', publisher: 'Penguin Life', genre: ['Self-Help', 'Filsafat'], pageCount: 208 },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', releaseYear: 1925, isbn: '978-979-1kls21-1', publisher: 'Scribner', genre: ['Fiksi'], pageCount: 180 },
  { title: 'Design Patterns', author: 'Gang of Four', releaseYear: 1994, isbn: '978-979-1kls22-2', publisher: 'Addison-Wesley', genre: ['Sains & Teknologi'], pageCount: 395 },
  { title: 'The Subtle Art', author: 'Mark Manson', releaseYear: 2016, isbn: '978-979-1kls23-3', publisher: 'HarperOne', genre: ['Self-Help'], pageCount: 224 },
  { title: 'Man Search for Meaning', author: 'Viktor Frankl', releaseYear: 1946, isbn: '978-979-1kls24-4', publisher: 'Beacon Press', genre: ['Psikologi', 'Biografi'], pageCount: 184 },
  { title: 'Pulang', author: 'Tere Liye', releaseYear: 2015, isbn: '978-979-1kls25-5', publisher: 'Republika', genre: ['Fiksi', 'Petualangan'], pageCount: 400 },
  { title: 'Good to Great', author: 'Jim Collins', releaseYear: 2001, isbn: '978-979-1kls26-6', publisher: 'HarperBusiness', genre: ['Bisnis & Ekonomi'], pageCount: 320 },
  { title: 'The Power of Now', author: 'Eckhart Tolle', releaseYear: 1997, isbn: '978-979-1kls27-7', publisher: 'New World Lib', genre: ['Self-Help', 'Filsafat'], pageCount: 229 },
  { title: 'Outliers', author: 'Malcolm Gladwell', releaseYear: 2008, isbn: '978-979-1kls28-8', publisher: 'Little Brown', genre: ['Non-Fiksi', 'Psikologi'], pageCount: 309 },
  { title: 'Negeri 5 Menara', author: 'Ahmad Fuadi', releaseYear: 2009, isbn: '978-979-1kls29-9', publisher: 'Gramedia', genre: ['Fiksi', 'Sejarah'], pageCount: 423 },
  { title: 'Brief History of Time', author: 'Stephen Hawking', releaseYear: 1988, isbn: '978-979-1kls30-0', publisher: 'Bantam Books', genre: ['Sains & Teknologi', 'Non-Fiksi'], pageCount: 212 },
  { title: 'Cantik Itu Luka', author: 'Eka Kurniawan', releaseYear: 2002, isbn: '978-979-1kls31-1', publisher: 'Gramedia', genre: ['Fiksi', 'Sejarah'], pageCount: 508 },
  { title: 'Laut Bercerita', author: 'Leila S. Chudori', releaseYear: 2017, isbn: '978-979-1kls32-2', publisher: 'KPG', genre: ['Fiksi', 'Sejarah'], pageCount: 394 },
  { title: 'Hujan', author: 'Tere Liye', releaseYear: 2016, isbn: '978-979-1kls33-3', publisher: 'Gramedia', genre: ['Fiksi', 'Romance', 'Sains & Teknologi'], pageCount: 320 },
  { title: 'Dilan: Dia adalah Dilanku', author: 'Pidi Baiq', releaseYear: 2014, isbn: '978-979-1kls34-4', publisher: 'Pastel Books', genre: ['Fiksi', 'Romance', 'Anak-anak'], pageCount: 332 },
  { title: 'Ronggeng Dukuh Paruk', author: 'Ahmad Tohari', releaseYear: 1982, isbn: '978-979-1kls35-5', publisher: 'Gramedia', genre: ['Fiksi', 'Sejarah', 'Seni & Budaya'], pageCount: 406 },
  { title: '1984', author: 'George Orwell', releaseYear: 1949, isbn: '978-979-1kls36-6', publisher: 'Secker & Warburg', genre: ['Fiksi', 'Politik', 'Thriller'], pageCount: 328 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', releaseYear: 1960, isbn: '978-979-1kls37-7', publisher: 'J.B. Lippincott', genre: ['Fiksi', 'Hukum'], pageCount: 281 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', releaseYear: 1813, isbn: '978-979-1kls38-8', publisher: 'T. Egerton', genre: ['Fiksi', 'Romance', 'Sastra Klasik'], pageCount: 432 },
  { title: 'Sirkus Pohon', author: 'Andrea Hirata', releaseYear: 2017, isbn: '978-979-1kls39-9', publisher: 'Bentang Pustaka', genre: ['Fiksi'], pageCount: 410 },
  { title: 'Harry Potter 1', author: 'J.K. Rowling', releaseYear: 1997, isbn: '978-979-1kls40-0', publisher: 'Bloomsbury', genre: ['Fantasi', 'Anak-anak'], pageCount: 223 },
  { title: 'Harry Potter 2', author: 'J.K. Rowling', releaseYear: 1998, isbn: '978-979-1kls41-1', publisher: 'Bloomsbury', genre: ['Fantasi', 'Anak-anak'], pageCount: 251 },
  { title: 'Harry Potter 3', author: 'J.K. Rowling', releaseYear: 1999, isbn: '978-979-1kls42-2', publisher: 'Bloomsbury', genre: ['Fantasi', 'Anak-anak'], pageCount: 317 },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', releaseYear: 1937, isbn: '978-979-1kls43-3', publisher: 'George Allen', genre: ['Fantasi', 'Petualangan'], pageCount: 310 },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', releaseYear: 1954, isbn: '978-979-1kls44-4', publisher: 'George Allen', genre: ['Fantasi', 'Petualangan'], pageCount: 1178 },
  { title: 'Gadis Kretek', author: 'Ratih Kumala', releaseYear: 2012, isbn: '978-979-1kls45-5', publisher: 'Gramedia', genre: ['Fiksi', 'Sejarah', 'Romance'], pageCount: 288 },
  { title: 'Bintang', author: 'Tere Liye', releaseYear: 2017, isbn: '978-979-1kls46-6', publisher: 'Gramedia', genre: ['Fiksi', 'Fantasi'], pageCount: 392 },
  { title: 'Bulan', author: 'Tere Liye', releaseYear: 2015, isbn: '978-979-1kls47-7', publisher: 'Gramedia', genre: ['Fiksi', 'Fantasi'], pageCount: 400 },
  { title: 'Matahari', author: 'Tere Liye', releaseYear: 2016, isbn: '978-979-1kls48-8', publisher: 'Gramedia', genre: ['Fiksi', 'Fantasi'], pageCount: 400 },
  { title: 'Sherlock Holmes 1', author: 'Arthur Conan Doyle', releaseYear: 1892, isbn: '978-979-1kls49-9', publisher: 'George Newnes', genre: ['Misteri', 'Thriller'], pageCount: 307 },
  { title: 'Filosofi Teras', author: 'Henry Manampiring', releaseYear: 2018, isbn: '978-979-1kls50-0', publisher: 'Kompas', genre: ['Filsafat', 'Self-Help'], pageCount: 320 },
  { title: 'Bicara Itu Ada Seninya', author: 'Oh Su Hyang', releaseYear: 2018, isbn: '978-979-1kls51-1', publisher: 'Bhuana Ilmu Pop', genre: ['Self-Help', 'Psikologi'], pageCount: 238 },
  { title: 'Grit', author: 'Angela Duckworth', releaseYear: 2016, isbn: '978-979-1kls52-2', publisher: 'Scribner', genre: ['Psikologi', 'Self-Help'], pageCount: 352 },
  { title: 'The Tipping Point', author: 'Malcolm Gladwell', releaseYear: 2000, isbn: '978-979-1kls53-3', publisher: 'Little Brown', genre: ['Psikologi', 'Bisnis & Ekonomi'], pageCount: 301 },
  { title: 'Elon Musk', author: 'Walter Isaacson', releaseYear: 2023, isbn: '978-979-1kls54-4', publisher: 'Simon & Schuster', genre: ['Biografi', 'Bisnis & Ekonomi'], pageCount: 688 },
  { title: 'Steve Jobs', author: 'Walter Isaacson', releaseYear: 2011, isbn: '978-979-1kls55-5', publisher: 'Simon & Schuster', genre: ['Biografi', 'Bisnis & Ekonomi'], pageCount: 656 },
  { title: 'Shoe Dog', author: 'Phil Knight', releaseYear: 2016, isbn: '978-979-1kls56-6', publisher: 'Scribner', genre: ['Biografi', 'Bisnis & Ekonomi'], pageCount: 400 },
  { title: 'Educated', author: 'Tara Westover', releaseYear: 2018, isbn: '978-979-1kls57-7', publisher: 'Random House', genre: ['Biografi', 'Pendidikan'], pageCount: 352 },
  { title: 'Becoming', author: 'Michelle Obama', releaseYear: 2018, isbn: '978-979-1kls58-8', publisher: 'Crown', genre: ['Biografi', 'Politik'], pageCount: 448 },
  { title: 'Seni Tinggal di Bumi', author: 'Farah Qoonita', releaseYear: 2020, isbn: '978-979-1kls59-9', publisher: 'Falcon', genre: ['Self-Help', 'Agama & Spiritualitas'], pageCount: 200 },
  { title: 'Garis Waktu', author: 'Fiersa Besari', releaseYear: 2016, isbn: '978-979-1kls60-0', publisher: 'Media Kita', genre: ['Fiksi', 'Romance'], pageCount: 212 },
  { title: '11:11', author: 'Fiersa Besari', releaseYear: 2018, isbn: '978-979-1kls61-1', publisher: 'Media Kita', genre: ['Fiksi', 'Romance'], pageCount: 300 },
  { title: 'Dunia Sophie', author: 'Jostein Gaarder', releaseYear: 1991, isbn: '978-979-1kls62-2', publisher: 'Farrar', genre: ['Fiksi', 'Filsafat'], pageCount: 512 },
  { title: 'Madilog', author: 'Tan Malaka', releaseYear: 1943, isbn: '978-979-1kls63-3', publisher: 'Pusat Data', genre: ['Filsafat', 'Politik', 'Sejarah'], pageCount: 500 },
  { title: 'Aroma Karsa', author: 'Dewi Lestari', releaseYear: 2018, isbn: '978-979-1kls64-4', publisher: 'Bentang Pustaka', genre: ['Fiksi', 'Fantasi', 'Romance'], pageCount: 710 },
  { title: 'Supernova: Ksatria', author: 'Dewi Lestari', releaseYear: 2001, isbn: '978-979-1kls65-5', publisher: 'Truedee', genre: ['Fiksi', 'Sains & Teknologi'], pageCount: 320 },
  { title: 'Tenggelamnya Kapal', author: 'Buya Hamka', releaseYear: 1938, isbn: '978-979-1kls66-6', publisher: 'Balai Pustaka', genre: ['Fiksi', 'Agama & Spiritualitas'], pageCount: 250 },
  { title: 'Di Bawah Lindungan', author: 'Buya Hamka', releaseYear: 1938, isbn: '978-979-1kls67-7', publisher: 'Balai Pustaka', genre: ['Fiksi', 'Agama & Spiritualitas'], pageCount: 150 },
  { title: 'Max Havelaar', author: 'Multatuli', releaseYear: 1860, isbn: '978-979-1kls68-8', publisher: 'J. de Ruyter', genre: ['Fiksi', 'Sejarah', 'Politik'], pageCount: 350 },
  { title: 'The Origin of Species', author: 'Charles Darwin', releaseYear: 1859, isbn: '978-979-1kls69-9', publisher: 'John Murray', genre: ['Sains & Teknologi', 'Sejarah'], pageCount: 502 },
  { title: 'Cosmos', author: 'Carl Sagan', releaseYear: 1980, isbn: '978-979-1kls70-0', publisher: 'Random House', genre: ['Sains & Teknologi', 'Non-Fiksi'], pageCount: 365 },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', releaseYear: 1997, isbn: '978-979-1kls71-1', publisher: 'W. W. Norton', genre: ['Sejarah', 'Sains & Teknologi'], pageCount: 480 },
  { title: 'Blink', author: 'Malcolm Gladwell', releaseYear: 2005, isbn: '978-979-1kls72-2', publisher: 'Little Brown', genre: ['Psikologi', 'Non-Fiksi'], pageCount: 296 },
  { title: 'Factfulness', author: 'Hans Rosling', releaseYear: 2018, isbn: '978-979-1kls73-3', publisher: 'Flatiron', genre: ['Sains & Teknologi', 'Pendidikan'], pageCount: 342 },
  { title: 'The Silent Patient', author: 'Alex Michaelides', releaseYear: 2019, isbn: '978-979-1kls74-4', publisher: 'Celadon Books', genre: ['Thriller', 'Misteri', 'Psikologi'], pageCount: 336 },
  { title: 'Gone Girl', author: 'Gillian Flynn', releaseYear: 2012, isbn: '978-979-1kls75-5', publisher: 'Crown', genre: ['Thriller', 'Misteri'], pageCount: 432 },
  { title: 'The Girl on the Train', author: 'Paula Hawkins', releaseYear: 2015, isbn: '978-979-1kls76-6', publisher: 'Riverhead', genre: ['Thriller', 'Misteri'], pageCount: 336 },
  { title: 'Anak Bajang Menggiring', author: 'Sindhunata', releaseYear: 1983, isbn: '978-979-1kls77-7', publisher: 'Gramedia', genre: ['Fiksi', 'Seni & Budaya'], pageCount: 400 },
  { title: 'Bumi Cinta', author: 'Habiburrahman', releaseYear: 2010, isbn: '978-979-1kls78-8', publisher: 'Republika', genre: ['Fiksi', 'Romance', 'Agama & Spiritualitas'], pageCount: 500 },
  { title: 'Ayat-Ayat Cinta', author: 'Habiburrahman', releaseYear: 2004, isbn: '978-979-1kls79-9', publisher: 'Republika', genre: ['Fiksi', 'Romance', 'Agama & Spiritualitas'], pageCount: 400 },
  { title: 'O', author: 'Eka Kurniawan', releaseYear: 2016, isbn: '978-979-1kls80-0', publisher: 'Gramedia', genre: ['Fiksi'], pageCount: 450 },
  { title: 'Raden Mandasia', author: 'Yusi Avianto', releaseYear: 2016, isbn: '978-979-1kls81-1', publisher: 'Banana', genre: ['Fiksi', 'Sejarah', 'Petualangan'], pageCount: 350 },
  { title: 'Buku Anak Pemberani', author: 'Anak Gembala', releaseYear: 2021, isbn: '978-979-1kls82-2', publisher: 'Mizan', genre: ['Anak-anak'], pageCount: 50 },
  { title: 'Cerita Binatang', author: 'Kancil', releaseYear: 2022, isbn: '978-979-1kls83-3', publisher: 'BIP', genre: ['Anak-anak'], pageCount: 40 },
  { title: 'Petualangan Dino', author: 'Dina', releaseYear: 2023, isbn: '978-979-1kls84-4', publisher: 'Bhuana', genre: ['Anak-anak'], pageCount: 60 },
  { title: 'Belajar Alfabet', author: 'Kak Seto', releaseYear: 2020, isbn: '978-979-1kls85-5', publisher: 'Gramedia Anak', genre: ['Anak-anak', 'Pendidikan'], pageCount: 30 },
  { title: 'Buku Mewarnai', author: 'Tono', releaseYear: 2019, isbn: '978-979-1kls86-6', publisher: 'Pustaka Lebah', genre: ['Anak-anak', 'Seni & Budaya'], pageCount: 20 },
  { title: 'Kamus Anak', author: 'Budi', releaseYear: 2018, isbn: '978-979-1kls87-7', publisher: 'Erlangga', genre: ['Anak-anak', 'Pendidikan'], pageCount: 100 },
  { title: 'Mengenal Warna', author: 'Susi', releaseYear: 2021, isbn: '978-979-1kls88-8', publisher: 'Grasindo', genre: ['Anak-anak'], pageCount: 45 },
  { title: 'Kisah Nabi', author: 'Ustadz Anak', releaseYear: 2022, isbn: '978-979-1kls89-9', publisher: 'Mizan', genre: ['Anak-anak', 'Agama & Spiritualitas'], pageCount: 120 },
  { title: 'One Piece Vol 1', author: 'Eiichiro Oda', releaseYear: 1997, isbn: '978-979-1kls90-0', publisher: 'Shueisha', genre: ['Komik & Manga', 'Petualangan'], pageCount: 200 },
  { title: 'Naruto Vol 1', author: 'Masashi Kishimoto', releaseYear: 1999, isbn: '978-979-1kls91-1', publisher: 'Shueisha', genre: ['Komik & Manga', 'Fantasi'], pageCount: 190 },
  { title: 'Bleach Vol 1', author: 'Tite Kubo', releaseYear: 2001, isbn: '978-979-1kls92-2', publisher: 'Shueisha', genre: ['Komik & Manga', 'Fantasi'], pageCount: 180 },
  { title: 'Detective Conan Vol 1', author: 'Gosho Aoyama', releaseYear: 1994, isbn: '978-979-1kls93-3', publisher: 'Shogakukan', genre: ['Komik & Manga', 'Misteri'], pageCount: 200 },
  { title: 'Attack on Titan Vol 1', author: 'Hajime Isayama', releaseYear: 2009, isbn: '978-979-1kls94-4', publisher: 'Kodansha', genre: ['Komik & Manga', 'Thriller'], pageCount: 208 },
  { title: 'Kimetsu no Yaiba 1', author: 'Koyoharu Gotouge', releaseYear: 2016, isbn: '978-979-1kls95-5', publisher: 'Shueisha', genre: ['Komik & Manga', 'Fantasi'], pageCount: 192 },
  { title: 'Doraemon Vol 1', author: 'Fujiko F. Fujio', releaseYear: 1970, isbn: '978-979-1kls96-6', publisher: 'Shogakukan', genre: ['Komik & Manga', 'Anak-anak'], pageCount: 180 },
  { title: 'Manga Sains', author: 'Sains Kun', releaseYear: 2020, isbn: '978-979-1kls97-7', publisher: 'Elex Media', genre: ['Komik & Manga', 'Sains & Teknologi'], pageCount: 150 },
  { title: 'Jalan Ninja', author: 'Hattori', releaseYear: 2018, isbn: '978-979-1kls98-8', publisher: 'Elex Media', genre: ['Komik & Manga', 'Petualangan'], pageCount: 160 },
  { title: 'Komik Sejarah', author: 'Bapak Sejarah', releaseYear: 2015, isbn: '978-979-1kls99-9', publisher: 'KPG', genre: ['Komik & Manga', 'Sejarah'], pageCount: 200 },
  { title: 'Horor Malam', author: 'Pocong', releaseYear: 2022, isbn: '978-979-2kls00-0', publisher: 'GagasMedia', genre: ['Horor', 'Komik & Manga'], pageCount: 100 }
]

const commentPartsA = [
  'Buku ini sungguh di luar dugaan,', 'Awalnya saya hanya iseng membaca, tapi', 'Saya menghabiskan akhir pekan penuh untuk buku ini.', 'Karya yang sangat menggugah hati,', 'Meskipun bukan genre yang biasa saya baca,', 'Jujur, ekspektasi saya tidak terlalu tinggi,', 'Sebuah bacaan yang sangat menyegarkan,', 'Saya sangat merekomendasikan karya ini,', 'Tidak bisa berhenti membalik halaman,'
]
const commentPartsB = [
  'penulisnya berhasil menangkap esensi cerita dengan sangat mendalam.', 'alur ceritanya dibangun dengan pace yang sangat brilian.', 'karakternya terasa sangat nyata, kompleks, dan manusiawi.', 'banyak pesan moral filosofis yang bisa dipetik dari setiap babnya.', 'world-building yang disajikan sangat detail, logis, dan imersif.', 'konflik yang dihadirkan sukses membuat saya ikut merasa emosional.', 'plotnya disusun rapi tanpa ada plot-hole yang mengganggu.', 'gaya bahasanya puitis namun tetap mudah dicerna oleh pembaca kasual.'
]
const commentPartsC = [
  'Setiap halamannya membuat saya terhanyut dalam imajinasi tanpa batas.', 'Sangat direkomendasikan untuk dibaca bersama secangkir kopi di waktu luang.', 'Pasti akan saya baca ulang suatu hari nanti saat saya butuh inspirasi.', 'Akhir ceritanya benar-benar tidak terduga dan memberikan kesan mendalam.', 'Benar-benar sebuah mahakarya literatur modern yang patut diapresiasi.', 'Saya bahkan sampai membelikan salinan buku ini untuk teman saya.', 'Ini akan menjadi salah satu buku favorit saya sepanjang masa.', 'Buku yang akan terus melekat di pikiran saya selama berminggu-minggu.'
]

const ALL_COMMENTS = []
for (let i = 0; i < 150; i++) {
  ALL_COMMENTS.push(`${pickRandom(commentPartsA, 1)[0]} ${pickRandom(commentPartsB, 1)[0]} ${pickRandom(commentPartsC, 1)[0]}`)
}

const FAKE_NAMES = ['Budi', 'Andi', 'Siti', 'Joko', 'Dewi', 'Rina', 'Tono', 'Yudi', 'Sari', 'Nina', 'Rudi', 'Lina', 'Eko', 'Fitri', 'Hadi', 'Maya', 'Agus', 'Dian', 'Iwan', 'Reni', 'Reza', 'Gilang', 'Putri', 'Nanda']

const getRandomComments = (count, baseDate) => {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push({
      userId: new mongoose.Types.ObjectId(), // Fake ID for random user
      userName: pickRandom(FAKE_NAMES, 1)[0],
      text: pickRandom(ALL_COMMENTS, 1)[0],
      sentiment: Math.random() > 0.2 ? 'positive' : 'neutral',
      likes: [],
      createdAt: new Date(baseDate.getTime() + Math.random() * 86400000 * 30) // random within 30 days
    })
  }
  return result
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  await User.deleteMany({})
  await Book.deleteMany({})
  await BookByUsers.deleteMany({})
  console.log('Database cleared')

  const hashed = await bcrypt.hash('Password123!', 10)
  const hashedAdmin = await bcrypt.hash('admin', 10)

  const users = await User.insertMany([
    { fullName: 'Administrator', phone: '000000000', email: 'admin@gmail.com', password: hashedAdmin, age: 30, job: 'Other', country: 'Indonesia', role: 'admin' },
    { fullName: 'Budi Santoso', phone: '081234567890', email: 'budi@gmail.com', password: hashed, age: 24, job: 'Software Engineer', country: 'Indonesia' },
    { fullName: 'Siti Rahayu', phone: '082345678901', email: 'siti@gmail.com', password: hashed, age: 29, job: 'Guru / Pengajar', country: 'Indonesia' },
    { fullName: 'Ahmad Fauzi', phone: '083456789012', email: 'ahmad@gmail.com', password: hashed, age: 35, job: 'Data Scientist', country: 'Malaysia' },
    { fullName: 'Maria Santos', phone: '084567890123', email: 'maria@gmail.com', password: hashed, age: 28, job: 'Psikolog', country: 'Philippines' },
    { fullName: 'James Wilson', phone: '085678901234', email: 'james@gmail.com', password: hashed, age: 32, job: 'Pengusaha / Entrepreneur', country: 'United States' }
  ])
  console.log(`${users.length} Users created`)

  const [admin, budi, siti, ahmad, maria, james] = users
  const regularUsers = [budi, siti, ahmad, maria, james]

  const now = Date.now()
  const books = []

  const adjectives = ['Misteri', 'Rahasia', 'Cahaya', 'Bayangan', 'Kisah', 'Legenda', 'Mimpi', 'Catatan', 'Jejak', 'Petualangan', 'Sang', 'Buku']
  const nouns = ['Malam', 'Pagi', 'Senja', 'Waktu', 'Bintang', 'Dunia', 'Angin', 'Laut', 'Hutan', 'Bulan', 'Penari', 'Pahlawan']

  for (let i = BOOK_DATA.length; i < 2900; i++) {
    BOOK_DATA.push({
      title: `${pickRandom(adjectives, 1)[0]} ${pickRandom(nouns, 1)[0]} ${i}`,
      author: `Penulis ${i}`,
      releaseYear: 2000 + (i % 25),
      isbn: `978-979-gen-${i}`,
      publisher: `Penerbit ${i % 10}`,
      genre: pickRandom(GENRES, 2),
      pageCount: 100 + (i % 400)
    })
  }

  for (let i = 0; i < BOOK_DATA.length; i++) {
    const data = BOOK_DATA[i]
    const isRecent = i < 1000
    const daysOffset = isRecent ? (1 + (i % 10)) : (20 + (i % 11))
    const regDate = daysAgo(daysOffset)
    const accessType = i % 3 === 0 ? 'sale' : 'free'

    const optionals = []
    if (i < 5) {
      optionals.push({ key: 'ebook_url', label: 'E-Book PDF', type: 'ebook', value: `https://fakeebooks.io/${data.isbn}.pdf` })
    }
    if (i >= 5 && i < 10) {
      optionals.push({ key: 'audio_url', label: 'Audio Player', type: 'audio', value: `https://fakeaudio.io/${data.isbn}.mp3` })
    }

    const numComments = 20 + Math.floor(Math.random() * 81) // 20 to 100 comments
    const generatedComments = getRandomComments(numComments, regDate)
    const avgRating = 3.5 + Math.random() * 1.5
    const numRatings = numComments + Math.floor(Math.random() * 50)

    const genre = [...data.genre]
    if (Math.random() > 0.8) genre.push('Promo')

    books.push({
      ...data,
      genre,
      coverImage: cover(data.isbn.replace(/[^a-z0-9]/gi, '')),
      accessType,
      price: accessType === 'sale' ? 0 : 0,
      status: 'active',
      shelf: 'cold',
      optionalAttributes: optionals,
      registeredAt: regDate,
      createdAt: regDate,
      updatedAt: regDate,
      totalViews: numRatings * 3,
      uniqueViewers: numRatings,
      totalComments: numComments,
      totalRatings: numRatings,
      averageRating: parseFloat(avgRating.toFixed(2)),
      weightedRating: computeWeightedRating(avgRating, numRatings, 3, 10, 5),
      clickLogs: [],
      embeddedComments: generatedComments.sort((a, b) => b.createdAt - a.createdAt),
      embeddedRatings: []
    })
  }

  // Insert in batches to prevent payload too large errors
  console.log('Inserting books in batches...')
  const createdBooks = []
  for (let i = 0; i < books.length; i += 500) {
    const batch = books.slice(i, i + 500)
    const docs = await Book.insertMany(batch, { timestamps: false })
    createdBooks.push(...docs)
    console.log(`Inserted ${createdBooks.length} / ${books.length}`)
  }

  const recentBooks = createdBooks.filter((_, i) => i < 1000)
  const oldBooks = createdBooks.filter((_, i) => i >= 1000)

  const hotCandidates = recentBooks.slice(0, 15)
  const mostCommentedBooks = recentBooks.slice(15, 30)
  const mostViewedBooks = recentBooks.slice(30, 45)
  const coldAvoidBooks = [...recentBooks.slice(45, 60), ...oldBooks.slice(0, 15)]
  const sepiBooks = oldBooks.slice(15)

  console.log('Injecting HOT SHELF interactions...')
  for (const book of hotCandidates) {
    const clicks = []
    for (const u of regularUsers) {
      for (let c = 0; c < 25; c++) {
        clicks.push({ userId: u._id.toString(), ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, ts: daysAgo(Math.random() * 10) })
      }
    }
    const ratings = regularUsers.map(u => ({ userId: u._id, score: 4 + Math.round(Math.random()), createdAt: daysAgo(Math.random() * 10) }))
    const avgRating = ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    const wr = computeWeightedRating(avgRating, ratings.length, 3, 10, 5)

    await Book.findByIdAndUpdate(book._id, {
      $push: { clickLogs: { $each: clicks.slice(0, 150) } },
      $inc: { totalViews: clicks.length, uniqueViewers: regularUsers.length },
      shelf: 'hot'
    })
  }

  console.log('Injecting MOST COMMENTED interactions...')
  for (const book of mostCommentedBooks) {
    const clicks = regularUsers.flatMap(u => Array.from({ length: 5 }, () => ({ userId: u._id.toString(), ip: '10.1.1.1', ts: daysAgo(Math.random() * 10) })))
    await Book.findByIdAndUpdate(book._id, {
      $push: { clickLogs: { $each: clicks } },
      $inc: { totalViews: clicks.length, uniqueViewers: regularUsers.length }
    })
  }

  console.log('Injecting MOST VIEWED interactions...')
  for (const book of mostViewedBooks) {
    const clicks = []
    for (const u of regularUsers) {
      for (let c = 0; c < 35; c++) {
        clicks.push({ userId: u._id.toString(), ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, ts: daysAgo(Math.random() * 13) })
      }
    }
    await Book.findByIdAndUpdate(book._id, {
      clickLogs: clicks.slice(0, 150),
      totalViews: clicks.length,
      uniqueViewers: regularUsers.length
    })
  }

  console.log('Injecting COLD / IS AVOID interactions...')
  for (let i = 0; i < coldAvoidBooks.length; i++) {
    const book = coldAvoidBooks[i]
    const isAvoid = i < 4
    if (isAvoid) {
      const ratings = regularUsers.slice(0, 2).map(u => ({ userId: u._id, score: 1 + Math.round(Math.random()), createdAt: daysAgo(Math.random() * 25) }))
      const avgRating = ratings.reduce((s, r) => s + r.score, 0) / ratings.length
      await Book.findByIdAndUpdate(book._id, {
        $push: { embeddedRatings: { $each: ratings } },
        $inc: { totalRatings: ratings.length },
        averageRating: parseFloat(avgRating.toFixed(2)),
        weightedRating: computeWeightedRating(avgRating, ratings.length, 3, 10, 22)
      })
    }
  }

  console.log('Injecting User genre preferences and myRatings/myComments...')

  const budiLikes = hotCandidates.flatMap(b => b.genre)
  const sitiAvoids = coldAvoidBooks.slice(0, 2).flatMap(b => b.genre)

  await User.findByIdAndUpdate(budi._id, {
    genrePreferences: {
      liked: [...new Set(budiLikes)].map(g => ({ genre: g, score: 3 })),
      avoided: []
    },
    myRatings: hotCandidates.slice(0, 2).map(b => ({ bookId: b._id, score: 5, createdAt: daysAgo(2) })),
    myComments: hotCandidates.slice(0, 2).map(b => ({ bookId: b._id, text: 'Buku ini sangat bagus!', sentiment: 'positive', createdAt: daysAgo(2) })),
    viewedBooks: hotCandidates.map(b => ({ bookId: b._id, count: 3, lastViewed: daysAgo(1) })),
    myRecommendation: { bookId: hotCandidates[0]._id, reason: 'view on buku hot', source: 'view', lockedAt: daysAgo(5) }
  })

  await User.findByIdAndUpdate(siti._id, {
    genrePreferences: {
      liked: [],
      avoided: [...new Set(sitiAvoids)].map(g => ({ genre: g, score: 2 }))
    },
    myRatings: coldAvoidBooks.slice(0, 2).map(b => ({ bookId: b._id, score: 2, createdAt: daysAgo(15) })),
    myComments: coldAvoidBooks.slice(0, 1).map(b => ({ bookId: b._id, text: 'Buku ini jelek dan membosankan.', sentiment: 'negative', createdAt: daysAgo(15) })),
    viewedBooks: coldAvoidBooks.slice(0, 2).map(b => ({ bookId: b._id, count: 1, lastViewed: daysAgo(14) }))
  })

  console.log('Creating BookByUsers checkout records...')

  const checkoutMap = [
    { user: budi, books: hotCandidates.slice(0, 3) },
    { user: siti, books: hotCandidates.slice(1, 4) },
    { user: ahmad, books: mostCommentedBooks.slice(0, 2) },
    { user: maria, books: mostViewedBooks.slice(0, 2) },
    { user: james, books: [...hotCandidates.slice(0, 1), ...mostViewedBooks.slice(0, 2)] }
  ]

  for (const entry of checkoutMap) {
    await BookByUsers.create({
      userId: entry.user._id,
      books: entry.books.map(b => ({ bookId: b._id, acquiredAt: daysAgo(Math.random() * 7), lastReadAt: daysAgo(Math.random() * 3) }))
    })
  }
  console.log(`${checkoutMap.length} BookByUsers records created`)

  const hotIds = new Set(hotCandidates.map(b => b._id.toString()))
  for (const b of createdBooks) {
    if (hotIds.has(b._id.toString())) {
      await Book.findByIdAndUpdate(b._id, { shelf: 'hot' })
    }
  }
  console.log('Shelf assignments finalized')

  console.log('\n==============================')
  console.log('SEEDING COMPLETE')
  console.log('==============================')
  console.log(`Users:        ${users.length}  (1 admin + 5 reguler)`)
  console.log(`Books:        ${createdBooks.length}`)
  console.log(`Hot Shelf:    ${hotCandidates.length} buku`)
  console.log(`Most Comment: ${mostCommentedBooks.length} buku`)
  console.log(`Most Viewed:  ${mostViewedBooks.length} buku`)
  console.log(`Cold/Avoid:   ${coldAvoidBooks.length} buku`)
  console.log(`BookByUsers:  ${checkoutMap.length} records`)
  console.log('==============================\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1) })
