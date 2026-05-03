# 🧱 UPDATE FINAL — ENUM SUPPORT STATUS (INDONESIA VERSION)

```
enum SupportStatus {
  TERKUNCI
  MENGARAH
  DINAMIS
}

enum BpdCharacteristic {
  SOLID
  RENTAN
  WASPADA
}
```

---

# 🧠 PENJELASAN SINGKAT (BIAR GA AMBIGU)

## 🟢 SupportStatus (Indonesia version)

- **TERKUNCI**
→ dukungan sudah final ke 1 kandidat
- **MENGARAH**
→ kecenderungan kuat tapi belum final
- **DINAMIS**
→ masih berubah / belum stabil

---

## 🟡 Kenapa enum Indonesia lebih cocok di kasus ini?

Karena:

- dipakai langsung di UI & dashboard
- dipahami user non-teknis
- bukan internal logic system-only
- ini “business state”, bukan “engine keyword”

---

# ⚠️ RULE FINAL (BIAR KONSISTEN)

## ❌ Jangan:

- campur ENG + ID dalam enum yang sama
- bikin alias (LOCKED + TERKUNCI barengan)

## ✅ Harus:

- enum = Indonesia (business layer)
- schema = English (data layer)
- value = Indonesia (UI layer)

---

# 🧱 IMPACT KE SCHEMA LAIN

Yang lain **TIDAK berubah**:

- `Candidate` → tetap English
- `Bpd` → tetap English
- `BpdSupport` → tetap English
- field indikator → tetap English boolean flags
- data isi → Indonesia di seed/UI

---

# 🚀 RESULT

Sekarang sistem lo jadi:

✔ schema engineering clean (English)

✔ business state natural (Indonesia)

✔ UI readable tanpa mapping aneh

✔ ready production tanpa translator layer

---

# 🗃️ DATABASE SCHEMA - ELECTORAL ANALYTICS ENGINE

**Version**: v0.0.1 | **Status**: Production Ready | **Last Updated**: May 3, 2026

---

## 📋 OVERVIEW

Database schema untuk sistem analitik electoral yang mengelola data BPD (Badan Pengurus Daerah), kandidat, dan dukungan politik dengan fitur lengkap untuk tracking perubahan, notifikasi real-time, dan manajemen data komprehensif.

---

## 🏗️ CORE TABLES

### 1. `Candidate`
```sql
CREATE TABLE Candidate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### 2. `Bpd`
```sql
CREATE TABLE Bpd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provinceName VARCHAR(255) NOT NULL,
  totalVotes INTEGER NOT NULL,
  targetMc VARCHAR(255),
  politicalAffiliation VARCHAR(255),
  supportStatus SupportStatus NOT NULL,
  characteristic BpdCharacteristic NOT NULL,
  suratBaiat BOOLEAN DEFAULT FALSE,
  afiliasiPolitik BOOLEAN DEFAULT FALSE,
  videoDukungan BOOLEAN DEFAULT FALSE,
  kedekatanMc BOOLEAN DEFAULT FALSE,
  atributFisik BOOLEAN DEFAULT FALSE,
  sosialMedia BOOLEAN DEFAULT FALSE,
  score INTEGER NOT NULL,
  estimatedVotes INTEGER NOT NULL,
  supportedCandidateId UUID REFERENCES Candidate(id),
  updatedById UUID NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### 3. `User`
