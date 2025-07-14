# EDC Neon PostgreSQL Setup Guide

## Overview

This guide provides complete setup instructions for the EDC (Electronic Data Capture) backend with Neon PostgreSQL integration, including test user authentication bypass.

## 🔧 Prerequisites

- Python 3.10+
- Poetry (for dependency management)
- Neon PostgreSQL account
- Git

## 🚀 Quick Setup

### 1. Setup Neon PostgreSQL Database

1. **Create Neon Account**: Go to [https://neon.tech](https://neon.tech) and create an account
2. **Create Database**: Create a new database named `edc_production` (or your preferred name)
3. **Get Connection String**: Copy your connection string from the Neon dashboard

### 2. Configure Environment

1. **Update Environment Variables**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file** with your Neon PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql+asyncpg://username:password@ep-example-123456.us-east-1.aws.neon.tech/edc_production?sslmode=require
   JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-characters-long
   ```

   > ⚠️ **Important**: Replace with your actual Neon connection string and generate a strong JWT secret key

### 3. Install Dependencies

```bash
cd backend
poetry install
```

### 4. Initialize Database

Choose one of these methods:

#### Method A: Using Python Script (Recommended)
```bash
python init_database.py
```

#### Method B: Using SQL Script Directly
```bash
psql "your-neon-connection-string" -f neon_database_setup.sql
```

### 5. Start the Backend

```bash
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔐 Test Users

The following test users are automatically seeded and **bypass password validation**:

| Email | Role | Password | Notes |
|-------|------|----------|-------|
| `superadmin@edc.com` | `super_admin` | **ANY PASSWORD** | Full system access |
| `admin@edc.com` | `admin` | **ANY PASSWORD** | Administrative access |
| `employee@edc.com` | `employee` | **ANY PASSWORD** | Standard user access |

> 🔑 **Important**: These test users can login with ANY password for testing purposes. Password validation is bypassed in the authentication logic.

## 📊 Database Structure

The complete database includes:

### Core Tables
- **users** - User authentication and management
- **projects** - Project management with user assignments
- **forms** - Dynamic form submissions and data capture
- **audit_logs** - Comprehensive audit trail

### Extended Tables
- **form_templates** - Dynamic form template definitions
- **field_definitions** - Form field configurations
- **volunteers** - Study participant management
- **form_submission_history** - Detailed form change tracking
- **clients** - Organizational structure
- **reports** - Analytics and reporting
- **system_settings** - Application configuration

### Features
- ✅ UUID primary keys for all tables
- ✅ Comprehensive audit trailing
- ✅ Role-based access control
- ✅ Automatic timestamp updates
- ✅ Performance indexes
- ✅ SSL support for Neon
- ✅ Test data seeding

## 🧪 Testing the Setup

### 1. Test Database Connection
```bash
cd backend
poetry run python -c "from app.db.session import get_db; print('Database connection: OK')"
```

### 2. Test Authentication API

**Login with Test User**:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@edc.com",
    "password": "any-password-works"
  }'
```

Expected response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "superadmin@edc.com", 
    "role": "super_admin",
    "status": "active"
  }
}
```

### 3. Test API Endpoints

**Get Current User**:
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer your-jwt-token"
```

**Health Check**:
```bash
curl -X GET "http://localhost:8000/health"
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql+asyncpg://user:pass@host/db?sslmode=require` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | `your-32-char-secret-key` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `11520` (8 days) |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins | `["http://localhost:3000"]` |
| `DEBUG` | Enable debug mode | `true` or `false` |

### Security Settings

- **BCRYPT_ROUNDS**: Password hashing rounds (default: 12)
- **SSL_MODE**: Always `require` for Neon
- **CORS**: Configure allowed origins for your frontend

## 🚨 Production Deployment

### 1. Security Checklist

- [ ] Generate strong JWT_SECRET_KEY (32+ characters)
- [ ] Set `DEBUG=false` 
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure proper CORS origins
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS certificates

### 2. Environment Configuration

Update your production `.env`:
```env
DATABASE_URL=postgresql+asyncpg://produser:strongpass@your-neon-endpoint/edc_production?sslmode=require
JWT_SECRET_KEY=your-production-secret-key-32-chars-minimum
DEBUG=false
ENVIRONMENT=production
BACKEND_CORS_ORIGINS=["https://your-frontend-domain.com"]
```

### 3. Test User Management

In production, you may want to:
- Remove test user bypass logic from `auth.py`
- Create proper admin accounts with real passwords
- Implement proper user management workflows

## 📝 API Documentation

Once running, access interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Error**:
```
Check your DATABASE_URL format and Neon endpoint
Ensure SSL mode is set to 'require'
Verify your Neon database is active
```

**JWT Token Error**:
```
Ensure JWT_SECRET_KEY is at least 32 characters
Check token expiration settings
Verify CORS configuration
```

**Import Errors**:
```
Run: poetry install
Ensure you're in the backend directory
Check Python version (3.10+ required)
```

### Debug Commands

**Check Database Tables**:
```sql
\dt
SELECT * FROM users LIMIT 5;
```

**Test Authentication**:
```bash
poetry run python -c "
from app.core.security import get_password_hash, verify_password
print(get_password_hash('test'))
"
```

## 📚 Additional Resources

- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Async Documentation](https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html)

## 🤝 Support

For issues related to:
- **Database Setup**: Check Neon documentation
- **Authentication**: Review JWT configuration
- **API Issues**: Check FastAPI logs and documentation

---

## Summary

This setup provides:
1. ✅ Complete Neon PostgreSQL database structure
2. ✅ Test user authentication bypass for development
3. ✅ Production-ready backend API
4. ✅ Comprehensive audit logging
5. ✅ Role-based access control
6. ✅ SSL/TLS security for database connections

The three test users (`superadmin@edc.com`, `admin@edc.com`, `employee@edc.com`) can login with any password, making development and testing seamless while maintaining production-quality database structure.