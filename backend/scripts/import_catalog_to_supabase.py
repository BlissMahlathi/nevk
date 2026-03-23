#!/usr/bin/env python3
"""One-time import of exported Django catalog CSV files into Supabase."""

from __future__ import annotations

import argparse
import csv
import json
import mimetypes
import pathlib
import sys
from typing import Any
from urllib import error, parse, request


def _to_bool(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "t", "yes", "y", "on"}


def _nullable_int(value: str) -> int | None:
    text = str(value).strip()
    if not text:
        return None
    return int(text)


def _http_json(
    method: str,
    url: str,
    *,
    api_key: str,
    payload: Any | None = None,
    extra_headers: dict[str, str] | None = None,
) -> Any:
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
    }
    if extra_headers:
        headers.update(extra_headers)

    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = request.Request(url, data=data, headers=headers, method=method)
    try:
        with request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8").strip()
            if not body:
                return None
            return json.loads(body)
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} for {url}: {body}") from exc


def _upload_file(
    supabase_url: str,
    api_key: str,
    bucket: str,
    object_path: str,
    local_path: pathlib.Path,
) -> None:
    content_type = mimetypes.guess_type(str(local_path))[
        0] or "application/octet-stream"
    target = parse.quote(object_path.lstrip("/"), safe="/")
    url = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{target}"

    with local_path.open("rb") as file_handle:
        data = file_handle.read()

    req = request.Request(
        url,
        data=data,
        headers={
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": content_type,
            "x-upsert": "true",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=120):
            return
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Storage upload failed for {object_path}: {exc.code} {body}") from exc


def _read_csv(path: pathlib.Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def _upsert_table(
    supabase_url: str,
    api_key: str,
    table: str,
    rows: list[dict[str, Any]],
    on_conflict: str,
) -> None:
    if not rows:
        return

    query = parse.urlencode({"on_conflict": on_conflict})
    url = f"{supabase_url.rstrip('/')}/rest/v1/{table}?{query}"
    _http_json(
        "POST",
        url,
        api_key=api_key,
        payload=rows,
        extra_headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--supabase-url", required=True)
    parser.add_argument("--service-role-key", required=True)
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--bucket", default="products")
    parser.add_argument(
        "--media-root",
        default="",
        help="Optional path to Django media root; if provided, files in storage_manifest.csv are uploaded.",
    )
    args = parser.parse_args()

    input_dir = pathlib.Path(args.input_dir).resolve()
    categories_csv = input_dir / "categories.csv"
    products_csv = input_dir / "products.csv"
    product_images_csv = input_dir / "product_images.csv"
    storage_manifest_csv = input_dir / "storage_manifest.csv"

    for required in (categories_csv, products_csv, product_images_csv):
        if not required.exists():
            raise FileNotFoundError(
                f"Missing required export file: {required}")

    categories_rows = _read_csv(categories_csv)
    products_rows = _read_csv(products_csv)
    product_images_rows = _read_csv(product_images_csv)

    categories_payload = [
        {
            "id": int(row["id"]),
            "name": row["name"],
            "slug": row["slug"],
            "description": row["description"] or None,
            "is_active": _to_bool(row["is_active"]),
            "created_at": row["created_at"] or None,
        }
        for row in categories_rows
    ]

    products_payload = [
        {
            "id": int(row["id"]),
            "category_id": _nullable_int(row["category_id"]),
            "name": row["name"],
            "slug": row["slug"],
            "description": row["description"] or None,
            "price": row["price"],
            "stock": int(row["stock"]),
            "flavor": row["flavor"] or None,
            "color": row["color"] or None,
            "scent": row["scent"] or None,
            "size": row["size"] or None,
            "is_featured": _to_bool(row["is_featured"]),
            "is_active": _to_bool(row["is_active"]),
            "created_at": row["created_at"] or None,
            "updated_at": row["updated_at"] or None,
        }
        for row in products_rows
    ]

    product_images_payload = [
        {
            "id": int(row["id"]),
            "product_id": int(row["product_id"]),
            "original_image": row["original_image"] or None,
            "processed_image": row["processed_image"] or None,
            "alt_text": row["alt_text"] or None,
            "is_primary": _to_bool(row["is_primary"]),
            "created_at": row["created_at"] or None,
        }
        for row in product_images_rows
    ]

    print(f"Importing {len(categories_payload)} categories...")
    _upsert_table(args.supabase_url, args.service_role_key,
                  "categories", categories_payload, "id")

    print(f"Importing {len(products_payload)} products...")
    _upsert_table(args.supabase_url, args.service_role_key,
                  "products", products_payload, "id")

    print(f"Importing {len(product_images_payload)} product_images...")
    _upsert_table(
        args.supabase_url,
        args.service_role_key,
        "product_images",
        product_images_payload,
        "id",
    )

    media_root = pathlib.Path(
        args.media_root).resolve() if args.media_root else None
    if media_root and storage_manifest_csv.exists():
        storage_rows = _read_csv(storage_manifest_csv)
        print(
            f"Uploading {len(storage_rows)} media files to bucket '{args.bucket}'...")
        uploaded = 0
        skipped = 0

        for row in storage_rows:
            source_path = (row.get("source_path") or "").strip()
            target_path = (row.get("target_path") or "").strip()
            if not source_path or not target_path:
                skipped += 1
                continue

            local_path = media_root / source_path
            if not local_path.exists() or not local_path.is_file():
                skipped += 1
                continue

            _upload_file(
                args.supabase_url,
                args.service_role_key,
                args.bucket,
                target_path,
                local_path,
            )
            uploaded += 1

        print(
            f"Storage upload complete: uploaded={uploaded}, skipped={skipped}")
    elif media_root:
        print("storage_manifest.csv not found; skipping media uploads.")

    print("Supabase import completed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"Import failed: {exc}", file=sys.stderr)
        raise
