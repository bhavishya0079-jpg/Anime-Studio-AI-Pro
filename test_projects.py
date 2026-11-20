
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from backend.app.main import app


class ProjectsTest(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    @patch("backend.app.routers.projects.save_project")
    def test_save_project(self, mock_save):
        mock_save.return_value = {
            "project_id": "test123",
            "data": {"title": "Test Anime"}
        }

        response = self.client.post(
            "/api/projects/save",
            json={"project_data": {"title": "Test Anime"}}
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])

    @patch("backend.app.routers.projects.list_projects")
    def test_project_history(self, mock_list):
        mock_list.return_value = []

        response = self.client.get("/api/projects/history")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertEqual(response.json()["projects"], [])


if __name__ == "__main__":
    unittest.main()
  
