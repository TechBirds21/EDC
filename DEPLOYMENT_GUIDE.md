# EDC Production Deployment Guide

## Overview

This guide covers deploying the Electronic Data Capture (EDC) system to production with proper security, monitoring, and scalability considerations.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │    │   (FastAPI)     │    │   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8000    │    │   Neon Cloud    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Reverse       │
                    │   Proxy/LB      │
                    │   (Nginx)       │
                    └─────────────────┘
```

## Prerequisites

### System Requirements

- **Server**: Linux (Ubuntu 20.04+ recommended)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **CPU**: 2+ cores
- **Storage**: 20GB+ available space
- **Network**: HTTPS certificate (Let's Encrypt recommended)

### Software Dependencies

- Python 3.10+
- Node.js 18+
- Nginx (for reverse proxy)
- PM2 or systemd (for process management)
- Git

## Phase 1: Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx
```

### 2. Install Python and Poetry

```bash
# Install Python 3.10+
sudo apt install -y python3.10 python3.10-venv python3-pip

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Install Node.js

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

## Phase 2: Application Deployment

### 1. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/TechBirds21/EDC.git
sudo chown -R $USER:$USER /opt/EDC
cd /opt/EDC
```

### 2. Backend Setup

```bash
cd /opt/EDC/backend

# Install dependencies
poetry install --only=main

# Create environment file
cp .env.example .env
nano .env  # Edit with production values
```

**Important Environment Variables:**

```bash
# MUST CHANGE THESE FOR PRODUCTION:
JWT_SECRET_KEY=your-super-secure-random-key-64-characters-minimum
DEBUG=false
ENVIRONMENT=production

# Database (provided Neon connection)
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_KOIGcFo9NJh7@ep-flat-river-a1y2bf91-pooler.ap-southeast-1.aws.neon.tech/neondb

# CORS for your domain
BACKEND_CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

### 3. Initialize Database

```bash
# Run database setup
poetry run python -m app.db.init_db
```

### 4. Frontend Setup

```bash
cd /opt/EDC

# Install dependencies
npm install

# Create production build
npm run build

# The build files will be in ./dist directory
```

### 5. Create Service Files

**Backend Service (`/etc/systemd/system/edc-backend.service`):**

```ini
[Unit]
Description=EDC Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/EDC/backend
Environment=PATH=/opt/EDC/backend/.venv/bin
ExecStart=/opt/EDC/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**Enable and start the service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable edc-backend
sudo systemctl start edc-backend
sudo systemctl status edc-backend
```

## Phase 3: Web Server Configuration

### 1. Nginx Configuration

Create `/etc/nginx/sites-available/edc`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (React app)
    location / {
        root /opt/EDC/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Client max body size (for file uploads)
    client_max_body_size 10M;
}
```

### 2. Enable Site and SSL

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/edc /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

## Phase 4: Security Hardening

### 1. Firewall Configuration

```bash
# Install and configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Fail2Ban (Optional but recommended)

```bash
sudo apt install -y fail2ban

# Create custom jail for Nginx
sudo tee /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl restart fail2ban
```

### 3. Regular Updates

```bash
# Create update script
sudo tee /usr/local/bin/edc-update.sh <<'EOF'
#!/bin/bash
cd /opt/EDC

# Update code
git pull origin main

# Update backend
cd backend
poetry install --only=main
sudo systemctl restart edc-backend

# Update frontend
cd ..
npm install
npm run build

# Restart services
sudo systemctl reload nginx

echo "EDC updated successfully at $(date)"
EOF

sudo chmod +x /usr/local/bin/edc-update.sh
```

## Phase 5: Monitoring and Backup

### 1. Log Management

```bash
# Configure logrotate for application logs
sudo tee /etc/logrotate.d/edc <<EOF
/var/log/edc/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
}
EOF
```

### 2. Health Monitoring Script

```bash
# Create monitoring script
sudo tee /usr/local/bin/edc-health-check.sh <<'EOF'
#!/bin/bash

# Check backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$BACKEND_STATUS" != "200" ]; then
    echo "Backend unhealthy, restarting..."
    sudo systemctl restart edc-backend
    # Send alert (configure with your notification system)
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx down, restarting..."
    sudo systemctl restart nginx
fi

echo "Health check completed at $(date)"
EOF

sudo chmod +x /usr/local/bin/edc-health-check.sh

# Add to crontab (run every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/edc-health-check.sh >> /var/log/edc-health.log 2>&1") | crontab -
```

### 3. Database Backup (if using local PostgreSQL)

```bash
# For Neon Cloud, backups are handled automatically
# Monitor via Neon dashboard: https://console.neon.tech/
```

## Phase 6: Performance Optimization

### 1. Backend Optimization

```bash
# Adjust worker count based on CPU cores
# In systemd service file: --workers $(nproc)

# Add production ASGI server (in production environment)
poetry add gunicorn[uvloop]

# Update service file to use Gunicorn:
# ExecStart=/opt/EDC/backend/.venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 2. Redis for Caching (Optional)

```bash
sudo apt install -y redis-server

# Configure Redis for session storage and caching
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

## Phase 7: Testing Production Deployment

### 1. Smoke Tests

```bash
# Test backend health
curl https://yourdomain.com/health

# Test frontend
curl -I https://yourdomain.com/

# Test API authentication
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@edc.com","password":"Employee123!"}'
```

### 2. Load Testing (Optional)

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test script
cat > load-test.yml <<EOF
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/health"
EOF

# Run load test
artillery run load-test.yml
```

## Production Checklist

### Pre-Launch
- [ ] SSL certificate installed and working
- [ ] Environment variables configured for production
- [ ] Database initialized with test users
- [ ] Firewall configured
- [ ] Backup strategy in place
- [ ] Monitoring scripts installed
- [ ] Log rotation configured
- [ ] Health checks working

### Security
- [ ] JWT secret key changed from default
- [ ] DEBUG=false in production
- [ ] CORS origins restricted to production domains
- [ ] Security headers configured
- [ ] Fail2Ban installed (optional)
- [ ] Regular update process established

### Performance
- [ ] Worker count optimized for server
- [ ] Static file caching enabled
- [ ] Database connection pooling configured
- [ ] Load testing completed (optional)

### Monitoring
- [ ] Health check endpoint accessible
- [ ] Log files being rotated
- [ ] Monitoring scripts scheduled
- [ ] Error alerting configured (optional)

## Troubleshooting

### Common Issues

1. **Backend won't start**
   ```bash
   sudo journalctl -u edc-backend -f
   ```

2. **Database connection issues**
   ```bash
   # Check network connectivity to Neon
   ping ep-flat-river-a1y2bf91-pooler.ap-southeast-1.aws.neon.tech
   ```

3. **Frontend not loading**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Permission issues**
   ```bash
   sudo chown -R www-data:www-data /opt/EDC
   ```

### Log Locations

- Backend: `sudo journalctl -u edc-backend`
- Nginx: `/var/log/nginx/error.log`, `/var/log/nginx/access.log`
- System: `/var/log/syslog`

## Maintenance

### Regular Tasks

1. **Weekly**: Check system updates
2. **Monthly**: Review logs and performance
3. **Quarterly**: Security audit and dependency updates
4. **As needed**: Application updates via git pull

### Update Process

```bash
# Pull latest changes
cd /opt/EDC
git pull origin main

# Update and restart
/usr/local/bin/edc-update.sh
```

This completes the production deployment guide. The system should now be fully operational with proper security, monitoring, and maintenance procedures in place.