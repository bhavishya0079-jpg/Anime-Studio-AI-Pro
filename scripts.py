from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.script_generator import generate_script

router = APIRouter()


class ScriptRequest(BaseModel):
    topic: str
    mode: str = "original"
    episode: str = ""


@router.post("/generate")
def create_script(request: ScriptRequest):
    try:
        result = generate_script(
            topic=request.topic,
            mode=request.mode,
            episode=request.episode
        )

        return {
            "success": True,
            "script": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
