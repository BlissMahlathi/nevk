# Nevk Frontend

React + Vite storefront for Nevk Cosmetics.

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
```

The dev server runs on `http://localhost:8080` and reads catalog data directly from Supabase.

## Production Routing Note

This app uses client-side routing (`BrowserRouter`), so direct reloads on routes like `/shop`
must be rewritten to `/index.html` by the hosting platform.

- Netlify/Cloudflare Pages: uses `public/_redirects`.
- Vercel: uses `vercel.json` (`routes` with `handle: filesystem` and fallback to `/index.html`).

## Environment Variables

- `VITE_SUPABASE_URL`
  Your Supabase project URL (for example `https://xyzcompany.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`
  Supabase public anon key used by the storefront client.
- `VITE_SUPABASE_PRODUCTS_BUCKET`
  Optional storage bucket name used for product images. Defaults to `products`.
- `VITE_WHATSAPP_ORDER_NUMBER`
  Optional WhatsApp number used for checkout links. If omitted, the app uses `27715231720`.
- `VITE_USE_FALLBACK_CATALOG`
  Keep this `false` in real production.

For full project notes (including legacy Django backend), see the root `README.md`.
