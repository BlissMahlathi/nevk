# Nevk Frontend

React + Vite storefront for Nevk Cosmetics.

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
```

The dev server runs on `http://localhost:8080` and expects the Django API at `http://127.0.0.1:8000/api` unless `VITE_API_BASE_URL` is overridden.

## Environment Variables

- `VITE_API_BASE_URL`
  Use this when the frontend and backend are hosted on different origins.
- `VITE_USE_FALLBACK_CATALOG`
  Keep this `false` in real production.

For full frontend/backend hosting notes, see the root `README.md`.
