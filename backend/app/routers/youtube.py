from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.youtube_metadata import generate_youtube_metadata

router = APIRouter()


class YouTubeRequest(BaseModel):
    video_topic: str


@router.post("/metadata")
def create_youtube_metadata(request: YouTubeRequest):
    try:
        result = generate_youtube_metadata(
            request.video_topic
        )

        return {
            "success": True,
            "youtube_metadata": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
