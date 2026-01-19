# 🌐 AI Business OS - Dashboard Deployment Guide

## Overview

This dashboard provides remote access to your AI Business OS with:
- 💬 **AI Chat Interface** - Communicate with your AI-COO
- 📁 **File Browser** - View and edit OS files
- ✅ **Approvals Panel** - Human-in-the-loop decisions
- ⚡ **Quick Workflows** - Run routines with one click

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      YOUR VPS                            │
│                                                          │
│  ┌─────────────┐     ┌───────────────────────────────┐  │
│  │   Nginx     │     │  Frontend (React)             │  │
│  │   Port 80   │────▶│  Static files in /dist        │  │
│  │   (443/SSL) │     └───────────────────────────────┘  │
│  │             │                                        │
│  │             │     ┌───────────────────────────────┐  │
│  │   /api/*    │────▶│  Backend (Node.js/Express)    │  │
│  │             │     │  Port 7890                    │  │
│  └─────────────┘     │  - Auth (JWT)                 │  │
│                      │  - File System Access         │  │
│                      │  - Claude API Integration     │  │
│                      └───────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              AI Business OS Files                  │  │
│  │  /var/www/ai-business-os/                          │  │
│  │  ├── 00_Governance/                                │  │
│  │  ├── 01_Strategy/                                  │  │
│  │  ├── 02_Projects/ ...                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- Ubuntu 24.04 VPS (2GB RAM minimum)
- Domain name (optional but recommended for SSL)
- Anthropic API key for AI features

---

## Deployment Options

### Option 1: Automated Setup (Recommended)

1. **Copy files to VPS:**
   ```bash
   # From your local machine
   scp -r AI_Business_OS user@your-vps:/var/www/ai-business-os
   ```

2. **Run the setup script:**
   ```bash
   ssh user@your-vps
   cd /var/www/ai-business-os/System/Dashboard
   chmod +x setup-vps.sh
   sudo ./setup-vps.sh
   ```

3. **Configure API key:**
   ```bash
   sudo nano /var/www/ai-business-os/System/Dashboard/backend/.env
   # Add your ANTHROPIC_API_KEY
   sudo systemctl restart ai-business-os
   ```

4. **Enable SSL (optional):**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option 2: GitHub + Auto-Deploy

1. **Push AI_Business_OS to a private GitHub repo**

2. **Edit setup-vps.sh:**
   ```bash
   GITHUB_REPO="https://github.com/yourusername/AI_Business_OS.git"
   DOMAIN="your-domain.com"
   ```

3. **Run setup script on VPS**

---

## Manual Deployment

### 1. Install Dependencies

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

# Verify
node --version  # Should be 20.x
npm --version
```

### 2. Setup Application

```bash
# Create directory
sudo mkdir -p /var/www/ai-business-os
cd /var/www/ai-business-os

# Copy or clone your files here
# ...

# Install backend
cd System/Dashboard/backend
npm install
cp .env.example .env
nano .env  # Add your ANTHROPIC_API_KEY

# Build frontend
cd ../frontend
npm install
npm run build
```

### 3. Create Systemd Service

```bash
sudo nano /etc/systemd/system/ai-business-os.service
```

Paste:
```ini
[Unit]
Description=AI Business OS Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ai-business-os/System/Dashboard/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-business-os
sudo systemctl start ai-business-os
```

### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/ai-business-os
```

See `setup-vps.sh` for full Nginx config, then:

```bash
sudo ln -s /etc/nginx/sites-available/ai-business-os /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Enable SSL

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | API server port (default: 7890) | No |
| `JWT_SECRET` | Secret for JWT tokens (auto-generated) | Yes |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes (for AI) |

### Changing Default Password

The default login is `admin` / `admin123`. To change it:

1. Login with default credentials
2. (Feature to add: Settings page with password change)

Or manually hash a new password and update `server.js`.

---

## Useful Commands

```bash
# Check backend status
sudo systemctl status ai-business-os

# View backend logs
sudo journalctl -u ai-business-os -f

# Restart backend
sudo systemctl restart ai-business-os

# Rebuild frontend
cd /var/www/ai-business-os/System/Dashboard/frontend
npm run build
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Enable SSL with Certbot
- [ ] Set strong JWT_SECRET
- [ ] Configure firewall (UFW)
- [ ] Keep API key secure
- [ ] Regular security updates

---

## Troubleshooting

### AI not responding
- Check ANTHROPIC_API_KEY in `.env`
- Restart backend: `sudo systemctl restart ai-business-os`
- Check logs: `sudo journalctl -u ai-business-os -f`

### 502 Bad Gateway
- Backend not running: `sudo systemctl start ai-business-os`
- Wrong port in Nginx config
- Check backend logs for errors

### Frontend not loading
- Rebuild: `npm run build` in frontend directory
- Check Nginx root path
- Clear browser cache

---

## Local Development

```bash
# Terminal 1: Backend
cd System/Dashboard/backend
npm run dev

# Terminal 2: Frontend
cd System/Dashboard/frontend
npm run dev
```

Access at `http://localhost:5173` (frontend proxies API to 7890)

---

*Dashboard Version: 1.0.0*
*Last Updated: 2026-01-19*
