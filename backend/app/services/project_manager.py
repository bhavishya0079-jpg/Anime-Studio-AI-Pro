import json
import os
import uuid
from datetime import datetime, timezone


PROJECT_DIR = "outputs/projects"


def save_project(project_data: dict):
    os.makedirs(PROJECT_DIR, exist_ok=True)

    project_id = uuid.uuid4().hex

    project = {
        "project_id": project_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "data": project_data
    }

    filepath = os.path.join(
        PROJECT_DIR,
        f"{project_id}.json"
    )

    with open(filepath, "w", encoding="utf-8") as file:
        json.dump(project, file, ensure_ascii=False, indent=2)

    return project


def list_projects():
    os.makedirs(PROJECT_DIR, exist_ok=True)

    projects = []

    for filename in os.listdir(PROJECT_DIR):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(PROJECT_DIR, filename)

        with open(filepath, "r", encoding="utf-8") as file:
            projects.append(json.load(file))

    return sorted(
        projects,
        key=lambda item: item["created_at"],
        reverse=True
    )
