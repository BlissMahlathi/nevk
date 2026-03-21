# Nevk

Nevk is split into a React/Vite storefront in `frontend/` and a Django REST API in `backend/`.

## Project Layout

- `frontend/`: customer storefront, catalog browsing, cart, and WhatsApp checkout handoff.
- `backend/`: catalog API, order capture, admin, media processing, and deployment config.
- `render.yaml`: example Render deployment for the backend.

## Local Development

Use `npm` for the frontend. The local integration path is:

- frontend dev server: `http://localhost:8080`
- backend API: `http://127.0.0.1:8000/api`

Start the backend:

```bash
cd backend
cp .env.example .env
./djangoenv/bin/pip install -r requirements.txt
./djangoenv/bin/python manage.py migrate
./djangoenv/bin/python manage.py runserver 127.0.0.1:8000
```

Start the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Validation commands:

```bash
cd backend && ./djangoenv/bin/python manage.py test catalog core
cd frontend && npm test
cd frontend && npm run build
cd frontend && npm run lint
```

## Hosting

You have two clean hosting patterns:

1. Same-origin hosting
   Build the frontend and serve it from the same domain as Django behind Nginx. In this setup, leave `VITE_API_BASE_URL` unset in production and the frontend will call `/api`.

2. Split hosting
   Host the frontend on Vercel, Netlify, or Cloudflare Pages and host Django on Render, Railway, or your own VM. In this setup, set `VITE_API_BASE_URL` to the full backend API origin, for example `https://api.nevkcosmetics.com/api`.

## Environment Variables

Backend production env:

- Required: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `WHATSAPP_ORDER_NUMBER`
- Required when using Postgres: `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- Recommended hardening: `ADMIN_URL`, `ADMIN_ALLOWED_HOSTS`, `ADMIN_ALLOWED_IPS`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`, `SECURE_REFERRER_POLICY`, `X_FRAME_OPTIONS`, `WHITENOISE_MAX_AGE`
- Optional media processing: `BG_REMOVAL_SERVICE_URL`, `BG_REMOVAL_SERVICE_TOKEN`, `BG_REMOVAL_TIMEOUT`

Frontend env:

- `VITE_API_BASE_URL`
  Required when frontend and backend are on different origins. Optional when both are served from the same origin.
- `VITE_USE_FALLBACK_CATALOG`
  Keep this `false` in real production. It is only useful for demos or offline previews.

## Deployment References

- Backend production template: `backend/.env.production.example`
- Backend hardening and Ubuntu deploy guide: `backend/DEPLOYMENT.md`
- Frontend local/production env examples: `frontend/.env.example`, `frontend/.env.production.example`
