# API Documentation - Electoral Analytics Engine

## Overview

RESTful API untuk Dashboard Pemenangan HIPMI dengan JWT authentication dan role-based access control.

**Base URL**: `https://api-electoral.langitgo.com/api` (Production) / `http://localhost:5000/api` (Local)
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

## Authentication

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "superadmin",
    "role": "SUPERADMIN"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "username": "superadmin",
  "role": "SUPERADMIN",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

## BPD Management

### Get All BPDs
```http
GET /api/bpd
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "provinceName": "DKI Jakarta",
    "totalVotes": 5,
    "targetMc": "Target MC Jakarta",
    "politicalAffiliation": "Partai Koalisi 1",
    "supportStatus": "TERKUNCI",
    "characteristic": "SOLID",
    "suratBaiat": true,
    "afiliasiPolitik": true,
    "videoDukungan": true,
    "kedekatanMc": true,
    "atributFisik": true,
    "sosialMedia": true,
    "score": 100,
    "estimatedVotes": 5.0,
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "updatedBy": {
      "username": "superadmin"
    }
  }
]
```

### Get BPD by ID
```http
GET /api/bpd/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "provinceName": "DKI Jakarta",
  "totalVotes": 5,
  "targetMc": "Target MC Jakarta",
  "politicalAffiliation": "Partai Koalisi 1",
  "supportStatus": "LOCKED",
  "characteristic": "SOLID",
  "suratBaiat": true,
  "afiliasiPolitik": true,
  "videoDukungan": true,
  "kedekatanMc": true,
  "atributFisik": true,
  "sosialMedia": true,
  "score": 100,
  "estimatedVotes": 5.0,
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "updatedBy": {
    "username": "superadmin"
  }
}
```

### Create BPD
```http
POST /api/bpd
Authorization: Bearer <token>
Content-Type: application/json
```

**Required Role:** ADMIN, SUPERADMIN

**Request Body:**
```json
{
  "provinceName": "Provinsi Baru",
  "totalVotes": 5,
  "targetMc": "Target MC Baru",
  "politicalAffiliation": "Partai Koalisi 2",
  "supportStatus": "MENGARAH",
  "characteristic": "RENTAN",
  "suratBaiat": true,
  "afiliasiPolitik": true,
  "videoDukungan": false,
  "kedekatanMc": true,
  "atributFisik": false,
  "sosialMedia": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "provinceName": "Provinsi Baru",
  "totalVotes": 5,
  "targetMc": "Target MC Baru",
  "politicalAffiliation": "Partai Koalisi 2",
  "supportStatus": "MENGARAH",
  "characteristic": "RENTAN",
  "suratBaiat": true,
  "afiliasiPolitik": true,
  "videoDukungan": false,
  "kedekatanMc": true,
  "atributFisik": false,
  "sosialMedia": true,
  "score": 75,
  "estimatedVotes": 3.75,
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "updatedBy": {
    "username": "admin"
  }
}
```

### Update BPD
```http
PUT /api/bpd/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Required Role:** ADMIN, SUPERADMIN

**Request Body:**
```json
{
  "targetMc": "Updated Target MC",
  "politicalAffiliation": "Updated Partai",
  "supportStatus": "LOCKED",
  "characteristic": "SOLID",
  "suratBaiat": true,
  "afiliasiPolitik": true,
  "videoDukungan": true,
  "kedekatanMc": true,
  "atributFisik": true,
  "sosialMedia": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "provinceName": "DKI Jakarta",
  "totalVotes": 5,
  "targetMc": "Updated Target MC",
  "politicalAffiliation": "Updated Partai",
  "supportStatus": "LOCKED",
  "characteristic": "SOLID",
  "suratBaiat": true,
  "afiliasiPolitik": true,
  "videoDukungan": true,
  "kedekatanMc": true,
  "atributFisik": true,
  "sosialMedia": true,
  "score": 100,
  "estimatedVotes": 5.0,
  "updatedAt": "2026-01-01T01:00:00.000Z",
  "updatedBy": {
    "username": "admin"
  }
}
```

### Delete BPD
```http
DELETE /api/bpd/:id
Authorization: Bearer <token>
```

**Required Role:** SUPERADMIN

**Response:**
```json
{
  "message": "BPD berhasil dihapus"
}
```

### Bulk Upload BPD
```http
POST /api/bpd/bulk-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** ADMIN, SUPERADMIN

