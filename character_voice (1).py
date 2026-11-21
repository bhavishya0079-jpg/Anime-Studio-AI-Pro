from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.character_voice import generate_character_dialogues

router = APIRouter()


class CharacterDialogue(BaseModel):
    character: str
    text: str
    voice_type: str = "female"


class CharacterVoiceRequest(BaseModel):
    dialogues: list[CharacterDialogue]


@router.post("/generate")
async def create_character_voices(request: CharacterVoiceRequest):
    try:
        dialogues = [
            item.model_dump()
            for item in request.dialogues
        ]

        results = await generate_character_dialogues(dialogues)

        return {
            "success": True,
            "characters": results
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
