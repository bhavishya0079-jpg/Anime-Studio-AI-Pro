from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.services.voice_generator import generate_voice

router = APIRouter()


class VoiceRequest(BaseModel):
    text: str
    voice_type: str = "female"


@router.post("/generate")
async def create_voice(request: VoiceRequest):
    try:
        audio_path = await generate_voice(
            request.text,
            request.voice_type
        )

        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename="anime_voice.mp3"
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
