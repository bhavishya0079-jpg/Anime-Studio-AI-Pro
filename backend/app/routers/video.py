from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.services.video_editor import render_video

router = APIRouter()


class VideoRequest(BaseModel):
    image_files: list[str] = Field(min_length=1, max_length=100)
    audio_file: str
    output_file: str = "outputs/final_video.mp4"

    aspect_ratio: Literal["9:16", "16:9"] = "9:16"
    fps: Literal[24, 30, 60] = 30
    scene_duration: float = Field(default=5, gt=0, le=60)


@router.post("/render")
def create_video(request: VideoRequest):
    try:
        result = render_video(
            image_files=request.image_files,
            audio_file=request.audio_file,
            output_file=request.output_file,
            aspect_ratio=request.aspect_ratio,
            fps=request.fps,
            scene_duration=request.scene_duration
        )

        return {
            "success": True,
            "video": result
        }

    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except NotImplementedError as error:
        raise HTTPException(
            status_code=501,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Video rendering failed."
        )
