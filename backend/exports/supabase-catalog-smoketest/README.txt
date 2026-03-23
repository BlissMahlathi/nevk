Supabase one-time import export

Files:
- categories.csv
- products.csv
- product_images.csv
- storage_manifest.csv

Import example:
python backend/scripts/import_catalog_to_supabase.py \
  --supabase-url https://<project>.supabase.co \
  --service-role-key <service_role_key> \
  --input-dir <this_export_directory> \
  --bucket products \
  --media-root backend/media