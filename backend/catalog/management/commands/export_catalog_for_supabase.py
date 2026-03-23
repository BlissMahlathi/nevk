from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from catalog.models import Category, Product, ProductImage


class Command(BaseCommand):
    help = "Export catalog tables to CSV files for one-time Supabase import."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            default="",
            help="Directory to write export files into. Defaults to backend/exports/supabase-catalog-<timestamp>/",
        )

    def handle(self, *args, **options):
        output_dir = options["output_dir"].strip()
        if output_dir:
            target_dir = Path(output_dir).resolve()
        else:
            timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            target_dir = (Path(settings.BASE_DIR) / "exports" /
                          f"supabase-catalog-{timestamp}").resolve()

        target_dir.mkdir(parents=True, exist_ok=True)

        self._export_categories(target_dir / "categories.csv")
        self._export_products(target_dir / "products.csv")
        self._export_product_images(target_dir / "product_images.csv")
        self._export_storage_manifest(target_dir / "storage_manifest.csv")
        self._write_readme(target_dir / "README.txt")

        self.stdout.write(self.style.SUCCESS(
            f"Catalog export written to {target_dir}"))

    def _export_categories(self, path: Path) -> None:
        rows = (
            Category.objects.all()
            .order_by("id")
            .values(
                "id",
                "name",
                "slug",
                "description",
                "is_active",
                "created_at",
            )
        )

        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(
                handle,
                fieldnames=[
                    "id",
                    "name",
                    "slug",
                    "description",
                    "is_active",
                    "created_at",
                ],
            )
            writer.writeheader()
            for row in rows:
                row["created_at"] = self._ts(row["created_at"])
                writer.writerow(row)

    def _export_products(self, path: Path) -> None:
        rows = (
            Product.objects.select_related("category")
            .all()
            .order_by("id")
            .values(
                "id",
                "category_id",
                "name",
                "slug",
                "description",
                "price",
                "stock",
                "flavor",
                "color",
                "scent",
                "size",
                "is_featured",
                "is_active",
                "created_at",
                "updated_at",
            )
        )

        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(
                handle,
                fieldnames=[
                    "id",
                    "category_id",
                    "name",
                    "slug",
                    "description",
                    "price",
                    "stock",
                    "flavor",
                    "color",
                    "scent",
                    "size",
                    "is_featured",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            )
            writer.writeheader()
            for row in rows:
                row["created_at"] = self._ts(row["created_at"])
                row["updated_at"] = self._ts(row["updated_at"])
                writer.writerow(row)

    def _export_product_images(self, path: Path) -> None:
        rows = (
            ProductImage.objects.all()
            .order_by("id")
            .values(
                "id",
                "product_id",
                "original_image",
                "processed_image",
                "alt_text",
                "is_primary",
                "created_at",
            )
        )

        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(
                handle,
                fieldnames=[
                    "id",
                    "product_id",
                    "original_image",
                    "processed_image",
                    "alt_text",
                    "is_primary",
                    "created_at",
                ],
            )
            writer.writeheader()
            for row in rows:
                row["created_at"] = self._ts(row["created_at"])
                row["original_image"] = str(row["original_image"] or "")
                row["processed_image"] = str(row["processed_image"] or "")
                writer.writerow(row)

    def _export_storage_manifest(self, path: Path) -> None:
        images = ProductImage.objects.all().order_by("id")

        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(
                handle,
                fieldnames=["source_path", "target_path", "image_variant"],
            )
            writer.writeheader()

            for image in images:
                for variant, value in (
                    ("original", str(image.original_image or "")),
                    ("processed", str(image.processed_image or "")),
                ):
                    source_path = value.strip()
                    if not source_path:
                        continue
                    writer.writerow(
                        {
                            "source_path": source_path,
                            "target_path": source_path,
                            "image_variant": variant,
                        }
                    )

    def _write_readme(self, path: Path) -> None:
        path.write_text(
            "\n".join(
                [
                    "Supabase one-time import export",
                    "",
                    "Files:",
                    "- categories.csv",
                    "- products.csv",
                    "- product_images.csv",
                    "- storage_manifest.csv",
                    "",
                    "Import example:",
                    "python backend/scripts/import_catalog_to_supabase.py \\",
                    "  --supabase-url https://<project>.supabase.co \\",
                    "  --service-role-key <service_role_key> \\",
                    "  --input-dir <this_export_directory> \\",
                    "  --bucket products \\",
                    "  --media-root backend/media",
                ]
            ),
            encoding="utf-8",
        )

    @staticmethod
    def _ts(value):
        return value.isoformat() if value else ""
