from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.app.services.project_manager import (
    save_project,
    list_projects
)

router = APIRouter()


class ProjectRequest(BaseModel):
    project_data: dict


@router.post("/save")
def create_project(request: ProjectRequest):
    try:
        project = save_project(request.project_data)

        return {
            "success": True,
            "project": project
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.get("/history")
def get_project_history():
    try:
        return {
            "success": True,
            "projects": list_projects()
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
