
import os
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from backend.app.services.audio_mixer import mix_audio


router = APIRouter()

OUTPUT_DIR = os.path.abspath("outputs")


class AudioRequest(BaseModel):
    voice_file: str
    music_file: str
    music_volume: float = Field(default=0.15, ge=0.0, le=1.0)


def validate_media_path(path: str):
    absolute_path = os.path.abspath(path)

    if os.path.commonpath(
        [OUTPUT_DIR, absolute_path]
    ) != OUTPUT_DIR:
        raise ValueError("Audio files must be inside outputs.")

    if not os.path.isfile(absolute_path):
        raise FileNotFoundError("Audio file not found.")

    return absolute_path


@router.post("/mix")
def create_audio_mix(request: AudioRequest):
    try:
        voice_file = validate_media_path(request.voice_file)
        music_file = validate_media_path(request.music_file)

        output_dir = os.path.join(OUTPUT_DIR, "audio")
        os.makedirs(output_dir, exist_ok=True)

        output_file = os.path.join(
            output_dir,
            f"{uuid.uuid4().hex}_mix.mp3"
        )

        result = mix_audio(
            voice_file=voice_file,
            music_file=music_file,
            output_file=output_file,
            music_volume=request.music_volume
        )

        return FileResponse(
            result,
            media_type="audio/mpeg",
            filename="final_mix.mp3"
        )

    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Audio mixing failed."
        )
        
