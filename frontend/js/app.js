
import { API, API_BASE_URL, checkBackendConnection } from "./api.js";

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

export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = String(message);
  container.appendChild(toast);

  window.setTimeout(() => toast.remove(), 4000);
}

export function setButtonLoading(button, loading, text = "Please wait...") {
  if (!button) return;

  if (loading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    button.disabled = true;
    button.textContent = text;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

export function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export function downloadBlob(blob, filename = "anime-studio-export") {
  if (!(blob instanceof Blob)) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function el(id) {
  return document.getElementById(id);
}

function value(id) {
  return el(id)?.value?.trim() || "";
}

function output(id, message) {
  const node = el(id);
  if (node) node.textContent = message;
}

function runButton(id, loadingText, task) {
  const button = el(id);
  if (!button) return;

  button.addEventListener("click", async () => {
    setButtonLoading(button, true, loadingText);

    try {
      await task();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setButtonLoading(button, false);
    }
  });
}

function mediaUrl(path) {
  if (!path) return "";
  const clean = path.replace(/\\/g, "/").replace(/^\/+/, "");
  const relative = clean.startsWith("outputs/")
    ? clean.slice("outputs/".length)
    : clean;

  return `${API_BASE_URL}/media/${relative
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

// ------------------------------
// NAVIGATION
// ------------------------------

function showPage(page) {
  document.querySelectorAll(".studio-section").forEach(section => {
    section.classList.toggle("active", section.id === `page-${page}`);
  });

  document.querySelectorAll("[data-page]").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  const title = document.querySelector(`[data-page="${page}"]`);
  if (el("topbarTitle")) {
    el("topbarTitle").textContent =
      title?.textContent?.trim() || page;
  }

  window.location.hash = page;

  el("sidebar")?.classList.remove("open");
  el("sidebarOverlay")?.classList.remove("active");
}

function initializeNavigation() {
  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      showPage(link.dataset.page);
    });
  });

  el("menuToggle")?.addEventListener("click", () => {
    el("sidebar")?.classList.toggle("open");
    el("sidebarOverlay")?.classList.toggle("active");
  });

  el("sidebarOverlay")?.addEventListener("click", () => {
    el("sidebar")?.classList.remove("open");
    el("sidebarOverlay")?.classList.remove("active");
  });

  const initial = window.location.hash.replace("#", "");
  const valid = document.getElementById(`page-${initial}`);
  showPage(valid ? initial : "dashboard");
}

// ------------------------------
// BACKEND STATUS
// ------------------------------

export async function initializeApp() {
  const status = el("backendStatus");
  const connection = await checkBackendConnection();

  document.documentElement.dataset.backend =
    connection.connected ? "connected" : "disconnected";

  if (status) {
    status.textContent = connection.connected
      ? "Backend Connected"
      : "Backend Offline";
  }

  return connection;
}

// ------------------------------
// SCRIPT STUDIO
// ------------------------------

let currentScript = "";

function initializeScriptStudio() {
  el("scriptMode")?.addEventListener("change", () => {
    el("episodeGroup")?.classList.toggle(
      "hidden",
      value("scriptMode") !== "explanation"
    );
  });

  runButton("generateScriptBtn", "Generating Script...", async () => {
    currentScript = await ScriptStudio.generateAnimeScript({
      topic: value("scriptTopic"),
      mode: value("scriptMode") || "original",
      episode: value("episodeNumber"),
      onLoading: loading => setButtonLoading(el("generateScriptBtn"), loading),
      onSuccess: script => output("scriptOutput", script)
    });

    showToast("Hindi script generated!", "success");
  });

  el("copyScriptBtn")?.addEventListener("click", async () => {
    if (!currentScript) return showToast("Generate a script first.", "error");
    await ScriptStudio.copyScript(currentScript);
    showToast("Script copied.", "success");
  });

  el("downloadScriptBtn")?.addEventListener("click", () => {
    if (!currentScript) return showToast("Generate a script first.", "error");
    ScriptStudio.downloadScript(currentScript);
  });

  el("saveScriptBtn")?.addEventListener("click", async () => {
    if (!currentScript) return showToast("Generate a script first.", "error");

    try {
      await ProjectManager.saveProject({
        projectData: ProjectManager.createProjectData({
          title: value("scriptTopic") || "Anime Script",
          description: "Created with Hindi Script Studio",
          mode: value("scriptMode"),
          content: { script: currentScript }
        })
      });

      showToast("Project saved successfully!", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  });
}

// ------------------------------
// HINDI VOICE STUDIO
// ------------------------------

let currentVoiceBlob = null;
let currentVoiceUrl = null;

function initializeVoiceStudio() {
  runButton("generateVoiceBtn", "Generating Voice...", async () => {
    const result = await VoiceStudio.generateHindiVoice({
      text: value("voiceText"),
      voiceType: value("voiceType"),
      onLoading: loading => setButtonLoading(el("generateVoiceBtn"), loading)
    });

    currentVoiceBlob = result.blob;

    if (currentVoiceUrl) URL.revokeObjectURL(currentVoiceUrl);
    currentVoiceUrl = result.audioUrl;

    const player = el("voicePreview");
    if (player) {
      player.src = currentVoiceUrl;
      player.classList.remove("hidden");
    }

    if (el("downloadVoiceBtn")) el("downloadVoiceBtn").disabled = false;
    showToast("Hindi voice generated!", "success");
  });

  el("downloadVoiceBtn")?.addEventListener("click", () => {
    if (currentVoiceBlob) {
      VoiceStudio.downloadHindiVoice(currentVoiceBlob);
    }
  });
}

// ------------------------------
// CHARACTER VOICE STUDIO
// ------------------------------

let characterDialogues = [];

function initializeCharacterStudio() {
  el("addCharacterDialogueBtn")?.addEventListener("click", () => {
    const character = value("characterName");
    const text = value("characterDialogue");
    const voice_type = value("characterVoiceType");

    if (!character || !text) {
      return showToast("Enter character name and dialogue.", "error");
    }

    characterDialogues.push({ character, text, voice_type });

    output(
      "characterQueue",
      characterDialogues.map(item =>
        `${item.character} (${item.voice_type}): ${item.text}`
      ).join("\n")
    );

    el("characterDialogue").value = "";
    showToast("Dialogue added.", "success");
  });

  runButton("generateCharacterVoicesBtn", "Generating Voices...", async () => {
    if (!characterDialogues.length) {
      throw new Error("Add at least one character dialogue first.");
    }

    const results = await CharacterVoiceStudio.generateCharacterVoices({
      dialogues: characterDialogues
    });

    const container = el("characterResults");
    if (!container) return;

    container.textContent = "";

    results.forEach(item => {
      const wrapper = document.createElement("div");
      wrapper.className = "mb-2";

      const heading = document.createElement("p");
      heading.textContent = `${item.character} - ${item.voice_type}`;
      wrapper.appendChild(heading);

      if (item.audio_file) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = mediaUrl(item.audio_file);
        audio.style.width = "100%";
        wrapper.appendChild(audio);
      }

      container.appendChild(wrapper);
    });

    showToast("Character voices generated.", "success");
  });
}

// ------------------------------
// DUBBING STUDIO
// ------------------------------

let currentDubbingScript = "";

function initializeDubbingStudio() {
  el("hindiDubFields")?.classList.add("hidden");
  el("dubbingMode")?.addEventListener("change", () => {
    const isHindi = value("dubbingMode") === "hindi_dub";
    el("hindiDubFields")?.classList.toggle("hidden", !isHindi);
    output(
      "dubbingOutput",
      isHindi
        ? "Enter the original dialogue to generate a Hindi dubbing script."
        : "Original Audio Mode selected. Source audio is not changed."
    );
  });

  runButton("generateDubbingBtn", "Generating Hindi Dub...", async () => {
    if (value("dubbingMode") !== "hindi_dub") {
      throw new Error("Select Hindi Dub Mode first.");
    }

    currentDubbingScript = await DubbingStudio.generateHindiDubbingScript({
      animeTitle: value("animeTitle"),
      dialogueText: value("originalDialogue")
    });

    output("dubbingOutput", currentDubbingScript);
        characterDialogues = DubbingStudio.splitDubbingDialogues(
      currentDubbingScript
    ).map(item => ({
      character: item.character,
      text: item.text,
            voice_type: value("characterVoiceType") || "male"
    }));

    output(
      "characterQueue",
      characterDialogues.map(item =>
        `${item.character} (${item.voice_type}): ${item.text}`
      ).join("\n") || "No character dialogues found."
    );
    showToast("Hindi dubbing script generated.", "success");
  });

  el("downloadDubbingBtn")?.addEventListener("click", () => {
    if (!currentDubbingScript) {
      return showToast("Generate a dubbing script first.", "error");
    }
    DubbingStudio.downloadDubbingScript(currentDubbingScript);
  });
}

// ------------------------------
// AI VISUAL STUDIO
// ------------------------------

function initializeVisualStudio() {
  runButton("generateVisualBtn", "Creating Anime Visual...", async () => {
    await VisualStudio.generateAnimeVisual({
      sceneDescription: value("sceneDescription"),
      characterDetails: value("characterDetails"),
      aspectRatio: value("visualRatio"),
      onLoading: loading =>
        setButtonLoading(el("generateVisualBtn"), loading)
    });

    showToast("Anime visual generated.", "success");
  });
}

// ------------------------------
// VIDEO EDITOR
// ------------------------------

function initializeVideoEditor() {
  runButton("renderVideoBtn", "Rendering Video...", async () => {
    const imageFiles = value("videoImagePaths")
      .split("\n")
      .map(path => path.trim())
      .filter(Boolean);

    const result = await VideoEditor.renderAnimeVideo({
      imageFiles,
      audioFile: value("videoAudioPath"),
      aspectRatio: value("videoRatio"),
      fps: Number(value("videoFps")),
      sceneDuration: Number(value("sceneDuration")),
      onLoading: loading =>
        setButtonLoading(el("renderVideoBtn"), loading)
    });

    const container = el("videoOutput");
    if (container) {
      container.textContent = "";

      const message = document.createElement("p");
      message.textContent = "Video rendered successfully.";
      container.appendChild(message);

      const link = document.createElement("a");
      link.href = mediaUrl(result.video);
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open / Download Video";
      container.appendChild(link);
    }

    showToast("Video rendering completed.", "success");
  });
}

// ------------------------------
// MUSIC STUDIO
// ------------------------------

let currentMixedBlob = null;
let currentMixedUrl = null;

function initializeMusicStudio() {
  el("musicVolume")?.addEventListener("input", () => {
    const percent = Math.round(Number(value("musicVolume")) * 100);
    output("musicVolumeValue", `${percent}%`);
  });

  runButton("mixAudioBtn", "Mixing Audio...", async () => {
    const result = await MusicStudio.mixAnimeAudio({
      voiceFile: value("mixVoicePath"),
      musicFile: value("mixMusicPath"),
      musicVolume: Number(value("musicVolume"))
    });

    currentMixedBlob = result.blob;

    if (currentMixedUrl) URL.revokeObjectURL(currentMixedUrl);
    currentMixedUrl = result.audioUrl;

    const player = el("mixedAudioPreview");
    if (player) {
      player.src = currentMixedUrl;
      player.classList.remove("hidden");
    }

    if (el("downloadMixedAudioBtn")) {
      el("downloadMixedAudioBtn").disabled = false;
    }

    showToast("Audio mixed successfully.", "success");
  });

  el("downloadMixedAudioBtn")?.addEventListener("click", () => {
    if (currentMixedBlob) MusicStudio.downloadMixedAudio(currentMixedBlob);
  });
}

// ------------------------------
// SUBTITLE STUDIO
// ------------------------------

let currentSubtitleLines = [];
let currentSubtitleBlob = null;

function initializeSubtitleStudio() {
  runButton("syncSubtitleBtn", "Synchronizing...", async () => {
    const dialogues = value("subtitleDialogue")
      .split("\n")
      .map(line => {
        const separator = line.indexOf(":");

        if (separator < 0) {
          return { character: "", text: line.trim() };
        }

        return {
          character: line.slice(0, separator).trim(),
          text: line.slice(separator + 1).trim()
        };
      })
      .filter(item => item.text);

    currentSubtitleLines = await SubtitleStudio.synchronizeSubtitles({
      dialogues,
      duration: Number(value("subtitleDuration"))
    });

    output(
      "subtitleOutput",
      currentSubtitleLines.map((line, index) =>
        `${index + 1}. ${line.start}s - ${line.end}s\n${line.text}`
      ).join("\n\n")
    );

    if (el("downloadSubtitleBtn")) {
      el("downloadSubtitleBtn").disabled = false;
    }

    showToast("Subtitle timing generated.", "success");
  });

  el("downloadSubtitleBtn")?.addEventListener("click", async () => {
    try {
      if (!currentSubtitleLines.length) {
        throw new Error("Synchronize subtitles first.");
      }

      const result = await SubtitleStudio.generateSubtitleFile({
        lines: currentSubtitleLines
      });

      currentSubtitleBlob = result.blob;
      SubtitleStudio.downloadSubtitleFile(
        currentSubtitleBlob,
        result.filename
      );
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  });
}

// ------------------------------
// UPLOAD STUDIO
// ------------------------------

function initializeUploadStudio() {
  el("mediaFile")?.addEventListener("change", () => {
    const file = el("mediaFile").files?.[0];
    if (!file) return;

    try {
      UploadStudio.validateUploadFile(file);
      output(
        "uploadFileInfo",
        `${file.name} · ${UploadStudio.formatFileSize(file.size)}`
      );
    } catch (error) {
      output("uploadFileInfo", error.message);
      showToast(error.message, "error");
    }
  });

  runButton("uploadMediaBtn", "Uploading File...", async () => {
    const file = el("mediaFile")?.files?.[0];

    const result = await UploadStudio.uploadMedia({ file });

    output(
      "uploadOutput",
      `Uploaded: ${result.filename}\nPath: ${result.file_path}\nSize: ${UploadStudio.formatFileSize(result.size_bytes)}`
    );

    // Automatically put uploaded paths into the related studio field.
    if (file.type.startsWith("image/")) {
      const field = el("videoImagePaths");
      if (field) {
        field.value = [field.value, result.file_path].filter(Boolean).join("\n");
      }
    } else if (file.type.startsWith("audio/")) {
      const voiceField = el("mixVoicePath");
const videoVoiceField = el("videoAudioPath");
const musicField = el("mixMusicPath");

if (voiceField && !voiceField.value) {
  voiceField.value = result.file_path;

  if (videoVoiceField && !videoVoiceField.value) {
    videoVoiceField.value = result.file_path;
  }
} else if (musicField && !musicField.value) {
  musicField.value = result.file_path;
}
    }

    showToast("File uploaded successfully.", "success");
  });
}

// ------------------------------
// YOUTUBE STUDIO
// ------------------------------

let currentYoutubeMetadata = "";

function initializeYouTubeStudio() {
  runButton("generateYoutubeBtn", "Generating Metadata...", async () => {
    currentYoutubeMetadata = await YouTubeStudio.generateYouTubeMetadata({
      videoTopic: value("youtubeTopic")
    });

    output("youtubeOutput", currentYoutubeMetadata);
    showToast("YouTube metadata generated.", "success");
  });

  el("copyYoutubeBtn")?.addEventListener("click", async () => {
    if (!currentYoutubeMetadata) {
      return showToast("Generate metadata first.", "error");
    }

    await YouTubeStudio.copyYouTubeMetadata(currentYoutubeMetadata);
    showToast("Metadata copied.", "success");
  });

  el("downloadYoutubeBtn")?.addEventListener("click", () => {
    if (!currentYoutubeMetadata) {
      return showToast("Generate metadata first.", "error");
    }

    YouTubeStudio.downloadYouTubeMetadata(currentYoutubeMetadata);
  });
}

// ------------------------------
// PROJECT HISTORY
// ------------------------------

function initializeProjects() {
  runButton("refreshProjectsBtn", "Loading Projects...", async () => {
    const projects = await ProjectManager.loadProjectHistory();
    const container = el("projectsOutput");
    if (!container) return;

    container.textContent = "";

    if (!projects.length) {
      container.textContent = "No saved projects yet.";
      return;
    }

    projects.forEach(project => {
      const item = document.createElement("div");
      item.className = "mb-2";

      const title = document.createElement("strong");
      title.textContent =
        project.data?.title || project.title || "Untitled Project";

      const description = document.createElement("p");
      description.textContent =
        project.data?.description || project.description || "";

      item.appendChild(title);
      item.appendChild(description);
      container.appendChild(item);
    });

    showToast("Projects loaded.", "success");
  });
}

// ------------------------------
// START APPLICATION
// ------------------------------

export function initialize() {
  initializeNavigation();
  initializeScriptStudio();
  initializeVoiceStudio();
  initializeCharacterStudio();
  initializeDubbingStudio();
  initializeVisualStudio();
  initializeVideoEditor();
  initializeMusicStudio();
  initializeSubtitleStudio();
  initializeUploadStudio();
  initializeYouTubeStudio();
  initializeProjects();

    initializeApp().then(connection => {
    if (!connection.connected) {
      showToast("Backend is currently unavailable. Please try again later.", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", initialize);
