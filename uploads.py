import os
import uuid
import aiofiles

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

UPLOAD_DIR = "outputs/uploads"
MAX_SIZE = 2 * 1024 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov"
}


@router.post("/")
async def upload_media(file: UploadFile = File(...)):
    extension = ALLOWED_TYPES.get(file.content_type)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    total_size = 0

    try:
        async with aiofiles.open(filepath, "wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="Maximum upload size is 2 GB."
                    )

                await output.write(chunk)

    except Exception:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise

    finally:
        await file.close()

    return {
        "success": True,
        "filename": filename,
        "file_path": filepath,
        "size_bytes": total_size
    }
