# Tech Overview

**Sistem Analitik & Database Pemenangan HIPMI (MVP)**

---

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan teknis tingkat tinggi dalam pengembangan sistem, mencakup arsitektur, pendekatan teknologi, serta prinsip implementasi.

Dokumen ini tidak mengikat secara detail implementasi, namun memberikan arah yang jelas agar pengembangan tetap konsisten, efisien, dan scalable.

---

## 2. Prinsip Pengembangan

Sistem dikembangkan dengan prinsip:

- **Sederhana & cepat (MVP-first)**
- **Ringan (low resource server)**
- **Mudah dikembangkan & dirawat**
- **Tidak over-engineered**
- **Single source of truth di backend**

---

## 3. Arsitektur Sistem

Sistem menggunakan arsitektur **client-server berbasis web** dengan pendekatan monolith:

```
Frontend (SPA)
   ↓
Backend API (REST)
   ↓
Database (Relational)
```

### Karakteristik:

- Tidak menggunakan microservices
- Tidak menggunakan server-side rendering (SSR)
- Semua logika bisnis & perhitungan berada di backend

---

## 4. Frontend (Client Layer)

### 4.1 Teknologi

- **React (Vite)**
- **Tailwind CSS v4**
- **ShadCN UI**
- **Lucide Icons**
- **TanStack Query (React Query)**

---

### 4.2 Alasan Pemilihan

### React + Vite

- Build ringan dan cepat
- Konfigurasi minimal
- Cocok untuk dashboard internal (tidak membutuhkan SSR)

### Tidak menggunakan Next.js

- Overhead lebih besar (SSR, routing kompleks)
- Tidak diperlukan untuk kebutuhan MVP
- Kurang efisien untuk server kecil

### Tailwind CSS v4

- Utility-first → mempercepat pengembangan UI
- Konsistensi design system
- Minim CSS custom

### ShadCN UI

- Berbasis Tailwind (tidak konflik)
- Komponen siap pakai (table, dialog, form, dll)
- Tidak menambah beban bundle (copy-based)

### TanStack Query

- Manajemen data fetching yang efisien
- Caching otomatis
- Handling loading & error state lebih rapi

---

### 4.3 Struktur Frontend (Disarankan)

```
/src
  /components
  /pages
  /services
  /hooks
  /types
```

---

## 5. Backend (API Layer)

### 5.1 Teknologi

- **Node.js**
- **Express.js**
- **Prisma ORM**
- **Swagger (OpenAPI)**

---

### 5.2 Alasan Pemilihan

### Express.js

- Ringan dan fleksibel
- Minim boilerplate
- Cocok untuk MVP

### Tidak menggunakan NestJS

- Terlalu kompleks untuk kebutuhan saat ini
- Overhead struktur dan learning curve

### Prisma ORM

- Type-safe query
- Mempercepat pengembangan
- Mudah maintain dan scalable

---

## 6. Database

### 6.1 Teknologi

- **PostgreSQL**

---

### 6.2 Alasan Pemilihan

- Stabil dan production-ready
- Mendukung relasi kompleks
- Lebih fleksibel untuk kebutuhan analitik

---

## 7. API Design

### 7.1 Pendekatan

- RESTful API
- JSON-based response
- Stateless (menggunakan token)

---

### 7.2 Dokumentasi API

Sistem menyediakan dokumentasi API berbasis **OpenAPI (Swagger)** yang dapat diakses melalui endpoint:

```
/api/docs
```

Fitur:

- Daftar endpoint
- Request & response schema
- Fitur “Try it out” untuk testing langsung

---

## 8. Authentication & Authorization

### Pendekatan:

- **JWT (JSON Web Token)**

### Karakteristik:

- Stateless authentication
- Role-based access control (RBAC)
- Validasi akses berdasarkan role:
    - Superadmin
    - Admin
    - User

---

## 9. Data Flow

### 9.1 Update Data

```
Admin → API → Database → Recalculate Score → Response
```

---

### 9.2 Dashboard

```
Frontend → API → Aggregated Data → Render UI
```

---

### 9.3 Import Data

```
Upload File → API → Parsing → Database Update → Recalculate
```

---

## 10. Logika Perhitungan

- Seluruh kalkulasi skor dilakukan di backend
- Frontend hanya menampilkan hasil
- Tidak ada perhitungan bisnis di client

---

## 11. Performa & Optimasi

### Pendekatan:

- Monolith architecture
- Query efisien (select field seperlunya)
- Minimal dependency
- Static build frontend

---

### Yang dihindari:

- WebSocket (belum diperlukan)
- Real-time push system
- Heavy frontend libraries
- Microservices

---

## 12. Deployment Strategy

### Target:

- VPS kecil / cloud ringan (misalnya Railway)

---

### Setup:

```
- Backend: Node.js (Express)
- Frontend: Static build (Vite)
- Web server: Nginx
- Database: PostgreSQL
```

---

## 13. Keamanan Dasar

- Validasi input di backend
- Pembatasan akses berbasis role
- Sanitasi data
- Token-based authentication (JWT)

---

## 14. Skalabilitas (Future Ready)

Tanpa mengubah fondasi sistem:

- Penambahan Redis untuk caching
- Penambahan worker/queue untuk proses berat (import data)
- Pemisahan service jika diperlukan
- Upgrade ke real-time system (jika dibutuhkan)

---

## 15. Batasan Sistem (MVP Scope)

- Tidak menggunakan real-time update (polling/manual refresh)
- Tidak menggunakan SSR
- Tidak menggunakan microservices
- Tidak menggunakan sistem analitik kompleks (AI/ML)

---

# ⚡ Penutup

Tech stack dan arsitektur ini dipilih untuk mencapai keseimbangan antara:

- **Kecepatan pengembangan**
- **Efisiensi resource**
- **Kemudahan maintenance**
- **Kesiapan untuk scaling di masa depan**