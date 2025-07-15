# ================================================================
# EDC Production Environment Variables - Post Migration
# Copy this file to .env in the backend directory and update values
# ================================================================

# Database Configuration
# Use the provided Neon PostgreSQL connection string (Supabase removed)
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_KOIGcFo9NJh7@ep-flat-river-a1y2bf91-pooler.ap-southeast-1.aws.neon.tech/neondb

# Frontend API Configuration
# Set the backend API URL for frontend to connect to
VITE_API_URL=http://localhost:8000  # Development
# VITE_API_URL=https://your-api-domain.com  # Production

# JWT Authentication Settings
# IMPORTANT: Change this secret key in production!
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-please-use-a-strong-random-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days

# CORS Settings - Frontend URLs
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:8080","http://localhost:8081","https://your-domain.com"]

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=EDC - Electronic Data Capture API

# Pagination Settings
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Environment Settings
DEBUG=false  # Set to false in production
ENVIRONMENT=production  # development, staging, production

# Security Settings
BCRYPT_ROUNDS=12  # Password hashing rounds (10-14 recommended)

# Optional: Monitoring and Logging
# SENTRY_DSN=your-sentry-dsn-here
# LOG_LEVEL=INFO

# Optional: File Upload Settings
# MAX_FILE_SIZE=10485760  # 10MB in bytes
# UPLOAD_DIR=/var/uploads

# Optional: Email Settings (for notifications)
# SMTP_HOST=your-smtp-host
# SMTP_PORT=587
# SMTP_USER=your-smtp-user
# SMTP_PASSWORD=your-smtp-password
# FROM_EMAIL=noreply@yourdomain.com

# ================================================================
# Production Deployment Notes:
# ================================================================

# 1. JWT_SECRET_KEY: Generate a strong random key (recommended 64+ characters)
#    Example: python -c "import secrets; print(secrets.token_urlsafe(64))"

# 2. BACKEND_CORS_ORIGINS: Update with your actual frontend domain(s)

# 3. DEBUG: Always set to false in production

# 4. Database: The provided Neon connection string should work as-is

# 5. BCRYPT_ROUNDS: Higher values = more secure but slower (12-14 recommended)

# 6. Consider adding additional environment-specific variables as needed

# Security Checklist:
# ☐ Changed JWT_SECRET_KEY from default
# ☐ Set DEBUG=false 
# ☐ Updated CORS origins for production domains
# ☐ Configured HTTPS/SSL
# ☐ Set up monitoring and logging
# ☐ Configured backup strategy
# ☐ Reviewed database permissions
# ☐ Set up firewall rules
# ☐ Configured rate limiting
# ☐ Regular security updates planned