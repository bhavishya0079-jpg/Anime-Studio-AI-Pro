
import unittest
import tempfile
from unittest.mock import patch

from backend.app.services.project_manager import (
    save_project,
    list_projects
)


class ProjectTest(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.patcher = patch(
            "backend.app.services.project_manager.PROJECT_DIR",
            self.temp_dir.name
        )
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()
        self.temp_dir.cleanup()

    def test_save_project(self):
        data = {"title": "My Anime Project"}

        result = save_project(data)

        self.assertTrue(result["project_id"])
        self.assertEqual(result["data"], data)

    def test_list_projects(self):
        save_project({"title": "Anime Episode"})

        projects = list_projects()

        self.assertEqual(len(projects), 1)
        self.assertEqual(
            projects[0]["data"]["title"],
            "Anime Episode"
        )


if __name__ == "__main__":
    unittest.main()
  
