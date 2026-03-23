# Nevk

Nevk uses a React/Vite storefront in `frontend/` with Supabase as the primary backend for catalog data and media.
The Django API in `backend/` remains available for admin/legacy workflows.

## Project Layout

- `frontend/`: customer storefront, catalog browsing, cart, and WhatsApp checkout handoff.
- `backend/`: order capture, admin, media processing, Supabase migration tooling, and deployment config.
- `render.yaml`: example Render deployment for the backend.

## Local Development

Use `npm` for the frontend.

Start the frontend (Supabase mode):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Legacy backend (optional):

```bash
cd backend
cp .env.example .env
./djangoenv/bin/pip install -r requirements.txt
./djangoenv/bin/python manage.py migrate
./djangoenv/bin/python manage.py runserver 127.0.0.1:8000
```

Catalog route note:

- `/api/catalog/*` is archived and returns `410 Gone`.
- Live catalog reads are served by Supabase from the frontend.

Start the backend with Docker (optional):

```bash
cp backend/.env.docker.example backend/.env.docker
docker compose up --build backend db
```

Validation commands:

```bash
cd frontend && npm test
cd frontend && npm run build
cd frontend && npm run lint
cd backend && ./djangoenv/bin/python manage.py test catalog core
```

Legacy backend container validation:

```bash
docker compose ps
curl http://127.0.0.1:8000/api/health/
```

## Hosting

Primary hosting pattern:

1. Host frontend and Supabase separately
   Host the frontend on Vercel, Netlify, or Cloudflare Pages and connect to Supabase using public anon credentials.

Optional legacy pattern:

2. Keep Django for API/admin workflows
   Host Django on Render, Railway, or your own VM while frontend catalog traffic continues to use Supabase.

## One-Time Catalog Migration To Supabase

Use the documented flow in [backend/SUPABASE_MIGRATION.md](backend/SUPABASE_MIGRATION.md):

1. Apply [supabase/migrations/20260323_catalog_schema_and_rls.sql](supabase/migrations/20260323_catalog_schema_and_rls.sql).
2. Export from Django with `manage.py export_catalog_for_supabase`.
3. Import into Supabase with `backend/scripts/import_catalog_to_supabase.py`.

## Switch Backend Hosting To Railway

If your current backend host is unstable, this repository is now preconfigured for Railway.

1. Push this repository to GitHub.
2. In Railway, create a new project from the repo.
3. Add a PostgreSQL service in the same Railway project.
4. Add backend environment variables in Railway service settings:

- `DEBUG=False`
- `SECRET_KEY=<strong-random-secret>`
- `ALLOWED_HOSTS=<your railway domain,custom api domain>`
- `CORS_ALLOWED_ORIGINS=<your frontend origin>`
- `CSRF_TRUSTED_ORIGINS=<your frontend origin>`
- `WHATSAPP_ORDER_NUMBER=27715231720`
- `DB_ENGINE=django.db.backends.postgresql`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` from the Railway Postgres service

5. Railway will use [Procfile](Procfile) and [railway.json](railway.json) to start Django with migrations and static collection.
6. If you still need the Django API from the frontend for specific features, configure those calls explicitly in code.

Detailed backend hardening still applies from [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md).

## Environment Variables

Backend production env:

- Required: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `WHATSAPP_ORDER_NUMBER`
- Required when using Postgres: `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- Alternative for managed hosts: `DATABASE_URL` (takes precedence over `DB_*`), optionally `DB_SSL_REQUIRE=True`
- Recommended hardening: `ADMIN_URL`, `ADMIN_ALLOWED_HOSTS`, `ADMIN_ALLOWED_IPS`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`, `SECURE_REFERRER_POLICY`, `X_FRAME_OPTIONS`, `WHITENOISE_MAX_AGE`
- Optional media processing: `BG_REMOVAL_SERVICE_URL`, `BG_REMOVAL_SERVICE_TOKEN`, `BG_REMOVAL_TIMEOUT`

Frontend env:

- `VITE_SUPABASE_URL`
  Required Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`
  Required Supabase public anon key.
- `VITE_SUPABASE_PRODUCTS_BUCKET`
  Optional product image bucket. Defaults to `products`.
- `VITE_WHATSAPP_ORDER_NUMBER`
  Optional checkout WhatsApp number. Defaults to `27715231720`.
- `VITE_USE_FALLBACK_CATALOG`
  Keep this `false` in real production. It is only useful for demos or offline previews.

## Deployment References

- Backend production template: `backend/.env.production.example`
- Backend container env template: `backend/.env.docker.example`
- Backend hardening and Ubuntu deploy guide: `backend/DEPLOYMENT.md`
- Backend one-time Supabase migration guide: `backend/SUPABASE_MIGRATION.md`
- Frontend local/production env examples: `frontend/.env.example`, `frontend/.env.production.example`
