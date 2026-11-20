from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.services.subtitle_generator import generate_srt

router = APIRouter()


class SubtitleLine(BaseModel):
    start: float
    end: float
    text: str


class SubtitleRequest(BaseModel):
    lines: list[SubtitleLine]


@router.post("/generate")
def create_subtitles(request: SubtitleRequest):
    try:
        subtitle_data = [
            line.model_dump()
            for line in request.lines
        ]

        filepath = generate_srt(subtitle_data)

        return FileResponse(
            filepath,
            media_type="application/x-subrip",
            filename="hindi_subtitles.srt"
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