```sql
CREATE TABLE User (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role UserRole NOT NULL DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 ENUMS (INDONESIA BUSINESS LAYER)

### `SupportStatus`
```sql
CREATE TYPE SupportStatus AS ENUM (
  'TERKUNCI',    -- dukungan sudah final ke 1 kandidat
  'MENGARAH',    -- kecenderungan kuat tapi belum final  
  'DINAMIS'      -- masih berubah / belum stabil
);
```

### `BpdCharacteristic`
```sql
CREATE TYPE BpdCharacteristic AS ENUM (
  'SOLID',       -- dukungan kokoh, tidak mudah berubah
  'RENTAN',      -- rentan terhadap pengaruh eksternal
  'WASPADA'      -- perlu diwaspadai, potensi berubah
);
```

### `UserRole`
```sql
CREATE TYPE UserRole AS ENUM (
  'SUPERADMIN',
  'ADMIN', 
  'USER'
);
```

---

## 📊 INDICATOR POINT SYSTEM

Setiap indikator memiliki nilai bobot yang menghitung ke total skor:

| Kategori | Indikator | Bobot | Field |
|-----------|-----------|-------|-------|
| Internal | Surat Baiat / Rekomendasi Resmi | 5.5 | `suratBaiat` |
| Eksternal | Afiliasi Politik Lokal | 4.2 | `afiliasiPolitik` |
| Internal | Video Dukungan Resmi | 3.8 | `videoDukungan` |
| Eksternal | Kedekatan Personal MC | 3.2 | `kedekatanMc` |
| Internal | Atribut Fisik | 2.1 | `atributFisik` |
| Internal | Sosial Media | 1.2 | `sosialMedia` |

**Total maksimal: 20.0 poin**

### LOGIKA PERHITUNGAN

#### Total Poin
```
Total Poin = jumlah indikator yang terpenuhi
Maksimal = 20
```

#### Skor Probabilitas
```
Skor (%) = Total Poin × 5
```

#### Estimasi Suara
```
Estimasi Suara = (Skor / 100) × 5
```

#### Total Suara Efektif
```
Total Suara Efektif = Σ estimasi suara semua BPD
```

---

## 🔗 RELATIONSHIPS

- `Bpd.supportedCandidateId` → `Candidate.id` (optional)
- `Bpd.updatedById` → `User.id` (required)

---

## 🎨 UI COLOR CODING

### Status Dukungan
- **TERKUNCI**: `bg-green-100 text-green-700`
- **MENGARAH**: `bg-yellow-100 text-yellow-700`
- **DINAMIS**: `bg-blue-100 text-blue-700`

### Karakteristik
- **SOLID**: `bg-emerald-100 text-emerald-700`
- **RENTAN**: `bg-orange-100 text-orange-700`
- **WASPADA**: `bg-purple-100 text-purple-700`

### Caketum
- Menggunakan warna fixed berdasarkan PRD:
  - Reynaldo Bryan (Nasdem): #4F46E5
  - Ade Jona (Gerindra): #DC2626
  - Afie Kalla (Golkar): #F59E0B
  - Anthony Leong (Gerindra): #10B981

---

## 📝 INDEXES

```sql
-- Performance indexes
CREATE INDEX idx_bpd_support_status ON Bpd(supportStatus);
CREATE INDEX idx_bpd_characteristic ON Bpd(characteristic);
CREATE INDEX idx_bpd_candidate ON Bpd(supportedCandidateId);
CREATE INDEX idx_bpd_updated_at ON Bpd(updatedAt);
CREATE INDEX idx_user_role ON User(role);
```

---

## 🔐 SECURITY

- Password menggunakan hash (bcrypt/scrypt)
- JWT token untuk authentication
- Role-based access control (RBAC)

---

## 📈 ANALYTICS FEATURES

### Scoring System
- Score = Σ(indikator yang terpenuhi × poin)
- Estimated votes calculated dari score × total votes
- Real-time score updates saat indikator berubah

### Filtering & Search
- Filter by status, characteristic, candidate
- Search by province name
- Sorting by score, votes, update time

### Export Features
- CSV export untuk data analysis
- Snapshot system untuk backup/restore (SUPERADMIN only)

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
API_BASE_URL=http://localhost:3001
```

### Migration Strategy
1. Create enums first
2. Create tables with foreign keys
3. Insert seed data (candidates, users)
4. Run analytics migration for existing data

---

## 📋 DATA SEEDING

### Default Candidates
```sql
INSERT INTO Candidate (name, affiliation) VALUES 
  ('Reynaldo Bryan', 'Nasdem'),
  ('Ade Jona', 'Gerindra'),
  ('Afie Kalla', 'Golkar'),
  ('Anthony Leong', 'Gerindra');
```

### Default Users
```sql
INSERT INTO User (username, email, password, role) VALUES
  ('superadmin', 'super@admin.com', '$2b$10$...', 'SUPERADMIN'),
  ('admin', 'admin@system.com', '$2b$10$...', 'ADMIN'),
  ('user', 'user@system.com', '$2b$10$...', 'USER');
```

---

## 🔄 VERSION HISTORY

### v1.0.0 (Current)
- Core BPD management system
- Indonesia enum for business logic
- Point-based scoring system
- Role-based permissions
- Real-time analytics dashboard

---

## 🎯 BEST PRACTICES

1. **Schema Language**: English untuk consistency
2. **Business Logic**: Indonesia untuk user readability  
3. **UI Labels**: Indonesia langsung dari enum values
4. **Error Messages**: Indonesia untuk user-friendly
5. **API Responses**: English untuk consistency

---

## ⚡ PERFORMANCE OPTIMIZATION

- Database connection pooling
- Redis caching untuk frequent queries
- Pagination untuk large datasets
- Background jobs untuk analytics calculations