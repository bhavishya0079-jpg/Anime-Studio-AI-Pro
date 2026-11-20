from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.image_generator import generate_scene_prompt

router = APIRouter()


class VisualRequest(BaseModel):
    scene_description: str
    character_details: str = ""


@router.post("/generate")
def create_visual_prompt(request: VisualRequest):
    try:
        result = generate_scene_prompt(
            scene_description=request.scene_description,
            character_details=request.character_details
        )

        return {
            "success": True,
            "visual_prompt": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
