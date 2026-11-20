
import { API, checkBackendConnection } from "./api.js";

import * as ScriptStudio from "./script-studio.js";
import * as VoiceStudio from "./voice-studio.js";
import * as DubbingStudio from "./dubbing-studio.js";
import * as VisualStudio from "./visual-studio.js";
import * as VideoEditor from "./video-editor.js";
import * as MusicStudio from "./music-studio.js";
import * as SubtitleStudio from "./subtitle-studio.js";
import * as YouTubeStudio from "./youtube-studio.js";
import * as ProjectManager from "./project-manager.js";
import * as CharacterVoiceStudio from "./character-voice-studio.js";
import * as UploadStudio from "./upload-studio.js";

// =====================================
// ANIME STUDIO AI PRO
// MAIN APP CONTROLLER
// =====================================

// Central access to all studio modules
export const Studios = {
  script: ScriptStudio,
  voice: VoiceStudio,
  dubbing: DubbingStudio,
  visuals: VisualStudio,
  video: VideoEditor,
  music: MusicStudio,
  subtitles: SubtitleStudio,
  youtube: YouTubeStudio,
  projects: ProjectManager,
  characterVoice: CharacterVoiceStudio,
  uploads: UploadStudio
};

// Show app notifications
export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = String(message);

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Update button loading state
export function setButtonLoading(button, loading, loadingText = "Please wait...") {
  if (!button) return;

  if (loading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }

    button.disabled = true;
    button.textContent = loadingText;
    button.setAttribute("aria-busy", "true");

  } else {
    button.disabled = false;

    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }

    button.removeAttribute("aria-busy");
  }
}

// Convert errors into readable messages
export function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

// Download a generated Blob
export function downloadBlob(blob, filename = "anime-studio-export") {
  if (!(blob instanceof Blob)) {
    throw new Error("Invalid download file.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

// Check backend connection
export async function initializeApp() {
  const connection = await checkBackendConnection();

  document.documentElement.dataset.backend =
    connection.connected ? "connected" : "disconnected";

  return connection;
}

// Main application object
export const AnimeStudioApp = {
  API,
  Studios,
  showToast,
  setButtonLoading,
  getErrorMessage,
  downloadBlob,
  initializeApp
};

// Allow browser console access for debugging
if (typeof window !== "undefined") {
  window.AnimeStudioApp = AnimeStudioApp;
}
