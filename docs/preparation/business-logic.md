# 🧠 BUSINESS LOGIC & SYSTEM ARCHITECTURE

---

## 📋 OVERVIEW

Dokumen ini menjelaskan logika bisnis, arsitektur sistem, dan implementasi perhitungan scoring untuk Electoral Analytics Engine HIPMI.

---

## 🏗️ SYSTEM ARCHITECTURE

### Data Flow
```
Frontend (React) → API (Express) → Database (PostgreSQL)
        ↓                    ↓                ↓
    UI Display        Business Logic    Data Storage
```

---

## 💾 DATA STORAGE vs CALCULATION LOGIC

### 🗄️ **Yang Disimpan di Database**

#### 1. **Master Data (Static)**
- `Candidate` - Nama dan afiliasi kandidat
- `User` - Data user dan role permissions
- `Bpd` - Data dasar provinsi dan indikator boolean

#### 2. **Transactional Data**
- `Bpd.suratBaiat` - Boolean flag
- `Bpd.afiliasiPolitik` - Boolean flag  
- `Bpd.videoDukungan` - Boolean flag
- `Bpd.kedekatanMc` - Boolean flag
- `Bpd.atributFisik` - Boolean flag
- `Bpd.sosialMedia` - Boolean flag
- `Bpd.supportedCandidateId` - Foreign key ke candidate
- `Bpd.supportStatus` - Enum (TERKUNCI/MENGARAH/DINAMIS)
- `Bpd.characteristic` - Enum (SOLID/RENTAN/WASPADA)

#### 3. **Computed Fields (Real-time)**
- `Bpd.score` - Di-calculate saat create/update
- `Bpd.estimatedVotes` - Di-calculate saat create/update
- `Bpd.updatedAt` - Timestamp perubahan

---

### ⚙️ **Yang Di-calculate Real-time (Hardcoded)**

#### 1. **Indicator Weights** (Hardcoded)
```typescript
export const INDICATOR_WEIGHTS = {
  suratBaiat: 5.5,      // Internal: Dokumen resmi
  afiliasiPolitik: 4.2, // Eksternal: Politik lokal
  videoDukungan: 3.8,   // Internal: Video terverifikasi
  kedekatanMc: 3.2,     // Eksternal: Jejaring MC
  atributFisik: 2.1,    // Internal: Simbol publik
  sosialMedia: 1.2,     // Internal: Interaksi informal
} as const;
```

#### 2. **Constants** (Hardcoded)
```typescript
export const MAX_SCORE = 100;           // Maksimal skor
export const MAX_VOTES_PER_BPD = 5;     // Suara per BPD
export const MAX_TOTAL_VOTES = 190;     // Total suara nasional
export const TARGET_VOTES = 96;         // Target kemenangan
```

#### 3. **Calculation Functions** (Hardcoded)
- `calculateTotalPoints()` - Sum indikator × bobot
- `calculateScore()` - Total points × 5
- `calculateEstimatedVotes()` - (Score/100) × 5
- `computeBpdScores()` - All calculations combined

---

## 🔄 CALCULATION ENGINE

### Step 1: Input Collection
```typescript
// User input (via form/API)
{
  suratBaiat: true,
  afiliasiPolitik: true,
  videoDukungan: false,
  kedekatanMc: true,
  atributFisik: false,
  sosialMedia: true
}
```

### Step 2: Total Points Calculation
```typescript
// calculateTotalPoints()
totalPoints = 5.5 + 4.2 + 0 + 3.2 + 0 + 1.2 = 14.1
```

### Step 3: Score Percentage
```typescript
// calculateScore()
score = 14.1 × 5 = 70.5%
```

### Step 4: Estimated Votes
```typescript
// calculateEstimatedVotes()
estimatedVotes = (70.5 / 100) × 5 = 3.525 suara
```

### Step 5: Database Storage
```sql
UPDATE Bpd SET 
  score = 70.5,
  estimatedVotes = 3.525,
  updatedAt = NOW()
WHERE id = 'uuid';
```

---

## 🎯 BUSINESS RULES

### 1. **Scoring Rules**
- ✅ Maksimal total points: 20.0
- ✅ Maksimal score: 100%
- ✅ Maksimal estimated votes: 5 per BPD
- ✅ Total suara nasional: 190 (38 BPD × 5)
- ✅ Target kemenangan: 96 suara (50% + 1)

### 2. **Data Validation**
- ✅ 1 BPD hanya 1 kandidat
- ✅ Score tidak melebihi 100%
- ✅ Estimated votes tidak melebihi 5
- ✅ Semua indikator harus boolean

### 3. **Role Permissions**
- ✅ SUPERADMIN: Full access + snapshot
- ✅ ADMIN: Input/edit BPD + export
- ✅ USER: Read-only dashboard

