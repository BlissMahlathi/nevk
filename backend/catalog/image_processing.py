from io import BytesIO
import logging
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from django.core.files.base import ContentFile
from PIL import Image, ImageOps


PROCESSED_IMAGE_MAX_SIZE = (1600, 1600)
BACKGROUND_REMOVAL_SERVICE_URL = os.getenv("BG_REMOVAL_SERVICE_URL", "").strip()
BACKGROUND_REMOVAL_SERVICE_TOKEN = os.getenv("BG_REMOVAL_SERVICE_TOKEN", "").strip()
BACKGROUND_REMOVAL_TIMEOUT = float(os.getenv("BG_REMOVAL_TIMEOUT", "25"))

logger = logging.getLogger(__name__)


def _build_multipart_body(filename, file_bytes):
    boundary = f"----nevk{uuid4().hex}"
    payload = [
        f"--{boundary}\r\n".encode("utf-8"),
        (
            "Content-Disposition: form-data; "
            f'name="image"; filename="{filename}"\r\n'
        ).encode("utf-8"),
        b"Content-Type: application/octet-stream\r\n\r\n",
        file_bytes,
        b"\r\n",
        f"--{boundary}--\r\n".encode("utf-8"),
    ]
    return b"".join(payload), f"multipart/form-data; boundary={boundary}"


def _request_background_removed_image(filename, file_bytes):
    if not BACKGROUND_REMOVAL_SERVICE_URL:
        return None

    request_body, content_type = _build_multipart_body(filename, file_bytes)
    headers = {
        "Content-Type": content_type,
        "Accept": "image/*",
    }
    if BACKGROUND_REMOVAL_SERVICE_TOKEN:
        headers["Authorization"] = f"Bearer {BACKGROUND_REMOVAL_SERVICE_TOKEN}"

    request = Request(
        BACKGROUND_REMOVAL_SERVICE_URL,
        data=request_body,
        headers=headers,
        method="POST",
    )

    try:
        with urlopen(request, timeout=BACKGROUND_REMOVAL_TIMEOUT) as response:
            return response.read()
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        logger.warning("Background removal service failed; falling back: %s", exc)
        return None


def build_processed_product_image(source_image):
    """Create a storefront-ready image, using external background removal when configured."""
    source_image.open("rb")
    try:
        source_bytes = source_image.read()
    finally:
        source_image.close()

    processed_bytes = _request_background_removed_image(source_image.name, source_bytes)
    input_bytes = processed_bytes or source_bytes

    try:
        with Image.open(BytesIO(input_bytes)) as uploaded_image:
            normalized_image = ImageOps.exif_transpose(uploaded_image)
            normalized_image.thumbnail(PROCESSED_IMAGE_MAX_SIZE)

            image_mode = normalized_image.mode
            if image_mode not in ("RGB", "RGBA"):
                image_mode = "RGBA" if "A" in normalized_image.getbands() else "RGB"
            output_image = normalized_image.convert(image_mode)

            buffer = BytesIO()
            save_kwargs = {"format": "WEBP", "quality": 88, "method": 6}
            if image_mode == "RGBA":
                save_kwargs["lossless"] = True
            output_image.save(buffer, **save_kwargs)
    except OSError:
        with Image.open(BytesIO(source_bytes)) as uploaded_image:
            normalized_image = ImageOps.exif_transpose(uploaded_image)
            normalized_image.thumbnail(PROCESSED_IMAGE_MAX_SIZE)
            buffer = BytesIO()
            normalized_image.convert("RGB").save(
                buffer,
                format="WEBP",
                quality=88,
                method=6,
            )

    processed_name = f"{Path(source_image.name).stem}-processed.webp"
    return processed_name, ContentFile(buffer.getvalue())
