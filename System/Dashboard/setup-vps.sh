#!/bin/bash
# AI Business OS - VPS Setup Script for Ubuntu 24.04
# Uses Claude Code CLI for AI interactions

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║       AI BUSINESS OS - VPS SETUP SCRIPT                ║"
echo "║       Using Claude Code CLI Integration                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Variables
DOMAIN="os.d20.com.ng"
APP_DIR="/var/www/ai-business-os"
GITHUB_REPO="https://github.com/lxlbxl/AI_Business_OS.git"
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

# Install Claude Code CLI
log_info "Installing Claude Code CLI..."
if ! command -v claude &> /dev/null; then
  curl -fsSL https://claude.ai/install.sh | sh
  log_warn "Claude Code installed. You'll need to run 'claude login' as the www-data user later."
else
  log_info "Claude Code CLI already installed"
fi

# Create app directory
log_info "Setting up application directory..."
mkdir -p $APP_DIR

# Clone from GitHub
if [ -d "$APP_DIR/.git" ]; then
  log_info "Repository exists, pulling latest..."
  cd $APP_DIR
  git pull
else
  log_info "Cloning repository..."
  git clone $GITHUB_REPO $APP_DIR
fi

cd $APP_DIR

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
ADMIN_PASSWORD=changeme123
EOF
  log_warn "Please update ADMIN_PASSWORD in $APP_DIR/System/Dashboard/backend/.env"
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
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ai-business-os
Environment=NODE_ENV=production
Environment=HOME=/var/www

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R www-data:www-data $APP_DIR

# Create home directory for www-data (needed for Claude Code)
mkdir -p /var/www
chown www-data:www-data /var/www

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

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                 SETUP COMPLETE!                         ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║                                                         ║"
echo "║  ⚠️  IMPORTANT: Authenticate Claude Code CLI            ║"
echo "║                                                         ║"
echo "║  Run these commands:                                    ║"
echo "║                                                         ║"
echo "║    sudo -u www-data -H claude login                    ║"
echo "║                                                         ║"
echo "║  This will authenticate Claude for the service user.  ║"
echo "║                                                         ║"
echo "╠════════════════════════════════════════════════════════╣"
echo "║                                                         ║"
echo "║  1. Update your domain DNS to point to this server     ║"
echo "║                                                         ║"
echo "║  2. (Optional) Enable SSL:                              ║"
echo "║     sudo certbot --nginx -d $DOMAIN                    ║"
echo "║                                                         ║"
echo "║  3. Access your dashboard at:                           ║"
echo "║     http://$DOMAIN or http://$(hostname -I | awk '{print $1}')  
echo "║                                                         ║"
echo "║  Default Login: admin / changeme123                     ║"
echo "║  ⚠️  CHANGE THIS IMMEDIATELY!                          ║"
echo "║                                                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Show service status
systemctl status ai-business-os --no-pager || true

echo ""
echo "To authenticate Claude Code CLI, run:"
echo "  sudo -u www-data -H claude login"
