
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// YOUTUBE STUDIO
// =====================================

export async function generateYouTubeMetadata({
  videoTopic,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  const topic = videoTopic.trim();

  if (!topic) {
    const error = new Error("Please enter your video topic.");
    onError(error.message);
    throw error;
  }

  if (topic.length > 2000) {
    const error = new Error("Video topic is too long.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.generateYoutubeMetadata({
      video_topic: topic
    });

    if (
      !result ||
      !result.success ||
      !result.youtube_metadata
    ) {
      throw new Error("YouTube metadata generation failed.");
    }

    onSuccess(result.youtube_metadata);
    return result.youtube_metadata;

  } catch (error) {
    onError(error.message || "YouTube metadata generation failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Copy metadata to clipboard
export async function copyYouTubeMetadata(metadata) {
  if (!metadata || !metadata.trim()) {
    throw new Error("No YouTube metadata available.");
  }

  await navigator.clipboard.writeText(metadata);
  return true;
}

// Download metadata as text
export function downloadYouTubeMetadata(
  metadata,
  filename = "youtube-metadata.txt"
) {
  if (!metadata || !metadata.trim()) {
    throw new Error("No metadata available to download.");
  }

  const blob = new Blob(
    [metadata],
    { type: "text/plain;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
