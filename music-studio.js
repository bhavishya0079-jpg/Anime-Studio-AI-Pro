
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// MUSIC & SOUND STUDIO
// =====================================

export async function mixAnimeAudio({
  voiceFile,
  musicFile,
  musicVolume = 0.15,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (!voiceFile || !voiceFile.trim()) {
    const error = new Error("Please select a voice audio file.");
    onError(error.message);
    throw error;
  }

  if (!musicFile || !musicFile.trim()) {
    const error = new Error("Please select a background music file.");
    onError(error.message);
    throw error;
  }

  if (
    !Number.isFinite(musicVolume) ||
    musicVolume < 0 ||
    musicVolume > 1
  ) {
    const error = new Error("Music volume must be between 0 and 1.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const audioBlob = await API.mixAudio({
      voice_file: voiceFile.trim(),
      music_file: musicFile.trim(),
      music_volume: musicVolume
    });

    if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
      throw new Error("Audio mixing returned an empty file.");
    }

    const result = {
      blob: audioBlob,
      audioUrl: URL.createObjectURL(audioBlob),
      filename: "anime-final-mix.mp3"
    };

    onSuccess(result);
    return result;

  } catch (error) {
    onError(error.message || "Audio mixing failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Preview mixed audio
export function previewMixedAudio(audioUrl) {
  if (!audioUrl) {
    throw new Error("No mixed audio available.");
  }

  const audio = new Audio(audioUrl);
  audio.play();

  return audio;
}

// Download final audio
export function downloadMixedAudio(
  audioBlob,
  filename = "anime-final-mix.mp3"
) {
  if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
    throw new Error("No audio file available.");
  }

  const url = URL.createObjectURL(audioBlob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// Release audio preview URL
export function releaseMixedAudio(audioUrl) {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }
}

// Music volume settings
export function getMusicVolumeSettings() {
  return {
    minimum: 0,
    maximum: 1,
    default: 0.15,
    step: 0.05
  };
}
