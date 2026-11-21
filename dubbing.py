from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.dubbing_generator import generate_hindi_dubbing

router = APIRouter()


class DubbingRequest(BaseModel):
    anime_title: str
    dialogue_text: str


@router.post("/generate")
def create_dubbing(request: DubbingRequest):
    try:
        result = generate_hindi_dubbing(
            anime_title=request.anime_title,
            dialogue_text=request.dialogue_text
        )

        return {
            "success": True,
            "hindi_dubbing_script": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
