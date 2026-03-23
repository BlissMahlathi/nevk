# Supabase Catalog Migration (One-Time)

This project is now Supabase-first for catalog reads.
Django catalog endpoints are archived and return `410 Gone`.

## 1. Apply Supabase SQL schema and RLS

Run:

- [supabase/migrations/20260323_catalog_schema_and_rls.sql](../supabase/migrations/20260323_catalog_schema_and_rls.sql)

in Supabase SQL editor.

## 2. Export data from Django (works with SQLite or Postgres)

From repository root:

```bash
cd backend
./djangoenv/bin/python manage.py export_catalog_for_supabase
```

This creates:

- `backend/exports/supabase-catalog-<timestamp>/categories.csv`
- `backend/exports/supabase-catalog-<timestamp>/products.csv`
- `backend/exports/supabase-catalog-<timestamp>/product_images.csv`
- `backend/exports/supabase-catalog-<timestamp>/storage_manifest.csv`

## 3. Import data into Supabase

Use a Supabase **service role key** for one-time import.

```bash
python backend/scripts/import_catalog_to_supabase.py \
  --supabase-url https://<project>.supabase.co \
  --service-role-key <service_role_key> \
  --input-dir backend/exports/supabase-catalog-<timestamp> \
  --bucket products \
  --media-root backend/media
```

Notes:

- `--media-root` is optional. When included, files from `storage_manifest.csv` are uploaded to Supabase Storage.
- Import uses upsert by `id` and is intended for a fresh Supabase catalog schema.

## 4. Frontend environment

In frontend env, set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PRODUCTS_BUCKET`
- `VITE_WHATSAPP_ORDER_NUMBER`
