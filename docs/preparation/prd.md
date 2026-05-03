# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Sistem Analitik & Database Pemenangan HIPMI

---

# 1. IDENTITAS SISTEM

**Nama Sistem:**

Dashboard Analitik Pemenangan HIPMI

**Tujuan:**

Menganalisis dan memetakan kekuatan dukungan 38 BPD terhadap 4 Caketum secara objektif, berbasis data indikator dan visualisasi dashboard.

---

# 2. PRINSIP SISTEM

Sistem ini bersifat:

- Netral
- Analitik
- Berbasis data
- Tidak menentukan keputusan politik

---

# 3. DATA CAKETUM

| Nama Caketum | Afiliasi Politik | Warna UI |
| --- | --- | --- |
| Reynaldo Bryan | Nasdem | #4F46E5 |
| Ade Jona | Gerindra | #DC2626 |
| Afie Kalla | Golkar | #F59E0B |
| Anthony Leong | Gerindra | #10B981 |

---

# 4. STRUKTUR DATA BPD

Setiap BPD memiliki:

## A. Identitas

- Nama Provinsi (38 data)
- Alokasi Suara: **5 suara tetap**
- Target MC
- Afiliasi Politik Lokal

---

## B. Status Dukungan (WAJIB BAHASA INDONESIA)

```
- Terkunci
- Mengarah
- Dinamis
```

### Definisi:

- **Terkunci** → dukungan sudah final ke satu Caketum
- **Mengarah** → kecenderungan kuat tapi belum final
- **Dinamis** → belum stabil / masih berubah

---

## C. Karakteristik BPD

```
- Solid
- Rentan
- Waspada
```

---

# 5. INDIKATOR DUKUNGAN & BOBOT (FINAL — SIMPAN DI HALAMAN INFORMASI)

| Kategori | Indikator | Bobot | Deskripsi |
| --- | --- | --- | --- |
| Internal | Surat Baiat / Rekomendasi Resmi | 5.5 | Dokumen resmi yang mengikat dukungan |
| Eksternal | Afiliasi Politik Lokal | 4.2 | Kesesuaian dengan kekuatan politik wilayah |
| Internal | Video Dukungan Resmi | 3.8 | Pernyataan publik terverifikasi |
| Eksternal | Kedekatan Personal MC | 3.2 | Jejaring Master Campaigner |
| Internal | Atribut Fisik | 2.1 | Simbol kebersamaan di publik |
| Internal | Sosial Media | 1.2 | Interaksi informal |
|  | **TOTAL MAKSIMAL** | **20.0** | Skor penuh (100%) |

---

# 6. LOGIKA PERHITUNGAN

---

## A. TOTAL POIN

```
Total Poin = jumlah indikator yang terpenuhi
Maksimal = 20
```

---

## B. SKOR PROBABILITAS

```
Skor (%) = Total Poin × 5
```

---

## C. ESTIMASI SUARA

```
Estimasi Suara = (Skor / 100) × 5
```

---

## D. TOTAL SUARA DUKUNGAN (DETERMINISTIK)

```
Total Suara Dukungan = jumlah BPD × 5
```

👉 tidak dipengaruhi indikator

---

## E. TOTAL SUARA EFEKTIF (ANALITIK UTAMA)

```
Total Suara Efektif = Σ estimasi suara semua BPD
```

---

## F. PROGRESS KE MENANG

```
Progress = Total Suara Efektif / 96
```

---

# 7. ROLE SYSTEM

## Superadmin

- full access
- restore data
- audit log

## Admin

- input & edit BPD
- checklist indikator
- upload CSV/XLSX

## User

- read-only dashboard

---

# 8. UI / DASHBOARD STRUCTURE

---

## 🟢 A. DASHBOARD UTAMA (VISUAL FIRST)

### Komponen:

### 1. Progress Bar

- progress menuju 96 suara

---

### 2. Grouped Bar Chart

- Total Dukungan
- Total Efektif

---

### 3. Stacked Chart

- distribusi kekuatan 4 Caketum

---

### 4. Donut Chart

- Terkunci / Mengarah / Dinamis

---

### 5. PETA INDONESIA (CORE FEATURE)

- tiap provinsi diberi warna kandidat dominan

---

### Rule:

```
warna provinsi = kandidat dengan skor tertinggi
```

---

## 🟡 B. TABEL UTAMA (RINGKAS)

Menampilkan:

- Provinsi
- Status Dukungan
- Caketum Dominan
- Total Dukungan (5 jika ada, 0 jika tidak)
- Total Efektif
- Skor (%)
- Karakteristik

---

❌ TIDAK MENAMPILKAN:

- checklist indikator
- detail scoring
- metadata MC

---

## 🔵 C. DETAIL BPD (MODAL / DRAWER)

---

### 1. DATA DASAR

- Provinsi
- MC
- Afiliasi Lokal
- Status Dukungan
- Karakteristik

---

### 2. DUKUNGAN

- Caketum Terpilih
- Suara = 5 (fixed)

---

### 3. INDIKATOR CHECKLIST

- Surat Baiat
- Afiliasi Politik
- Video Dukungan
- Kedekatan MC
- Atribut Fisik
- Sosial Media

---

### 4. HASIL PERHITUNGAN

- Total Poin (0–20)
- Skor (%)
- Estimasi Suara (0–5)

---

# 9. RULES DATA SYSTEM

---

## INPUT (ADMIN ONLY)

- checklist indikator
- status dukungan
- kandidat pilihan

---

## SYSTEM GENERATED

- skor
- estimasi suara
- total efektif
- progress

---

## NEVER STORED MANUALLY

- progress
- total nasional
- ranking

---

# 10. VALIDASI SISTEM

- 1 BPD hanya 1 kandidat
- max skor 20
- max suara 5 per BPD
- total suara nasional = 190
- target kemenangan = 96

---

# ⚡ FINAL SUMMARY

## 🧠 LOGIC UTAMA:

- Terkunci = final dukungan
- Mengarah = belum final
- Dinamis = bisa berubah

---

## 📊 METRIK UTAMA:

- Dukungan = struktur politik
- Efektif = kekuatan real
- Progress = peluang menang