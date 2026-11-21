
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// HINDI SCRIPT STUDIO
// =====================================

export async function generateAnimeScript({
  topic,
  mode = "original",
  episode = "",
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  const cleanTopic = topic.trim();

  if (!cleanTopic) {
    const error = new Error("Please enter an anime topic.");
    onError(error.message);
    throw error;
  }

  if (mode === "explanation" && !episode.trim()) {
    const error = new Error("Please enter the episode number.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.generateScript({
      topic: cleanTopic,
      mode,
      episode: episode.trim()
    });

    if (!result || !result.script) {
      throw new Error("Script generation returned an empty result.");
    }

    onSuccess(result.script);

    return result.script;

  } catch (error) {
    onError(error.message || "Script generation failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Copy generated script
export async function copyScript(script) {
  if (!script) {
    throw new Error("There is no script to copy.");
  }

  await navigator.clipboard.writeText(script);
  return true;
}

// Download generated script as TXT
export function downloadScript(script, filename = "anime-script.txt") {
  if (!script) {
    throw new Error("There is no script to download.");
  }

  const blob = new Blob(
    [script],
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
