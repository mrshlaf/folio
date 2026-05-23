# Folio - Tiered Dynamic Bookstore Catalog

[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Backend](https://img.shields.io/badge/Backend-Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Language](https://img.shields.io/badge/Language-JavaScript%20%2B%20Python-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Presentasi Google Slides](https://docs.google.com/presentation/d/1B0pZcFQl2AkYLTdbVkl2nElRr5kXA7PU-qSTqfiylLw/edit?slide=id.p#slide=id.p)

## Dokumentasi Lengkap
Untuk pemahaman yang lebih komprehensif mengenai proyek ini, silakan baca dokumen pendukung yang tersedia pada folder `docs/`:
* [Laporan Komprehensif Folio (PDF)](docs/Folio_MiniProject_SBD5_Pagi.pdf)
* [Studi Kasus & Arsitektur Sistem (Markdown)](docs/architecture_and_case_study.md)

**Folio** adalah sistem katalog toko buku canggih tingkat lanjut (advanced bookstore information system) yang dirancang secara khusus untuk memecahkan tantangan skalabilitas, fleksibilitas skema, dan performa tinggi pada e-commerce retail buku berskala masif. Terinspirasi langsung dari model bisnis toko buku online terbesar di Indonesia (Periplus), sistem ini mengelola ratusan ribu SKU produk yang memiliki variabilitas atribut sangat tinggi.

Proyek ini dibangun menggunakan paradigma **NoSQL Document Store (MongoDB)** untuk secara komprehensif membuktikan keunggulan performa, efisiensi alokasi memori, serta fleksibilitas skema jika dibandingkan dengan arsitektur database relasional tradisional (RDBMS/SQL).

---

## Latar Belakang & Problem Statement

### 1. Masalah pada Sistem Relasional (RDBMS) Konvensional
Pada toko buku skala besar seperti Periplus, inventaris memiliki atribut yang sangat dinamis:
* **Buku Baru / Kaya Fitur**: Hadir dengan ulasan interaktif, file pendukung digital (seperti e-book, voucher akses, CD sumber daya), dan metadata yang sangat detail.
* **Buku Lama / Arsip**: Hanya memiliki metadata dasar (judul, penulis, tahun terbit). Buku lama tidak membutuhkan field digital, sistem ulasan berkala, atau rating dinamis.

Jika menggunakan **RDBMS konvensional**, semua baris dalam tabel harus mematuhi skema yang seragam secara rigid:
1. **Pemborosan Alokasi Memori (NULL Padding)**: Jutaan baris buku lama terpaksa diisi dengan nilai NULL untuk kolom-kolom baru (seperti file digital, ulasan, dkk.), memboroskan alokasi memori disk dan index lookup.
2. **Overhead Skema Migrasi (ALTER TABLE)**: Penambahan satu atribut baru pada edisi buku terbaru mengharuskan eksekusi perintah ALTER TABLE pada tabel berisi jutaan baris, memicu database lock yang lama, merusak ketersediaan layanan (downtime), serta memiliki risiko kehilangan data yang sangat besar.

### 2. Solusi Document Store (MongoDB)
MongoDB dipilih karena memiliki fitur bawaan (native) yang menjadi solusi langsung bagi kendala di atas:
* **Schema Flexibility**: Dokumen dalam satu collection dapat memiliki struktur field yang berbeda secara organik tanpa memaksa migrasi skema global. Buku baru dan lama hidup berdampingan secara harmonis.
* **Denormalized Embedding**: Memungkinkan ulasan, klik log, dan sub-atribut di-embed langsung dalam dokumen buku yang bersangkutan, meminimalkan round-trip query database.
* **Materialized Views Native Support**: Pola pre-aggregated summary document diimplementasikan dengan sangat syarat tanpa terikat skema rigid seperti MATERIALIZED VIEW RDBMS konvensional.

---

## Fitur Utama & Arsitektur

![Data Model ERD](images/data_model_erd.png)

```mermaid
flowchart TD
    Customer([CUSTOMER ACCESS]) --> API[api/search/homepage]
    API -->|Instant Fetch| Summary[(COLLECTION: summary_blobs<br>Pre-aggregated Materialized)]
    
    Worker{BACKGROUND WORKER<br>shelfManager.js / materializeViews.js}
    Worker -.->|Periodic Update every 30m| Summary
    Worker -.->|Prunes & Promotes| Books[(COLLECTION: books)]
    
    subgraph Tier [Data Tiering]
        Hot[HOT SHELF DOCS<br>Embedded, Rich]
        Cold[COLD SHELF DOCS<br>Minimalist]
    end
    Books --- Tier
    
    ClickLogs[(COLLECTION: click_logs)] -->|Append click log| Books
```

### 1. Dynamic Data Tiering (Hot Shelf vs Cold Shelf)
Sistem secara aktif memisahkan dokumen berdasarkan tingkat keaktifan data:
* **Hot Shelf (Active Tier)**: Dokumen dengan skema lengkap. Memiliki atribut digital (features), array ulasan ter-embed (embeddedComments maksimal 5), average_rating dan weightedRating yang sudah dihitung, serta log klik aktif.
* **Cold Shelf (Archived Tier)**: Dokumen minimalis hasil data mounting dari buku-buku lama. Field seperti features, embeddedComments, dan embeddedRatings sama sekali tidak dibuat di level database, sehingga menghemat ukuran dokumen hingga 75% per baris.

### 2. Automated Shelf Promotion (Promosi Rak Otomatis)
Sistem mengotomatiskan siklus hidup data (data lifecycle) melalui background worker (shelfManager.js):
1. **Logging Interaksi**: Setiap klik user dicatat secara append-only di sub-dokumen clickLogs.
2. **Siklus Evaluasi**: Setiap 30 menit, scheduler node-cron memantau frekuensi klik.
3. **Trigger Promosi**: Jika klik pada buku Cold Shelf melewati threshold popularitas dalam 30 hari terakhir, worker memicu promosi otomatis: menambahkan field features, embeddedComments, has_more_comments, lalu mengubah status shelf menjadi "hot".

### 3. Materialized Views via "Summary Blobs"
Untuk memotong kebutuhan komputasi agregasi, sort, dan filter saat user menjelajah katalog:
* **Struktur Blob**: Koleksi summary_blobs bertindak sebagai Materialized Views siap pakai. Terdapat 5 kombinasi topik: waktu_alfabet, waktu_genre, genre_alfabet, waktu_rating (All Times Great), dan genre_rating (Top Leading).
* **Embedded Parsial**: Setiap dokumen blob menyimpan daftar buku yang di-embed secara parsial (hanya field judul, penulis, harga, rating) yang cukup untuk render antarmuka kartu katalog.
* **Routing Efisien**: Ketika user mengklik kategori, server tidak menjalankan agregasi dinamis pada jutaan baris data, melainkan memanggil satu dokumen blob secara langsung:
  ```javascript
  db.summary_blobs.find({ primary_topic: "waktu" }).sort({ average_click_rate: -1 })
  ```
  Ini menghasilkan respons instan seolah-olah data diakses dari caching layer.

### 4. Bayesian 3D Weighted Rating & Sentiment Analysis
Untuk memvalidasi ulasan secara adil dan menangkal kecurangan rating (rating manipulation):
* **Rumus Bayesian Weighted**:
  $$\text{Weighted Score} = \frac{v \cdot R + m \cdot C}{v + m} \times \text{Time Decay Factor}$$
  Dimana v adalah jumlah ulasan buku tersebut, R adalah rata-rata ulasan buku, m adalah batas minimal ulasan agar masuk perhitungan, dan C adalah rata-rata rating di seluruh katalog.
* **Time Decay**: Rating ulasan baru memiliki bobot yang lebih tinggi dibanding ulasan lama agar katalog mencerminkan tren saat ini secara akurat.
* **Regex Sentiment Analysis**: Backend menyaring komentar menggunakan regular expression untuk mendeteksi sentimen kata (misal: "jelek", "kecewa", "luar biasa"). Komentar bersentimen negatif yang dipadukan dengan bintang tinggi akan disesuaikan bobotnya agar rating tetap objektif.

---

## Hasil Uji Performa Mendalam (MongoDB Atlas vs Neon SQL)

Pengujian performa dijalankan secara langsung oleh script compare_neon.py pada lingkungan server produksi terdistribusi (MongoDB Atlas Cloud vs Neon PostgreSQL Serverless Cloud).

Berikut adalah grafik hasil pengujian yang terekam pada server kami:

![Performance Benchmark Results](images/benchmark_results.png)

### **Analisis Teknis & Pembahasan Mendalam Skenario Uji**

#### **Skenario 1: Read & Calc (Detailed Fetch)**
* **MongoDB Atlas (Single Doc Fetch + Math)**: 0.01805 detik
* **Neon SQL (Relation Join + Math)**: 0.50963 detik
* **Analisis**: **SQL 28.2 kali lebih lambat**. Pada MongoDB, data ulasan (ratings) disimpan ter-embed di dalam dokumen buku. Operasi baca hanya perlu memuat satu dokumen tunggal (Single Doc Fetch). Pada SQL, data tersebar di tabel books dan ratings. SQL harus mencari baris terkait, melakukan alokasi memori untuk menggabungkan tabel (JOIN), dan memfilter ulasan sebelum melakukan kalkulasi. Hal ini menimbulkan overhead CPU dan IO yang sangat tinggi pada SQL.

#### **Skenario 2: Sorting & Limit (Top Rated)**
* **MongoDB Atlas (Sort by Title + Limit 10)**: 0.07655 detik
* **Neon SQL (Sort by Title + Limit 10)**: 0.25161 detik
* **Analisis**: **SQL 3.2 kali lebih lambat**. MongoDB memanfaatkan pengurutan berbasis index B-Tree pada field koleksi tunggal. Pada Neon SQL cloud, operasi query sorting dinamis dibatasi oleh latensi bolak-balik jaringan (network round-trip latency) dan overhead parsing rencana eksekusi query relasional (Query Optimizer Execution Plan).

#### **Skenario 3: Bulk Scan (Many-to-Many Simulation)**
* **MongoDB Atlas (Scan All Documents)**: 0.01763 detik
* **Neon SQL (Complex Group By + Join)**: 0.28362 detik
* **Analisis**: **SQL 16.1 kali lebih lambat**. Query SQL menggunakan LEFT JOIN dan GROUP BY untuk menghitung ulasan per buku secara massal. Query ini memaksa RDBMS melakukan pemindaian tabel penuh (Full Table Scan) dan kalkulasi agregasi dinamis pada memori temporer server SQL. Di MongoDB, operasi ini adalah pembacaan dokumen sederhana tanpa relation overhead.

#### **Skenario 4: Delete Performance (Cascade Cleanup)**
* **MongoDB Atlas (Delete One)**: 0.10962 detik
* **Neon SQL (Delete Ratings + Book + Commit)**: 0.75637 detik
* **Analisis**: **SQL 6.9 kali lebih lambat**. Agar tidak melanggar batasan integritas data kunci asing (Foreign Key Constraints), SQL harus melakukan transaksi berlapis: menghapus baris terkait di tabel anak (ratings) terlebih dahulu, kemudian menghapus baris di tabel induk (books), dan terakhir melakukan operasi penulisan transaksi fisik (COMMIT). MongoDB hanya memerlukan satu operasi penulisan hapus dokumen karena ulasannya bersifat terpadu (self-contained).

#### **Skenario 5: Multi-Level Relational Join (3-Table)**
* **MongoDB Atlas (Aggregate $lookup)**: 0.06128 detik
* **Neon SQL (3-Table Join)**: 0.51377 detik
* **Analisis**: **SQL 8.4 kali lebih lambat**. SQL melakukan penggabungan tiga tabel sekaligus (users -> ratings -> books) untuk memetakan buku yang pernah diulas pengguna. Ini membutuhkan pencarian silang indeks relasional (nested loop join / hash join) yang intensif. MongoDB, meskipun menggunakan operator $lookup, mengeksekusinya di atas arsitektur kompresi memori WiredTiger yang sangat efisien.

#### **Skenario 6: Substring / Search Performance (Fuzzy Search)**
* **MongoDB Atlas (Regex Search)**: 0.10859 detik
* **Neon SQL (ILIKE Search)**: 0.25604 detik
* **Analisis**: **SQL 2.3 kali lebih lambat**. Pencarian dengan operator ILIKE %Book% di SQL memaksa mesin database melakukan pemindaian menyeluruh di setiap baris karena indeks B-Tree biasa tidak dapat bekerja pada wildcard kiri. MongoDB melakukan evaluasi regex berbasis mesin pencari internal secara jauh lebih optimal.

---

## Struktur Proyek & Abstraksi Kode

### **Backend Layout (backend/)**
```
backend/
 server.js              # Entry point utama, Express app & scheduler cron
 models/
    User.js            # Skema User (menyimpan profil, preferensi genre)
    Book.js            # Skema Utama Buku (Cold/Hot Shelf & embedded arrays)
    BookByUsers.js     # Antisipasi Wide-Column (relasi peminjaman buku)
 middleware/
    auth.js            # Guard JWT Token & decoding session
    adminOnly.js       # Guard hak akses administratif (Role-based)
 routes/
    authRoutes.js      # Endpoint pendaftaran & otorisasi
    bookRoutes.js      # Endpoint CRUD Buku, interaksi rating & checkout
    userRoutes.js      # Endpoint profil & histori perpustakaan user
    searchRoutes.js    # Endpoint homepage, search, & 7 materialized views
 controllers/
    authController.js  # Kontrol logika registrasi (validasi ketat) & login
    bookController.js  # Kontrol logika manipulasi atribut buku & ulasan
    userController.js  # Kontrol manajemen data pribadi & rak user
    searchController.js# Kontrol homepage dinamis & materialized views
 utils/
     seedAdmin.js       # Auto-seeding Administrator pada inisialisasi awal
     shelfManager.js    # Manajer Pruning log & Algoritma Promosi Buku
     weightedRating.js  # Utilitas Bayesian 3D & Regex Sentimen Analisis
     materializeViews.js# Pembuat & Pembaru summary blobs (Materialized Views)
```

---

## Panduan Instalasi & Menjalankan Proyek

### **Prasyarat Sistem**
* Node.js (Rekomendasi v18.x atau LTS terbaru)
* Python 3.x (wajib untuk menjalankan pengujian benchmark database)
* MongoDB Atlas Account (atau install MongoDB Community Server lokal)

---

### **Langkah 1: Kloning & Pengaturan Environment**
1. Buka terminal Anda, masuk ke dalam folder repositori proyek:
   ```powershell
   cd c:\Github\folio\backend
   ```
2. Buat file `.env` di dalam folder `backend/` tersebut. Masukkan parameter konfigurasi berikut secara tepat:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/folio_db?retryWrites=true&w=majority
   JWT_SECRET=katalog_buku_tutam10_super_secret_2025
   JWT_EXPIRES_IN=7d
   NEON_URI=postgresql://neondb_owner:npg_pcw3PyV0Jsme@ep-dry-rice-aqyuig81-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   > [!NOTE]
   > Jika Anda menemui kendala koneksi ke database cloud, pastikan Anda telah memasukkan alamat IP publik Anda saat ini ke dalam Network Access MongoDB Atlas (atau gunakan IP 0.0.0.0/0 untuk akses dari jaringan mana saja).

---

### **Langkah 2: Menjalankan Server Backend**
1. Di dalam direktori `backend/`, pasang seluruh dependensi yang diperlukan:
   ```powershell
   npm install
   ```
2. Jalankan server dalam mode development:
   ```powershell
   npm run dev
   ```
   *Server backend akan mendeteksi file `.env`, menginisialisasi server Express di Port 5000, melakukan seeding otomatis akun admin default (admin@gmail.com / admin), dan mengaktifkan scheduler otomatis.*

---

### **Langkah 3: Menjalankan Aplikasi Frontend**
1. Buka tab terminal baru, kemudian masuk ke direktori frontend:
   ```powershell
   cd c:\Github\folio\frontend
   ```
2. Pasang modul dependensi frontend React:
   ```powershell
   npm install
   ```
3. Jalankan server development Vite:
   ```powershell
   npm run dev
   ```
4. Buka tautan lokal `http://localhost:5173` pada browser Anda untuk mengakses sistem visual katalog Folio.

---

### **Langkah 4: Menjalankan Uji Perbandingan Performa (Python)**
Untuk menjalankan ulang simulasi benchmarking MongoDB Atlas vs Neon SQL:
1. Pastikan Anda telah menginstal compiler Python 3.
2. Di dalam direktori `backend/`, pasang modul penghubung database yang dibutuhkan Python:
   ```powershell
   pip install psycopg2-binary pymongo python-dotenv
   ```
3. Eksekusi script penguji:
   ```powershell
   python compare_neon.py
   ```
   *Script akan membersihkan sisa pengujian sebelumnya, membuat tabel di Neon, melakukan seeding data secara sinkron, mengeksekusi 6 skenario query secara head-to-head, lalu menampilkan detail latensi serta kesimpulan rasionya.*

---

### **Langkah 5: Menjalankan Load Testing Konkurensi (k6)**
Untuk mensimulasikan beban puncak (load spike) oleh puluhan pengguna bersamaan:
1. Pastikan program k6 sudah terpasang dan Anda telah membuka terminal baru.
2. Pastikan server backend sedang aktif berjalan di Port 5000.
3. Jalankan perintah berikut di direktori `backend/`:
   ```powershell
   k6 run load_test.js
   ```
   *k6 akan secara bertahap meningkatkan trafik hingga 20 virtual users aktif untuk menguji performa endpoint Materialized Views vs Search dinamis Anda.*

---

## Identitas Anggota Kelompok 5 - SBD Pagi
| Nama Lengkap | NPM | Peran & Tanggung Jawab Teknis |
| :--- | :--- | :--- |
| **Andhika Fadhlan Wijanarko** | 2306267164 | Backend Development, Database Architecture & Query Optimization |
| **Marshal Aufa Diliyana** | 2406346913 | Backend Development, API Integration & Dynamic Logic Seeding |
| **Reinathan Ezkhiel** | 2406397675 | Data Engineering, Database Seeding & Python Benchmarking Script |
| **Arkaan Pasya Seplitara** | 2406408073 | Frontend Development, UI/UX Design & State Management React |
| **Diandra Pramesti Wicaksono** | 2406342360 | Frontend Development, API Consumer & Comprehensive System Testing |

---

## Lisensi
Proyek ini dilisensikan di bawah **MIT License**. Silakan lihat file [LICENSE](LICENSE) untuk detail selengkapnya.
