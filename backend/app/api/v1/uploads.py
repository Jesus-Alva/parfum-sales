import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import get_current_user
from app.config import settings
from app.models.user import User

router = APIRouter()

ALLOWED_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
}


async def _save_single(file: UploadFile) -> dict:
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(400, f"Tipo no permitido: {file.content_type}")

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(400, f"Archivo mayor a {settings.MAX_UPLOAD_SIZE_MB}MB")

    ext = ALLOWED_EXT.get(file.content_type, ".jpg")
    filename = f"{uuid.uuid4().hex}{ext}"
    folder = Path(settings.UPLOAD_DIR) / "perfumes"
    folder.mkdir(parents=True, exist_ok=True)
    filepath = folder / filename
    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "url": f"/uploads/perfumes/{filename}",
        "filename": filename,
        "size": len(contents),
    }


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_user),
):
    """Sube UNA imagen (compatibilidad)."""
    return await _save_single(file)


@router.post("/images")
async def upload_images(
    files: List[UploadFile] = File(...),
    _: User = Depends(get_current_user),
):
    """Sube VARIAS imágenes a la vez."""
    results = []
    for f in files:
        results.append(await _save_single(f))
    return {"files": results}