from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.services.audio_mixer import mix_audio

router = APIRouter()


class AudioRequest(BaseModel):
    voice_file: str
    music_file: str
    music_volume: float = 0.15


@router.post("/mix")
def create_audio_mix(request: AudioRequest):
    try:
        output_file = "outputs/audio/final_mix.mp3"

        result = mix_audio(
            voice_file=request.voice_file,
            music_file=request.music_file,
            output_file=output_file,
            music_volume=request.music_volume
        )

        return FileResponse(
            result,
            media_type="audio/mpeg",
            filename="final_mix.mp3"
        )

    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
