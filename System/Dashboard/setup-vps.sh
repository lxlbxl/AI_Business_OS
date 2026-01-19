#!/bin/bash
# AI Business OS - VPS Setup Script for Ubuntu 24.04
# Run this script on your VPS to deploy the dashboard

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║       AI BUSINESS OS - VPS SETUP SCRIPT                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Variables - CUSTOMIZE THESE
DOMAIN="your-domain.com"  # Change to your domain
APP_DIR="/var/www/ai-business-os"
GITHUB_REPO=""  # Optional: your GitHub repo URL
PORT=7890

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "Please run as root (sudo ./setup-vps.sh)"
  exit 1
fi

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20 LTS
log_info "Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node --version
npm --version

# Install Nginx
log_info "Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
log_info "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Install Git
apt install -y git

# Create app directory
log_info "Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# If using Git repo
if [ -n "$GITHUB_REPO" ]; then
  log_info "Cloning repository..."
  git clone $GITHUB_REPO .
else
  log_warn "No GitHub repo configured. Please upload files manually to $APP_DIR"
fi

# Install backend dependencies
log_info "Installing backend dependencies..."
cd $APP_DIR/System/Dashboard/backend
npm install

# Create backend .env file
if [ ! -f .env ]; then
  log_info "Creating backend .env file..."
  cat > .env << EOF
PORT=$PORT
JWT_SECRET=$(openssl rand -base64 32)
ANTHROPIC_API_KEY=your-api-key-here
EOF
  log_warn "Please update ANTHROPIC_API_KEY in $APP_DIR/System/Dashboard/backend/.env"
fi

# Install frontend dependencies and build
log_info "Building frontend..."
cd $APP_DIR/System/Dashboard/frontend
npm install
npm run build

# Create systemd service for backend
log_info "Creating systemd service..."
cat > /etc/systemd/system/ai-business-os.service << EOF
[Unit]
Description=AI Business OS Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$APP_DIR/System/Dashboard/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ai-business-os
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R www-data:www-data $APP_DIR

# Enable and start service
systemctl daemon-reload
systemctl enable ai-business-os
systemctl start ai-business-os

# Configure Nginx
log_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/ai-business-os << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend static files
    location / {
        root $APP_DIR/System/Dashboard/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/ai-business-os /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Configure firewall
log_info "Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow 22
ufw --force enable

# SSL Certificate (optional - uncomment if domain is configured)
# log_info "Setting up SSL certificate..."
# certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email your@email.com

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                 SETUP COMPLETE!                         ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║                                                         ║"
echo "║  1. Update your domain DNS to point to this server     ║"
echo "║                                                         ║"
echo "║  2. Edit the backend .env file:                        ║"
echo "║     nano $APP_DIR/System/Dashboard/backend/.env         "
echo "║     Add your ANTHROPIC_API_KEY                          ║"
echo "║                                                         ║"
echo "║  3. Restart the backend:                                ║"
echo "║     sudo systemctl restart ai-business-os              ║"
echo "║                                                         ║"
echo "║  4. (Optional) Enable SSL:                              ║"
echo "║     sudo certbot --nginx -d $DOMAIN                    ║"
echo "║                                                         ║"
echo "║  5. Access your dashboard at:                           ║"
echo "║     http://$DOMAIN                                     ║"
echo "║                                                         ║"
echo "║  Default Login: admin / admin123                        ║"
echo "║  ⚠️  CHANGE THIS IMMEDIATELY!                          ║"
echo "║                                                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Show service status
systemctl status ai-business-os --no-pager
