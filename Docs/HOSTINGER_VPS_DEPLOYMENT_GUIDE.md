# Hostinger KVM VPS Production Deployment Guide
## Jiza Jewellery Studio — PostgreSQL + Node.js + Nginx + PM2 + SSL

This document provides a step-by-step, production-ready guide to deploy **Jiza Jewellery Studio** on a **Hostinger KVM VPS** running **Ubuntu 22.04 LTS**.

---

## 1. System Requirements & Stack Overview

- **Operating System**: Ubuntu 22.04 LTS (Hostinger KVM VPS)
- **Database**: PostgreSQL 14+
- **Application Runtime**: Node.js 20 LTS
- **Process Manager**: PM2 (Cluster Mode & System Auto-Restart)
- **Web Server / Reverse Proxy**: Nginx
- **SSL Certificate**: Let's Encrypt (Certbot)
- **Firewall**: UFW (Uncomplicated Firewall)

---

## 2. Step 1: Connect to VPS & Install Dependencies

SSH into your Hostinger VPS as `root` (or sudo user):
```bash
ssh root@YOUR_SERVER_IP
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

Install essential tools, Node.js 20 LTS, Git, and build tools:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx ufw certbot python3-certbot-nginx
```

Verify Node.js & npm installation:
```bash
node -v   # Should be v20.x.x
npm -v    # Should be v10.x.x
```

Install **PM2** globally:
```bash
sudo npm install -g pm2
```

---

## 3. Step 2: Install & Configure PostgreSQL

Install PostgreSQL:
```bash
sudo apt install -y postgresql postgresql-contrib
```

Start & enable PostgreSQL service on system startup:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create Database User & Database:
```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt (`postgres=#`), execute:
```sql
CREATE DATABASE jiza_store;
CREATE USER jiza_user WITH PASSWORD 'YourStrongPassword2026';
GRANT ALL PRIVILEGES ON DATABASE jiza_store TO jiza_user;
ALTER DATABASE jiza_store OWNER TO jiza_user;

-- Connect to jiza_store and grant schema privileges
\c jiza_store
GRANT ALL ON SCHEMA public TO jiza_user;

-- Exit PostgreSQL CLI
\q
```

---

## 4. Step 3: Deploy Project Files to `/var/www/`

Create project directory:
```bash
sudo mkdir -p /var/www/jiza-jewellery-studio
sudo chown -R $USER:$USER /var/www/jiza-jewellery-studio
```

Upload your project files to `/var/www/jiza-jewellery-studio` using `git clone` or `scp`/SFTP.

If using Git:
```bash
cd /var/www/jiza-jewellery-studio
git clone YOUR_GIT_REPOSITORY_URL .
```

Install dependencies:
```bash
npm install --production=false
```

---

## 5. Step 4: Configure Environment Variables

Create the production `.env` file inside `/var/www/jiza-jewellery-studio`:
```bash
nano /var/www/jiza-jewellery-studio/.env
```

Add the following environment variables:
```env
PORT=5000
NODE_ENV=production

# PostgreSQL Credentials
PGHOST=localhost
PGPORT=5432
PGDATABASE=jiza_store
PGUSER=jiza_user
PGPASSWORD=YourStrongPassword2026

# Enterprise Admin JWT Secret
ADMIN_JWT_SECRET=jiza-studio-enterprise-secret-key-998877665544332211
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 6. Step 5: Run Schema Initialization & Data Migration

Initialize the PostgreSQL schema and migrate data from SQLite (if migrating existing store data):
```bash
node server/db/migrate_sqlite_to_pg.js
```

You should see output confirming:
```
✅ Connected to PostgreSQL!
📜 Applied PostgreSQL schema.
📦 Migrating 'users'...
📦 Migrating 'products'...
📦 Migrating 'orders'...
🎉 PostgreSQL Data Migration Completed Successfully!
```

---

## 7. Step 6: Build Front-End Assets

Generate the static Vite production bundle (`dist` folder):
```bash
npm run build
```

Verify that the `dist` directory is created cleanly.

Create static uploads folder for customer media & product images:
```bash
mkdir -p /var/www/jiza-jewellery-studio/public/uploads
chmod -R 755 /var/www/jiza-jewellery-studio/public/uploads
```

---

## 8. Step 7: Configure PM2 for Automatic System Restart

Start backend server cluster with PM2:
```bash
cd /var/www/jiza-jewellery-studio
pm2 start ecosystem.config.cjs --env production
```

Save current PM2 process list:
```bash
pm2 save
```

Enable PM2 to auto-start on VPS server reboot:
```bash
pm2 startup
```
*(Copy and execute the command printed by PM2 in your terminal)*.

Check server status:
```bash
pm2 status
```

---

## 9. Step 8: Configure Nginx Reverse Proxy

Create Nginx site configuration file:
```bash
sudo nano /etc/nginx/sites-available/jiza-jewellery-studio
```

Paste the following configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com; # Replace with your domain or VPS IP

    root /var/www/jiza-jewellery-studio/dist;
    index index.html;

    # Gzip Compression Optimization
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_comp_level 6;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /uploads/ {
        alias /var/www/jiza-jewellery-studio/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;
    }
}
```

Enable the Nginx site and test configuration:
```bash
sudo ln -s /etc/nginx/sites-available/jiza-jewellery-studio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. Step 9: Enable SSL (HTTPS) via Let's Encrypt

Secure domain with free SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the interactive prompts. Certbot will automatically rewrite Nginx config to enforce HTTPS and set up auto-renewal cron jobs.

---

## 11. Step 10: Configure UFW Firewall

Enable UFW security rules:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Verify firewall status:
```bash
sudo ufw status
```

---

## 12. Maintenance & Operations Reference Commands

### Check Live Application Logs
```bash
pm2 logs jiza-backend
```

### Restart Server
```bash
pm2 restart jiza-backend
```

### PostgreSQL Backup (Daily Database Dump)
```bash
pg_dump -U jiza_user -h localhost jiza_store > /var/backups/jiza_store_backup_$(date +%F).sql
```

### PostgreSQL Restore
```bash
psql -U jiza_user -h localhost -d jiza_store < /var/backups/jiza_store_backup_2026-08-06.sql
```

---

## Technical Support & Verification Checklist

- [x] PostgreSQL 14+ Relational Database Active
- [x] Node.js 20 Backend running on PM2 Cluster Mode
- [x] Environment Security & CORS/Helmet Headers Enabled
- [x] Vite Production Bundle served statically by Nginx
- [x] `/api/` endpoints proxied to Node.js backend port 5000
- [x] Free Let's Encrypt SSL Active on HTTPS
- [x] Server auto-restarts on reboot via systemd & PM2
