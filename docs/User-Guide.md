# User Guide - Electoral Analytics Engine

Panduan lengkap penggunaan sistem Dashboard Analitik & Database Pemenangan HIPMI.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [BPD Management](#bpd-management)
- [User Management](#user-management)
- [Data Import/Export](#data-importexport)
- [Understanding Indicators](#understanding-indicators)
- [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### 1. Login
1. Buka aplikasi di browser: [electoral.langitgo.com](https://electoral.langitgo.com)
2. Masukkan username dan password:
   - **Superadmin**: `superadmin` / `password123`
   - **Admin**: `admin` / `admin123`
   - **User**: `user` / `user123`
3. Klik tombol "Sign in"

### 2. Navigation
Setelah login, Anda akan melihat:
- **Sidebar kiri**: Menu navigasi
- **Main content**: Konten halaman aktif
- **User info**: Informasi user yang sedang login

### 3. Menu Access
- **Dashboard**: Overview progress dan statistik
- **Database BPD**: Manajemen data provinsi
- **Manajemen User** (Superadmin only): Kelola user accounts

## 📊 Dashboard Overview

### Main Dashboard Components

#### 1. Progress Cards
- **Total Estimasi Suara**: Jumlah suara yang sudah didapat
- **Status Dukungan**: Jumlah provinsi per status (Terkunci/Condong/Bergeser)
- **Progress Keseluruhan**: Persentase progress menuju target

#### 2. Chart Visualizations
- **Distribusi Status Dukungan**: Pie chart menampilkan proporsi status
- **Karakteristik Provinsi**: Bar chart menampilkan karakteristik BPD

#### 3. Recent Updates
- **5 Update Terbaru**: Provinsi yang baru saja diperbarui
- **User Info**: Siapa yang melakukan update
- **Timestamp**: Kapan update dilakukan

### Understanding Progress
- **Target**: 96 suara (50%+1)
- **Progress Bar**: Visual indikator menuju target
- **Estimasi Suara**: Berdasarkan indikator dukungan

## 🗄️ BPD Management

### Access Requirements
- **Superadmin**: Full CRUD access
- **Admin**: Create, Read, Update
- **User**: Read only

### 1. Viewing BPD Data
1. Klik menu "Database BPD" di sidebar
2. Lihat daftar semua provinsi dengan:
   - Nama provinsi
   - Status dukungan (badge warna)
   - Karakteristik (icon)
   - Skor dan estimasi suara
   - Update terakhir

### 2. Creating New BPD
1. Klik tombol "Tambah BPD"
2. Isi form dengan:
   - **Nama Provinsi**: Wajib diisi
   - **Target MC**: Target MC untuk provinsi
   - **Afiliasi Politik**: Partai koalisi
   - **Status Dukungan**: Pilih dari dropdown
   - **Karakteristik**: Pilih dari dropdown
   - **Indikator Dukungan**: Checklist 6 indikator
3. Klik "Simpan"

### 3. Editing BPD
1. Klik icon edit (pencil) pada baris provinsi
2. Update data yang diperlukan
3. Klik "Perbarui"

### 4. Deleting BPD (Superadmin Only)
1. Klik icon trash pada baris provinsi
2. Konfirmasi deletion
3. Data akan dihapus permanen

### 5. Search & Filter
- **Search Box**: Cari berdasarkan nama provinsi
- **Real-time**: Filter otomatis saat mengetik

### 6. Bulk Operations

#### Upload CSV/XLSX
1. Klik tombol "Upload CSV"
2. Drag & drop file atau klik untuk browse
3. Pilih file CSV/XLSX (maks. 10MB)
4. Klik "Upload"
5. Sistem akan memproses dan update data

#### Export CSV
1. Klik tombol "Ekspor CSV"
2. File akan otomatis di-download
3. Format: CSV dengan semua data BPD

### 7. Understanding Status & Characteristics

#### Status Dukungan
- **🟢 Terkunci**: Dukungan sudah final ke 1 Caketum
- **🔵 Mengarah**: Kecenderungan kuat tapi belum final
- **🟠 Dinamis**: Masih berubah / belum stabil / bergeser

#### Karakteristik
- **🛡️ Solid**: Kuat dan stabil
- **⚠️ Rentan**: Rentan terhadap perubahan
- **👁️ Waspada**: Perlu diwaspadai

## 👥 User Management (Superadmin Only)

### Access Requirements
- **Hanya Superadmin** yang dapat mengakses menu ini

### 1. Viewing Users
1. Klik menu "Manajemen User" di sidebar
2. Lihat daftar semua user dengan:
   - Username
   - Role (badge warna)
   - Jumlah BPD yang dikelola
   - Tanggal dibuat

### 2. Creating New User
1. Klik tombol "Tambah User"
2. Isi form:
   - **Username**: Unik, wajib diisi
   - **Password**: Minimal 6 karakter
   - **Role**: Pilih dari dropdown
3. Klik "Buat"

### 3. Editing User
1. Klik icon edit pada user
2. Update data yang diperlukan
3. Password opsional (kosongkan jika tidak ingin mengubah)
4. Klik "Perbarui"

### 4. Deleting User
1. Klik icon trash pada user
2. Konfirmasi deletion
3. **Syarat**: User tidak boleh memiliki data BPD

### 5. Role Permissions

#### Superadmin
- ✅ Full system access
- ✅ User management
- ✅ All BPD operations
- ✅ System configuration

#### Admin
- ✅ BPD CRUD operations
- ✅ Bulk upload/export
- ✅ Dashboard access
- ❌ User management
- ❌ Delete BPD

#### User
- ✅ Dashboard view
- ✅ BPD data view
- ❌ Any edit operations
- ❌ Export functions

## 📁 Data Import/Export

### Supported Formats
- **CSV**: Comma Separated Values
- **XLSX**: Microsoft Excel

### CSV Template
```csv
provinceName,totalVotes,targetMc,politicalAffiliation,supportStatus,characteristic,suratBaiat,afiliasiPolitik,videoDukungan,kedekatanMc,atributFisik,sosialMedia
DKI Jakarta,5,Target MC Jakarta,Partai Koalisi 1,LOCKED,SOLID,true,true,true,true,true,true
```

### Field Descriptions
- **provinceName**: Nama provinsi (unique)
- **totalVotes**: Jumlah suara (default: 5)
- **targetMc**: Target MC untuk provinsi
- **politicalAffiliation**: Afiliasi politik
- **supportStatus**: TERKUNCI/MENGARAH/DINAMIS
- **characteristic**: SOLID/RENTAN/WASPADA
- **suratBaiat**: true/false
- **afiliasiPolitik**: true/false
- **videoDukungan**: true/false
- **kedekatanMc**: true/false
- **atributFisik**: true/false
- **sosialMedia**: true/false

### Export Format
Export menghasilkan CSV dengan:
- Semua field data BPD
- Timestamp update
- Username updater
- Format yang sama dengan import template

## 📈 Understanding Indicators

### Support Indicators & Weights
| Indikator | Bobot | Deskripsi |
|-----------|-------|-----------|
| Surat Baiat | 5.5 | Surat baiat resmi |
| Afiliasi Politik | 4.2 | Afiliasi dengan partai koalisi |
| Video Dukungan | 3.8 | Video pernyataan dukungan |
| Kedekatan MC | 3.2 | Kedekatan dengan MC |
| Atribut Fisik | 2.1 | Penggunaan atribut fisik |
| Sosial Media | 1.2 | Dukungan di media sosial |
| **Total** | **20** | **Maksimal** |

### Scoring Logic
```
Total Poin = Σ Bobot Indikator Terpenuhi
Skor (%) = Total Poin × 5
Estimasi Suara = (Skor / 100) × 5
```

### Example Calculation
Jika semua indikator terpenuhi:
- Total Poin = 5.5 + 4.2 + 3.8 + 3.2 + 2.1 + 1.2 = 20
- Skor = 20 × 5 = 100%
- Estimasi Suara = (100 / 100) × 5 = 5 suara

### Partial Example
Jika hanya 3 indikator terpenuhi:
- Total Poin = 5.5 + 4.2 + 3.8 = 13.5
- Skor = 13.5 × 5 = 67.5%
- Estimasi Suara = (67.5 / 100) × 5 = 3.375 suara

## 🔧 Troubleshooting

### Common Issues

#### 1. Login Failed
**Problem**: Tidak bisa login
**Solution**:
- Periksa username dan password
- Pastikan case sensitive
- Coba refresh browser

#### 2. Data Not Saving
**Problem**: Perubahan tidak tersimpan
**Solution**:
- Periksa koneksi internet
- Refresh browser dan coba lagi
- Cek permission role Anda

#### 3. Upload Failed
**Problem**: File upload gagal
**Solution**:
- Pastikan file format CSV/XLSX
- Check file size (maks. 10MB)
- Pastikan file tidak corrupt

#### 4. Export Failed
**Problem**: CSV export tidak bekerja
**Solution**:
- Check browser popup blocker
- Coba download lagi
- Pastikan ada data BPD

#### 5. Dashboard Not Updating
**Problem**: Data tidak real-time
**Solution**:
- Refresh browser
- Check koneksi internet
- Tunggu beberapa detik

### Error Messages

#### Authentication Errors
- `"Authentication required"`: Login kembali
- `"Invalid token"`: Login kembali
- `"Insufficient permissions"`: Role tidak cukup

#### Data Errors
- `"Username sudah digunakan"`: Pilih username lain
- `"Validation error"`: Periksa form input
- `"Resource not found"`: Data tidak ada

#### System Errors
- `"Internal server error"`: Hubungi admin
- `"Database connection failed"`: Hubungi admin

### Performance Tips

#### 1. Browser Optimization
- Gunakan browser modern (Chrome, Firefox, Safari)
- Clear cache secara berkala
- Tutup tab yang tidak digunakan

#### 2. Data Management
- Export data secara berkala
- Hindari upload file terlalu besar
- Gunakan search untuk filter data

#### 3. System Usage
- Logout setelah selesai
- Jangan share login credentials
- Report bugs ke admin

## 📞 Support

### Contact Information
- **Technical Support**: Hubungi Superadmin
- **User Training**: Request training session
- **Bug Reports**: Report via system atau email

### Resources
- [API Documentation](./API-Documentation.md)
- [System Documentation](./README.md)
- [PRD](./preparation/prd.md)
- [Tech Overview](./preparation/tech-overview.md)

### FAQ

**Q: Berapa banyak user yang bisa dibuat?**
A: Tidak ada batasan, tapi disarankan minimal.

**Q: Apakah data aman?**
A: Ya, menggunakan JWT authentication dan password hashing.

**Q: Bagaimana cara backup data?**
A: Export CSV secara berkala untuk backup.

**Q: Apakah bisa diakses dari mobile?**
A: Ya, responsive design untuk mobile devices.

**Q: Berapa target suara yang harus dicapai?**
A: 96 suara (50%+1 dari 190 total).

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**For**: HIPMI Pemenangan Team
