# Panduan Pengisian Data BPD (CSV/XLSX)

Dokumen ini menjelaskan format dan aturan pengisian file CSV/XLSX untuk fitur **Bulk Upload** pada sistem Electoral Analytics Engine.

## 📋 Format Kolom

File harus memiliki header berikut (case-insensitive):

| Nama Kolom | Wajib | Deskripsi | Contoh Nilai |
|------------|-------|-----------|--------------|
| `province_name` | Ya | Nama Provinsi (Unik) | `DKI Jakarta` |
| `total_votes` | Tidak | Jumlah suara (default: 5) | `5` |
| `target_mc` | Tidak | Target MC (teks bebas) | `Target 100% MC` |
| `political_affiliation` | Tidak | Afiliasi Politik | `Partai Koalisi A` |
| `supported_candidate` | Tidak | Nama Caketum yang didukung | `Ade Jona` |
| `support_status` | Ya | Status Dukungan | `TERKUNCI`, `MENGARAH`, `DINAMIS` |
| `characteristic` | Ya | Karakteristik Wilayah | `SOLID`, `RENTAN`, `WASPADA` |
| `surat_baiat` | Tidak | Status Surat Baiat | `true` / `false` |
| `afiliasi_politik`| Tidak | Status Afiliasi | `true` / `false` |
| `video_dukung` | Tidak | Status Video Dukungan | `true` / `false` |
| `kedekatan_mc` | Tidak | Status Kedekatan MC | `true` / `false` |
| `atribut_fisik` | Tidak | Status Atribut Fisik | `true` / `false` |
| `sosial_media` | Tidak | Status Sosial Media | `true` / `false` |

## ⚠️ Aturan Penting

1. **Enum Status Dukungan**: Hanya boleh diisi dengan:
   - `TERKUNCI` (Badge Hijau)
   - `MENGARAH` (Badge Biru)
   - `DINAMIS` (Badge Oranye)
2. **Enum Karakteristik**: Hanya boleh diisi dengan:
   - `SOLID` (Kuat)
   - `RENTAN` (Perlu Perhatian)
   - `WASPADA` (Kritis)
3. **Boolean Values**: Gunakan `true` untuk "Ya" dan `false` untuk "Tidak".
4. **Nama Provinsi**: Pastikan penulisan nama provinsi konsisten untuk menghindari data ganda.

## 📥 Cara Mengunggah

1. Masuk ke menu **Database BPD**.
2. Klik tombol **Upload CSV**.
3. Pilih file yang sudah sesuai format.
4. Sistem akan melakukan **Upsert** (Update jika provinsi sudah ada, Create jika belum ada).

---
**Template**: Anda dapat mengunduh template resmi di halaman **Informasi** pada dashboard.
