from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.video_editor import render_video

router = APIRouter()


class VideoRequest(BaseModel):
    image_files: list[str]
    audio_file: str
    output_file: str = "outputs/final_video.mp4"


@router.post("/render")
def create_video(request: VideoRequest):
    try:
        result = render_video(
            image_files=request.image_files,
            audio_file=request.audio_file,
            output_file=request.output_file
        )

        return {
            "success": True,
            "video": result
        }

    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(status_code=400, detail=str(error))

    except NotImplementedError as error:
        raise HTTPException(status_code=501, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
