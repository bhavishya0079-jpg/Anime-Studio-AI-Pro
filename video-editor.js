
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// AUTOMATIC VIDEO EDITOR
// =====================================

const VIDEO_RATIOS = ["9:16", "16:9"];
const VIDEO_FPS = [24, 30, 60];

export async function renderAnimeVideo({
  imageFiles,
  audioFile,
  outputFile = "outputs/final_video.mp4",
  aspectRatio = "9:16",
  fps = 30,
  sceneDuration = 5,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    const error = new Error("Please add at least one scene image.");
    onError(error.message);
    throw error;
  }

  if (imageFiles.length > 100) {
    const error = new Error("Maximum 100 scene images are allowed.");
    onError(error.message);
    throw error;
  }

  if (!audioFile || !audioFile.trim()) {
    const error = new Error("Please select an audio file.");
    onError(error.message);
    throw error;
  }

  if (!VIDEO_RATIOS.includes(aspectRatio)) {
    const error = new Error("Invalid video aspect ratio.");
    onError(error.message);
    throw error;
  }

  if (!VIDEO_FPS.includes(fps)) {
    const error = new Error("Invalid video FPS setting.");
    onError(error.message);
    throw error;
  }

  if (
    !Number.isFinite(sceneDuration) ||
    sceneDuration <= 0 ||
    sceneDuration > 60
  ) {
    const error = new Error("Scene duration must be between 1 and 60 seconds.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.renderVideo({
      image_files: imageFiles,
      audio_file: audioFile.trim(),
      output_file: outputFile,
      aspect_ratio: aspectRatio,
      fps,
      scene_duration: sceneDuration
    });

    if (!result || !result.success || !result.video) {
      throw new Error("Video rendering did not return a video file.");
    }

    onSuccess(result);
    return result;

  } catch (error) {
    onError(error.message || "Video rendering failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Available video settings
export function getVideoEditorSettings() {
  return {
    aspectRatios: [...VIDEO_RATIOS],
    frameRates: [...VIDEO_FPS],
    defaultAspectRatio: "9:16",
    defaultFps: 30,
    defaultSceneDuration: 5
  };
}

// Calculate approximate video duration
export function calculateVideoDuration(
  imageCount,
  sceneDuration = 5
) {
  if (
    !Number.isInteger(imageCount) ||
    imageCount < 1 ||
    !Number.isFinite(sceneDuration) ||
    sceneDuration <= 0
  ) {
    return 0;
  }

  return imageCount * sceneDuration;
}
