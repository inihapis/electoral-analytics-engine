# Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE hipmi_pemenangan;
```

2. Copy environment file:
```bash
cd server
cp .env.example .env
```

3. Update `.env` file with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/hipmi_pemenangan"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

## Installation & Setup

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

3. Generate Prisma client:
```bash
cd server
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Seed the database with initial data:
```bash
npm run prisma:seed
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

## Default Login Credentials
- Username: `superadmin`
- Password: `password123`

## Features Implemented

✅ **Backend API**
- Authentication with JWT
- BPD CRUD operations
- Support indicators calculation
- Role-based access control
- CSV export functionality
- Stats summary endpoint

✅ **Frontend**
- Dashboard with progress tracking
- BPD management (create, edit, delete)
- Responsive design with Tailwind CSS
- Real-time data updates with React Query

✅ **Database**
- PostgreSQL with Prisma ORM
- Proper schema for BPD and Users
- Seed data for 38 provinces

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### BPD Management
- `GET /api/bpd` - Get all BPDs
- `GET /api/bpd/:id` - Get specific BPD
- `POST /api/bpd` - Create new BPD (Admin/Superadmin only)
- `PUT /api/bpd/:id` - Update BPD (Admin/Superadmin only)
- `DELETE /api/bpd/:id` - Delete BPD (Superadmin only)
- `GET /api/bpd/stats/summary` - Get dashboard statistics
- `GET /api/bpd/export/csv` - Export BPDs to CSV (Admin/Superadmin only)

## Next Steps

The system is now ready for use! You can:
1. Log in with the default credentials
2. View the dashboard analytics
3. Manage BPD data
4. Export data for analysis
5. Track progress towards the 96-vote target