---

## 📊 AGGREGATE CALCULATIONS

### Real-time Dashboard Metrics
```typescript
// calculateAggregateStats()
{
  totalDukungan: 190,        // Deterministik: 38 × 5
  totalEfektif: 134.25,      // Analitik: Σ estimated votes
  progress: 139.84           // (134.25 / 96) × 100
}
```

### Per-Candidate Analytics
```typescript
// Group by supportedCandidateId
{
  "Reynaldo Bryan": {
    totalDukungan: 25,        // 5 BPD × 5 suara
    totalEfektif: 18.75,      // Σ estimated votes
    percentage: 13.97         // (18.75 / 134.25) × 100
  }
}
```

---

## 🔄 TRIGGERS & EVENTS

### 1. **Create/Update BPD**
```
User saves form → API validates → Calculate scores → Update database → Real-time sync
```

### 2. **Bulk Operations**
```
CSV upload → Validate data → Batch calculate scores → Update multiple records
```

### 3. **Snapshot System**
```
SUPERADMIN saves snapshot → Backup current state → Restore when needed
```

---

## 🎨 UI BUSINESS LOGIC

### 1. **Color Coding** (Hardcoded)
```typescript
// Status colors
TERKUNCI: 'bg-green-100 text-green-700'
MENGARAH: 'bg-yellow-100 text-yellow-700'
DINAMIS: 'bg-blue-100 text-blue-700'

// Candidate colors (PRD fixed)
Reynaldo Bryan: '#4F46E5'
Ade Jona: '#DC2626'
Afie Kalla: '#F59E0B'
Anthony Leong: '#10B981'
```

### 2. **Display Logic**
- ✅ Score: 1 decimal place
- ✅ Estimated votes: 3 decimal places
- ✅ Progress: 2 decimal places
- ✅ Currency formatting untuk votes

---

## 🔧 IMPLEMENTATION DETAILS

### 1. **Frontend (React)**
```typescript
// Real-time calculation preview
const preview = computeBpdScores(formData);
// Shows: { totalPoints: 14.1, score: 70.5, estimatedVotes: 3.525 }
```

### 2. **Backend (Express/Prisma)**
```typescript
// Middleware untuk auto-calculation
bpdRouter.post('/', async (req, res) => {
  const calculated = computeBpdScores(req.body);
  const bpd = await prisma.bpd.create({
    data: { ...req.body, ...calculated }
  });
});
```

### 3. **Database (PostgreSQL)**
```sql
-- Triggers untuk consistency
CREATE TRIGGER update_scores 
BEFORE INSERT OR UPDATE ON Bpd
FOR EACH ROW EXECUTE FUNCTION calculate_bpd_scores();
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### 1. **Caching Strategy**
- Redis cache untuk aggregate stats
- Client-side caching untuk candidate data
- Database indexes untuk filtering

### 2. **Calculation Optimization**
- Batch calculations untuk bulk operations
- Pre-computed aggregates untuk dashboard
- Lazy loading untuk large datasets

---

## 🔐 SECURITY CONSIDERATIONS

### 1. **Data Integrity**
- Server-side validation untuk semua calculations
- Audit trail untuk perubahan data
- Role-based access control

### 2. **Business Logic Protection**
- Weights hardcoded (tidak bisa diubah runtime)
- Constants immutable
- Validation rules enforced di API layer

---

## 📈 MONITORING & ANALYTICS

### 1. **Business Metrics**
- Conversion rate: Dukungan → Efektif
- Progress toward target (96 suara)
- Candidate performance comparison

### 2. **System Metrics**
- Calculation performance
- Database query efficiency
- API response times

---

## 🔄 FUTURE EXTENSIONS

### 1. **Advanced Analytics**
- Trend analysis
- Predictive modeling
- Scenario simulation

### 2. **Business Intelligence**
- Export capabilities
- Custom reports
- Data visualization

---

## 📝 SUMMARY

### **Hardcoded (Business Rules)**
- ✅ Indicator weights (5.5, 4.2, 3.8, 3.2, 2.1, 1.2)
- ✅ Constants (100, 5, 190, 96)
- ✅ Calculation formulas
- ✅ Color coding
- ✅ Validation rules

### **Stored (Data)**
- ✅ Raw indicator flags
- ✅ User inputs
- ✅ Computed results (score, estimatedVotes)
- ✅ Metadata (timestamps, users)

### **Calculated (Real-time)**
- ✅ Aggregate statistics
- ✅ Progress metrics
- ✅ Performance analytics
- ✅ Dashboard data

Sistem ini memisahkan antara **data storage** (dinamis) dan **business logic** (statis) untuk memastikan konsistensi perhitungan dan fleksibilitas data management.
