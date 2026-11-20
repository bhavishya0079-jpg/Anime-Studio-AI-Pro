
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.services.image_generator import generate_scene_image

router = APIRouter()


class VisualRequest(BaseModel):
    scene_description: str = Field(min_length=1, max_length=5000)
    character_details: str = Field(default="", max_length=3000)
    aspect_ratio: str = "9:16"


@router.post("/generate")
def create_visual(request: VisualRequest):
    try:
        result = generate_scene_image(
            scene_description=request.scene_description,
            character_details=request.character_details,
            aspect_ratio=request.aspect_ratio
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image generation failed. Check API access and quota."
        )
        
