
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.services.subtitle_sync import sync_subtitles

router = APIRouter()


class DialogueItem(BaseModel):
    character: str = ""
    text: str


class SubtitleSyncRequest(BaseModel):
    dialogues: list[DialogueItem]
    duration: float = Field(gt=0)


@router.post("/sync")
def create_synced_subtitles(request: SubtitleSyncRequest):
    try:
        dialogues = [
            item.model_dump()
            for item in request.dialogues
        ]

        result = sync_subtitles(
            dialogues=dialogues,
            duration=request.duration
        )

        return {
            "success": True,
            "subtitles": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Subtitle synchronization failed."
        )
      
