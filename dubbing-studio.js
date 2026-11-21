
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// HINDI DUBBING STUDIO
// =====================================

// Generate Hindi dubbing script
export async function generateHindiDubbingScript({
  animeTitle,
  dialogueText,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  const cleanTitle = animeTitle.trim();
  const cleanDialogue = dialogueText.trim();

  if (!cleanTitle) {
    const error = new Error("Please enter the anime title.");
    onError(error.message);
    throw error;
  }

  if (!cleanDialogue) {
    const error = new Error("Please enter the original dialogue.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.generateDubbing({
      anime_title: cleanTitle,
      dialogue_text: cleanDialogue
    });

    if (!result || !result.hindi_dubbing_script) {
      throw new Error("Hindi dubbing script was not generated.");
    }

    onSuccess(result.hindi_dubbing_script);

    return result.hindi_dubbing_script;

  } catch (error) {
    onError(error.message || "Hindi dubbing failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Select original audio or Hindi dubbing mode
export function selectDubbingMode(mode) {
  const allowedModes = ["original_audio", "hindi_dub"];

  if (!allowedModes.includes(mode)) {
    throw new Error("Invalid audio mode selected.");
  }

  return {
    mode,
    preserveOriginalAudio: mode === "original_audio",
    generateHindiDub: mode === "hindi_dub"
  };
}

// Split speaker-labelled script into dialogue lines
export function splitDubbingDialogues(script) {
  if (!script || !script.trim()) {
    return [];
  }

  return script
    .split("\n")
    .map(line => line.replace(/\*\*/g, "").replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean)
    .map(line => {
      const separator = line.indexOf(":");

      if (separator === -1) {
        return {
          character: "Unknown",
          text: line
        };
      }

      return {
        character: line.slice(0, separator).trim(),
        text: line.slice(separator + 1).trim()
      };
    })
    .filter(item => item.text);
}

// Download Hindi dubbing script
export function downloadDubbingScript(
  script,
  filename = "hindi-dubbing-script.txt"
) {
  if (!script || !script.trim()) {
    throw new Error("No dubbing script available.");
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
