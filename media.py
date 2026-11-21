
import mimetypes
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

OUTPUT_DIR = os.path.realpath("outputs")


@router.get("/{media_path:path}")
def serve_media(media_path: str):
    if not media_path or "\x00" in media_path:
        raise HTTPException(
            status_code=400,
            detail="Invalid media path."
        )

    requested_path = os.path.realpath(
        os.path.join(OUTPUT_DIR, media_path)
    )

    try:
        inside_output_dir = (
            os.path.commonpath(
                [OUTPUT_DIR, requested_path]
            ) == OUTPUT_DIR
        )
    except ValueError:
        inside_output_dir = False

    if not inside_output_dir:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    if not os.path.isfile(requested_path):
        raise HTTPException(
            status_code=404,
            detail="Media file not found."
        )

    media_type, _ = mimetypes.guess_type(requested_path)

    return FileResponse(
        path=requested_path,
        media_type=media_type or "application/octet-stream",
        filename=os.path.basename(requested_path),
        content_disposition_type="inline"
    )
  
