# EstateBI - Housing Business Intelligence Platform

A production-ready Housing BI platform for analyzing Chennai and Salem real estate data.

## 🏗️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Authentication**: JWT + bcrypt

## 📁 Project Structure

```
estatebi/
├── estatebi-frontend/      # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── services/       # Data processing
│   │   └── scripts/        # Seed scripts
│   ├── .env                # Environment variables
│   └── package.json
├── database/               # SQL schemas
│   ├── schema.sql          # Database schema
│   └── sample_data.sql     # Seed data
└── data/                   # Upload directories
    ├── raw/                # Uploaded files
    └── processed/          # Processed files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Clone the repository
```bash
git clone https://github.com/Arjjun-S/Estate-BI.git
cd Estate-BI
```

### 2. Setup Database
```bash
# Create database and run schema
mysql -u root -p < database/schema.sql
```

### 3. Configure Backend
```bash
cd server

# Edit .env file with your credentials
# Install dependencies
npm install

# Seed database with sample data
npm run seed
```

### 4. Start Backend Server
```bash
npm run dev
```
Server runs on http://localhost:5000

### 5. Setup Frontend
```bash
cd ../estatebi-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on http://localhost:5173

## 🔐 Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@estatebi.com | admin123 | Admin |
| arjun@estatebi.com | admin123 | Analyst |

## 📊 Features

- **Dashboard**: Real-time analytics with inventory, pricing trends, and regional distribution
- **Data Upload**: CSV/JSON file upload with preprocessing and validation
- **Reports**: Detailed property and transaction reports
- **System Logs**: Activity tracking and audit trail
- **Settings**: User profile management

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| users | User accounts with roles |
| regions | Chennai and Salem regions |
| properties | Property listings |
| transactions | Sales transactions |
| daily_metrics | Analytics data |
| logs | System activity logs |
| upload_history | File upload records |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Current user info

### Dashboard
- `GET /api/dashboard/metrics` - Overview metrics
- `GET /api/dashboard/price-trends` - Price trends
- `GET /api/dashboard/regional-distribution` - Regional stats
- `GET /api/dashboard/recent-transactions` - Latest transactions

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Upload
- `POST /api/upload/` - Upload data file
- `GET /api/upload/history` - Upload history
- `GET /api/upload/template` - Download CSV template

## 🌐 Remote Database Configuration

Update `server/.env` with your remote database credentials:

```env
DB_HOST=your-remote-host.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=estatebi
```

## 📝 Data Preprocessing Rules

The ETL pipeline applies these rules:
1. Missing price → Fill with city median
2. Missing sqft → Estimate from type average
3. Missing region → Assign "Unknown"
4. Normalize enums (case-insensitive)
5. Remove duplicates by property_code

## 📜 License

MIT License - Arjun S
