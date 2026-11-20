
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// HINDI SUBTITLE STUDIO
// =====================================

// Synchronize dialogue with video duration
export async function synchronizeSubtitles({
  dialogues,
  duration,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (!Array.isArray(dialogues) || dialogues.length === 0) {
    const error = new Error("Please add dialogue lines.");
    onError(error.message);
    throw error;
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    const error = new Error("Please enter a valid video duration.");
    onError(error.message);
    throw error;
  }

  const cleanDialogues = dialogues
    .filter(item => item.text && item.text.trim())
    .map(item => ({
      character: (item.character || "").trim(),
      text: item.text.trim()
    }));

  if (cleanDialogues.length === 0) {
    const error = new Error("No valid dialogue found.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.syncSubtitles({
      dialogues: cleanDialogues,
      duration
    });

    if (!result || !result.success || !Array.isArray(result.subtitles)) {
      throw new Error("Subtitle synchronization failed.");
    }

    onSuccess(result.subtitles);
    return result.subtitles;

  } catch (error) {
    onError(error.message || "Subtitle synchronization failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Generate downloadable SRT subtitle file
export async function generateSubtitleFile({
  lines,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (!Array.isArray(lines) || lines.length === 0) {
    const error = new Error("No subtitle lines available.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const blob = await API.generateSubtitles({ lines });

    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error("Subtitle file is empty.");
    }

    const result = {
      blob,
      filename: "hindi-subtitles.srt"
    };

    onSuccess(result);
    return result;

  } catch (error) {
    onError(error.message || "Subtitle file generation failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Download SRT file
export function downloadSubtitleFile(
  blob,
  filename = "hindi-subtitles.srt"
) {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("No subtitle file available.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// Format seconds as subtitle timestamp
export function formatSubtitleTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;

  const wholeSeconds = Math.floor(remaining);
  const milliseconds = Math.round(
    (remaining - wholeSeconds) * 1000
  );

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    `${String(wholeSeconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`
  ].join(":");
}