**Request Body:**
```
file: [CSV/XLSX file]
```

**Response:**
```json
{
  "message": "Upload berhasil",
  "count": 2
}
```

### Export BPD to CSV
```http
GET /api/bpd/export/csv
Authorization: Bearer <token>
```

**Required Role:** ADMIN, SUPERADMIN

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="bpd_export.csv"

provinceName,totalVotes,targetMc,politicalAffiliation,supportStatus,characteristic,suratBaiat,afiliasiPolitik,videoDukungan,kedekatanMc,atributFisik,sosialMedia,score,estimatedVotes,updatedAt,updatedBy
DKI Jakarta,5,Target MC Jakarta,Partai Koalisi 1,LOCKED,SOLID,true,true,true,true,true,true,100,5.0,2026-01-01T00:00:00.000Z,superadmin
```

### Get Stats Summary
```http
GET /api/bpd/stats/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalVotes": 125.5,
  "targetVotes": 96,
  "progress": 130.7,
  "locked": 15,
  "lean": 12,
  "swing": 11,
  "solid": 18,
  "rentan": 10,
  "waspada": 10,
  "totalBpds": 38
}
```

## User Management (Superadmin Only)

### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

**Required Role:** SUPERADMIN

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "superadmin",
    "role": "SUPERADMIN",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "_count": {
      "bpds": 38
    }
  }
]
```

### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json
```

**Required Role:** SUPERADMIN

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "message": "User berhasil dibuat",
  "user": {
    "id": "uuid",
    "username": "newuser",
    "role": "ADMIN",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Required Role:** SUPERADMIN

**Request Body:**
```json
{
  "username": "updateduser",
  "password": "newpassword123",
  "role": "USER"
}
```

**Response:**
```json
{
  "message": "User berhasil diperbarui",
  "user": {
    "id": "uuid",
    "username": "updateduser",
    "role": "USER",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T01:00:00.000Z"
  }
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Required Role:** SUPERADMIN

**Response:**
```json
{
  "message": "User berhasil dihapus"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": {
    "field": "username",
    "message": "Username is required"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Data Models

### BPD Model
```typescript
interface Bpd {
  id: string;
  provinceName: string;
  totalVotes: number;
  targetMc?: string;
  politicalAffiliation?: string;
  supportStatus: 'TERKUNCI' | 'MENGARAH' | 'DINAMIS';
  characteristic: 'SOLID' | 'RENTAN' | 'WASPADA';
  suratBaiat: boolean;
  afiliasiPolitik: boolean;
  videoDukungan: boolean;
  kedekatanMc: boolean;
  atributFisik: boolean;
  sosialMedia: boolean;
  score: number;
  estimatedVotes: number;
  updatedAt: string;
  updatedBy: {
    username: string;
  };
}
```

### User Model
```typescript
interface User {
  id: string;
  username: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}
```

### Stats Summary Model
```typescript
interface StatsSummary {
  totalVotes: number;
  targetVotes: number;
  progress: number;
  locked: number;
  lean: number;
  swing: number;
  solid: number;
  rentan: number;
  waspada: number;
  totalBpds: number;
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Data endpoints**: 100 requests per minute
- **File upload**: 10 requests per minute

## Pagination

Pagination is not currently implemented but can be added with:
```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## Interactive Documentation

Visit `http://localhost:5000/api-docs` for interactive Swagger UI documentation with:
- Try it out functionality
- Request/response examples
- Schema definitions
- Authentication testing
