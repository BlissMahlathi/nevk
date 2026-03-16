# Nevk Backend Production Checklist and Deploy Recipe

## 1. Production Checklist

- Set `DEBUG=False`.
- Set a strong `SECRET_KEY`.
- Set `ALLOWED_HOSTS` to your real domains.
- Set `ADMIN_URL` to a non-default value (not `admin/`) in production.
- Optionally set `ADMIN_ALLOWED_HOSTS` and/or `ADMIN_ALLOWED_IPS` to restrict admin access.
- Set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to your frontend origin(s).
- Use PostgreSQL (`DB_ENGINE=django.db.backends.postgresql`) with strong credentials.
- Set `WHATSAPP_ORDER_NUMBER` in international digits format (example: `27731234567`).
- Ensure these security env vars are enabled:
  - `SECURE_SSL_REDIRECT=True`
  - `SESSION_COOKIE_SECURE=True`
  - `CSRF_COOKIE_SECURE=True`
  - `SECURE_HSTS_SECONDS=31536000`
  - `SECURE_HSTS_INCLUDE_SUBDOMAINS=True`
  - `SECURE_HSTS_PRELOAD=True`
- Run database migrations.
- Run `collectstatic`.
- Configure Gunicorn as the app server.
- Configure Nginx for TLS termination and reverse proxy.
- Confirm API throttling/permissions defaults in Django REST Framework are active.
- Confirm WhiteNoise compressed static files are enabled after `collectstatic`.

## 2. Example Environment File

Use `backend/.env.example` as a template and create `backend/.env`.

## 3. Basic Ubuntu Deploy Recipe (Gunicorn + Nginx + Postgres)

## 3.1 Install system dependencies

```bash
sudo apt update
sudo apt install -y python3-venv python3-pip postgresql postgresql-contrib nginx
```

## 3.2 PostgreSQL setup

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE nevk;
CREATE USER nevk_user WITH PASSWORD 'replace-with-strong-password';
ALTER ROLE nevk_user SET client_encoding TO 'utf8';
ALTER ROLE nevk_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nevk_user SET timezone TO 'Africa/Johannesburg';
GRANT ALL PRIVILEGES ON DATABASE nevk TO nevk_user;
\q
```

## 3.3 Configure backend env

```bash
cd /home/hlulani/projectFolder/Nevk/backend
cp .env.example .env
# edit .env with production values
```

## 3.4 Install Python packages and run Django tasks

```bash
cd /home/hlulani/projectFolder/Nevk/backend
./djangoenv/bin/pip install gunicorn psycopg2-binary
./djangoenv/bin/python manage.py migrate
./djangoenv/bin/python manage.py collectstatic --noinput
./djangoenv/bin/python manage.py createsuperuser
```

## 3.5 Gunicorn systemd service

Create `/etc/systemd/system/nevk-gunicorn.service`:

```ini
[Unit]
Description=Nevk Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/home/hlulani/projectFolder/Nevk/backend
Environment="PATH=/home/hlulani/projectFolder/Nevk/backend/djangoenv/bin"
ExecStart=/home/hlulani/projectFolder/Nevk/backend/djangoenv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/nevk-gunicorn.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable nevk-gunicorn
sudo systemctl start nevk-gunicorn
sudo systemctl status nevk-gunicorn
```

## 3.6 Nginx site config

Create `/etc/nginx/sites-available/nevk`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Enable response compression for API and text responses.
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        application/json
        application/javascript
        application/xml
        image/svg+xml;

    # Optional: Brotli if nginx-brotli module is available.
    # brotli on;
    # brotli_comp_level 5;
    # brotli_types text/plain text/css application/json application/javascript application/xml image/svg+xml;

    location /static/ {
        alias /home/hlulani/projectFolder/Nevk/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /media/ {
        alias /home/hlulani/projectFolder/Nevk/backend/media/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/run/nevk-gunicorn.sock;
        add_header Vary "Accept-Encoding, Origin" always;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/nevk-gunicorn.sock;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/nevk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3.7 TLS (recommended)

Use Certbot for HTTPS and keep `SECURE_SSL_REDIRECT=True`.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 3.8 Lock down Django admin at Nginx (recommended)

Apply a second security layer before requests reach Django:

- Secret admin path via `ADMIN_URL` in Django.
- IP allowlist in Nginx (`allow`/`deny`).
- HTTP Basic Auth in Nginx.

### 3.8.1 Create admin Basic Auth credentials

```bash
sudo apt install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-nevk-admin nevk_admin
```

### 3.8.2 Update Nginx server block

In your `/etc/nginx/sites-available/nevk`, add an admin location using your real secret path.

Example (replace `secure-admin-7f4k9p`):

```nginx
# Hide default admin path completely
location = /admin { return 404; }
location ^~ /admin/ { return 404; }

# Locked-down Django admin
location ^~ /secure-admin-7f4k9p/ {
    # IP allowlist (examples)
    allow 203.0.113.10;
    allow 198.51.100.0/24;
    deny all;

    # Basic Auth (second factor at edge)
    auth_basic "Restricted Admin";
    auth_basic_user_file /etc/nginx/.htpasswd-nevk-admin;

    include proxy_params;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://unix:/run/nevk-gunicorn.sock;

    # Never cache admin pages
    add_header Cache-Control "no-store" always;
}
```

Make sure Django `.env` matches:

```env
ADMIN_URL=secure-admin-7f4k9p/
ADMIN_ALLOWED_HOSTS=your-backend-domain.com
ADMIN_ALLOWED_IPS=203.0.113.10,198.51.100.25
```

### 3.8.3 Reload services

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nevk-gunicorn
```

### 3.8.4 Verify lockdown

```bash
# should be 404
curl -I https://your-backend-domain.com/admin/

# should be 401 (Basic Auth challenge) from allowed IP
curl -I https://your-backend-domain.com/secure-admin-7f4k9p/

# should be 200 only with valid basic auth from allowed IP
curl -I -u nevk_admin:YOUR_PASSWORD https://your-backend-domain.com/secure-admin-7f4k9p/
```

## 4. Post-Deploy Verification

- `GET /api/health/` returns success.
- Admin is reachable only at your configured `ADMIN_URL` and follows IP/host restrictions.
- Product catalog APIs return data.
- `POST /api/orders/whatsapp/` creates an `Order` and `OrderItem` records and returns `whatsapp_url`.
- Nginx serves `/static/` and `/media/` correctly.
- API responses include expected `Cache-Control` and `Vary` headers.
- Netlify static assets are served with long-lived cache headers from `frontend/public/_headers`.
