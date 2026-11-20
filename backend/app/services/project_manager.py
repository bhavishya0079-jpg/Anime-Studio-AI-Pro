
import json
import os
import uuid
import tempfile

from datetime import datetime, timezone


PROJECT_DIR = "outputs/projects"


def save_project(project_data: dict):
    if not isinstance(project_data, dict):
        raise ValueError("Project data must be an object.")

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

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=PROJECT_DIR,
            suffix=".tmp",
            delete=False
        ) as file:
            json.dump(
                project,
                file,
                ensure_ascii=False,
                indent=2
            )
            temp_path = file.name

        os.replace(temp_path, filepath)

    except (TypeError, ValueError) as error:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        raise ValueError(
            "Project data could not be saved as JSON."
        ) from error

    except Exception:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        raise

    return project


def list_projects():
    os.makedirs(PROJECT_DIR, exist_ok=True)

    projects = []

    for filename in os.listdir(PROJECT_DIR):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(PROJECT_DIR, filename)

        try:
            with open(filepath, "r", encoding="utf-8") as file:
                project = json.load(file)

            if not isinstance(project, dict):
                continue

            if not project.get("project_id"):
                continue

            if "created_at" not in project:
                continue

            projects.append(project)

        except (OSError, json.JSONDecodeError):
            continue

    return sorted(
        projects,
        key=lambda item: item.get("created_at", ""),
        reverse=True
    )
    
