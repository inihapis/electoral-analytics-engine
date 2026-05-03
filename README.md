# 🚀 Electoral Analytics Engine

Sistem monitoring dan manajemen data strategis untuk analisis performa wilayah secara real-time.

**Live Demo**: [electoral.langitgo.com](https://electoral.langitgo.com)
**Repository**: [github.com/inihapis/electoral-analytics-engine](https://github.com/inihapis/electoral-analytics-engine)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Sistem ini dirancang untuk:
- **Monitoring real-time** progress dukungan dari 38 provinsi
- **Manajemen data BPD** dengan indikator dukungan terukur
- **Analisis statistik** dengan visualisasi chart
- **Role-based access control** untuk keamanan data
- **Export/import data** untuk analisis eksternal

### Target Kemenangan
- **Total provinsi**: 38 BPD
- **Target suara**: 96 suara (50%+1)
- **Suara per provinsi**: 5 suara
- **Total maksimal**: 190 suara

## ✨ Features

### 🏠 Dashboard
- **Progress tracking** real-time menuju 96 suara
- **Chart visualisasi** status dukungan dan karakteristik
- **Riwayat update** 5 provinsi terakhir
- **Statistik summary** dengan indikator kunci

### 📊 Database BPD Management
- **CRUD operations** untuk data provinsi
- **Bulk upload** CSV/XLSX untuk data massal
- **Export data** ke CSV untuk analisis
- **Search & filter** real-time
- **Form validation** dengan error handling

### 👥 User Management (Superadmin Only)
- **Create/edit/delete** user accounts
- **Role assignment**: Superadmin, Admin, User
- **Password hashing** dengan bcrypt
- **Access control** berdasarkan peran

### 🔐 Security
- **JWT authentication** stateless
- **Role-based authorization**
- **Input validation** dengan Zod
- **Password hashing** bcrypt

### 📈 Analytics
- **Support indicators** dengan bobot terukur
- **Score calculation** otomatis
- **Vote estimation** berdasarkan indikator
- **Progress visualization** dengan chart

## 🛠 Tech Stack

### Frontend
- **React 18** dengan Vite
- **TypeScript** untuk type safety
- **Tailwind CSS v4** untuk styling
- **shadcn/ui** components library
- **Recharts** untuk visualisasi data
- **React Query** untuk data fetching
- **React Router** untuk navigation
- **Lucide React** untuk icons

### Backend
- **Node.js** dengan Express.js
- **TypeScript** untuk type safety
- **Prisma ORM** untuk database operations
- **JWT** untuk authentication
- **bcrypt** untuk password hashing
- **Multer** untuk file upload
- **Swagger** untuk API documentation

### Database
- **PostgreSQL** sebagai primary database
- **Prisma Migrate** untuk schema management
- **Seed data** untuk initial setup

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd sistem-pemenangan-hipmi
```

### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: [electoral.langitgo.com](https://electoral.langitgo.com)
- **Backend API**: `https://api-electoral.langitgo.com/api`
- **API Documentation**: [api-electoral.langitgo.com/api-docs](https://api-electoral.langitgo.com/api-docs)

## ⚙️ Configuration

### Environment Variables (Backend)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hipmi_pemenangan"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=5000

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### Database Configuration
```bash
# Create database
createdb hipmi_pemenangan

# Run migrations
npm run prisma:migrate

# Seed data
npm run prisma:seed
```

## 👥 User Roles & Access Control

### Superadmin
- **Full access** ke seluruh sistem
- **User management** (create/edit/delete)
- **BPD management** (CRUD operations)
- **Bulk operations** (upload/export)
- **System configuration**

### Admin
- **BPD management** (create/read/update)
- **Bulk upload** data BPD
- **Export data** ke CSV
- **Dashboard access** read-only
- **Tidak bisa** manage users

### User
- **Dashboard access** read-only
- **View data** BPD dan statistik
- **Tidak bisa** edit/delete data
- **Tidak bisa** export/upload

## 📚 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "username": "superadmin",
  "password": "password123"
}
```

### BPD Management
```bash
# Get all BPDs
GET /api/bpd
Authorization: Bearer <token>

# Create BPD (Admin/Superadmin)
POST /api/bpd
Authorization: Bearer <token>

# Update BPD (Admin/Superadmin)
PUT /api/bpd/:id
Authorization: Bearer <token>

# Delete BPD (Superadmin only)
DELETE /api/bpd/:id
Authorization: Bearer <token>

# Bulk Upload (Admin/Superadmin)
POST /api/bpd/bulk-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Export CSV (Admin/Superadmin)
GET /api/bpd/export/csv
Authorization: Bearer <token>

# Get Stats Summary
GET /api/bpd/stats/summary
Authorization: Bearer <token>
```

### User Management (Superadmin Only)
```bash
# Get all users
GET /api/users
Authorization: Bearer <token>

# Create user
POST /api/users
Authorization: Bearer <token>

# Update user
PUT /api/users/:id
Authorization: Bearer <token>

# Delete user
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Interactive Documentation
Visit http://localhost:5000/api-docs untuk interactive API documentation dengan Swagger UI.

## 🗄️ Database Schema

### User Model
```sql
CREATE TABLE users (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username  VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(20) NOT NULL DEFAULT 'USER',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BPD Model
```sql
CREATE TABLE bpd (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provinceName      VARCHAR(255) UNIQUE NOT NULL,
  totalVotes        INTEGER DEFAULT 5,
  targetMc          VARCHAR(255),
  politicalAffiliation VARCHAR(255),
  supportStatus     VARCHAR(20) DEFAULT 'SWING',
  characteristic    VARCHAR(20) DEFAULT 'WASPADA',
  suratBaiat        BOOLEAN DEFAULT FALSE,
  afiliasiPolitik   BOOLEAN DEFAULT FALSE,
  videoDukungan     BOOLEAN DEFAULT FALSE,
  kedekatanMc       BOOLEAN DEFAULT FALSE,
  atributFisik      BOOLEAN DEFAULT FALSE,
  sosialMedia       BOOLEAN DEFAULT FALSE,
  updatedById       UUID NOT NULL,
  updatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updatedById) REFERENCES users(id)
);
```

### Enums
- **Role**: SUPERADMIN, ADMIN, USER
- **SupportStatus**: TERKUNCI, MENGARAH, DINAMIS
- **Characteristic**: SOLID, RENTAN, WASPADA

## 📊 Indikator Dukungan & Perhitungan

### Bobot Indikator
| Indikator | Bobot |
|-----------|-------|
| Surat Baiat | 5.5 |
| Afiliasi Politik | 4.2 |
| Video Dukungan | 3.8 |
| Kedekatan MC | 3.2 |
| Atribut Fisik | 2.1 |
| Sosial Media | 1.2 |
| **Total Maksimal** | **20** |

### Logika Perhitungan
```
Total Poin = jumlah indikator terpenuhi
Skor (%) = Total Poin × 5
Estimasi Suara = (Skor / 100) × 5
```

### Contoh Perhitungan
Jika semua indikator terpenuhi (20 poin):
- Skor = 20 × 5 = 100%
- Estimasi Suara = (100 / 100) × 5 = 5 suara

## 🚀 Deployment

### Development
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### Production Build
```bash
# Build frontend
cd client
npm run build

# Build backend
cd server
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile (backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret-key
PORT=5000
```

## 🔧 Default Credentials

### Pre-configured Users
| Username | Password | Role | Description |
|----------|----------|------|-------------|
| superadmin | password123 | SUPERADMIN | Full system access |
| admin | admin123 | ADMIN | BPD management |
| user | user123 | USER | Read-only access |

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Test connection
psql -h localhost -U username -d hipmi_pemenangan

# Reset database
npm run prisma:migrate reset
npm run prisma:seed
```

#### 2. JWT Token Issues
```bash
# Check JWT_SECRET in .env
echo $JWT_SECRET

# Generate new token
node -e "console.log(require('jsonwebtoken').sign({id: 'user-id', role: 'USER'}, 'your-secret'))"
```

#### 3. File Upload Issues
```bash
# Check file permissions
ls -la uploads/

# Clear upload directory
rm -rf uploads/*
```

#### 4. Frontend Build Issues
```bash
# Clear cache
cd client
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run build
```

### Performance Optimization

#### Database Indexes
```sql
-- Add indexes for better performance
CREATE INDEX idx_bpd_province ON bpd(provinceName);
CREATE INDEX idx_bpd_status ON bpd(supportStatus);
CREATE INDEX idx_bpd_updated ON bpd(updatedAt DESC);
```

#### Caching
```bash
# Enable Redis caching (optional)
npm install redis
# Configure Redis client in production
```

## 📝 Development Notes

### Code Structure
```
sistem-pemenangan-hipmi/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── lib/           # Utility functions
├── server/                # Backend Node.js app
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── config/        # Configuration files
│   ├── prisma/           # Database schema & migrations
│   └── uploads/          # File upload directory
└── docs/                 # Documentation
```

### Best Practices
- **TypeScript** untuk type safety
- **Environment variables** untuk konfigurasi
- **Input validation** untuk security
- **Error handling** yang comprehensive
- **Code organization** yang modular
- **Testing** untuk critical components

## 📞 Support

For technical support or questions:
1. Check [API Documentation](http://localhost:5000/api-docs)
2. Review [Troubleshooting](#troubleshooting) section
3. Check system logs for error details
4. Contact development team

## 📄 License

This project is proprietary and confidential property of HIPMI Pemenangan Team.

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Maintainer**: Insight Development Team
