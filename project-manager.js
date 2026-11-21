
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// PROJECT MANAGER
// =====================================

// Save a project
export async function saveProject({
  projectData,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (
    !projectData ||
    typeof projectData !== "object" ||
    Array.isArray(projectData)
  ) {
    const error = new Error("Valid project data is required.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.saveProject({
      project_data: projectData
    });

    if (!result || !result.success || !result.project) {
      throw new Error("Project could not be saved.");
    }

    onSuccess(result.project);
    return result.project;

  } catch (error) {
    onError(error.message || "Project saving failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Load saved project history
export async function loadProjectHistory({
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
} = {}) {
  try {
    onLoading(true);

    const result = await API.getProjectHistory();

    if (!result || !result.success || !Array.isArray(result.projects)) {
      throw new Error("Could not load project history.");
    }

    onSuccess(result.projects);
    return result.projects;

  } catch (error) {
    onError(error.message || "Project history loading failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Find a project by ID
export function findProjectById(projects, projectId) {
  if (!Array.isArray(projects) || !projectId) {
    return null;
  }

  return projects.find(
    project => project.project_id === projectId
  ) || null;
}

// Create a basic project data object
export function createProjectData({
  title = "Untitled Anime Project",
  description = "",
  mode = "original",
  content = {}
} = {}) {
  return {
    title,
    description,
    mode,
    content,
    updated_at: new Date().toISOString()
  };
}
