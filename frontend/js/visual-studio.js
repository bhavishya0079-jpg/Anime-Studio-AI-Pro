
import { API, API_BASE_URL } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// AI VISUAL STUDIO
// =====================================

const ALLOWED_RATIOS = ["9:16", "16:9", "1:1"];

export async function generateAnimeVisual({
  sceneDescription,
  characterDetails = "",
  aspectRatio = "9:16",
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  const scene = sceneDescription.trim();
  const characters = characterDetails.trim();

  if (!scene) {
    const error = new Error("Please describe the anime scene.");
    onError(error.message);
    throw error;
  }

  if (scene.length > 5000) {
    const error = new Error("Scene description is too long.");
    onError(error.message);
    throw error;
  }

  if (characters.length > 3000) {
    const error = new Error("Character details are too long.");
    onError(error.message);
    throw error;
  }

  if (!ALLOWED_RATIOS.includes(aspectRatio)) {
    const error = new Error("Please select a valid aspect ratio.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.generateVisuals({
      scene_description: scene,
      character_details: characters,
      aspect_ratio: aspectRatio
    });

    if (!result || !result.success || !result.image_file) {
      throw new Error("AI visual generation returned no image.");
    }

    const imagePath = result.image_file.replace(/\\/g, "/");

    if (!imagePath.startsWith("outputs/")) {
      throw new Error("Invalid image path.");
    }

    result.image_url =
      `${API_BASE_URL}/media/${imagePath
        .slice("outputs/".length)
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;

    const preview = document.createElement("img");
    preview.src = result.image_url;
    preview.alt = "Generated Anime Scene";
    preview.className = "preview-image";
    preview.style.width = "100%";
    preview.style.height = "auto";
    preview.style.borderRadius = "12px";

    const output = document.getElementById("visualOutput");

    if (output) {
      output.textContent = "";
      output.appendChild(preview);
    }

    onSuccess(result);
    return result;

  } catch (error) {
    onError(error.message || "Anime visual generation failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Get available aspect ratios
export function getVisualAspectRatios() {
  return [...ALLOWED_RATIOS];
}

// Create a descriptive filename
export function createVisualFilename(
  sceneName = "anime-scene",
  extension = "png"
) {
  const safeName = sceneName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return `${safeName || "anime-scene"}.${extension}`;
}
