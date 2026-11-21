
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// HINDI VOICE STUDIO
// =====================================

// Generate Hindi AI voice
export async function generateHindiVoice({
  text,
  voiceType = "female",
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  const cleanText = text.trim();

  if (!cleanText) {
    const error = new Error("Please enter text for voice generation.");
    onError(error.message);
    throw error;
  }

  if (!["male", "female"].includes(voiceType)) {
    const error = new Error("Please select a valid voice type.");
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const audioBlob = await API.generateVoice({
      text: cleanText,
      voice_type: voiceType
    });

    if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
      throw new Error("Voice generation returned an empty audio file.");
    }

    const audioUrl = URL.createObjectURL(audioBlob);

    const result = {
      blob: audioBlob,
      audioUrl,
      voiceType
    };

    onSuccess(result);
    return result;

  } catch (error) {
    onError(error.message || "Hindi voice generation failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Create audio preview
export function previewHindiVoice(audioUrl) {
  if (!audioUrl) {
    throw new Error("No audio available for preview.");
  }

  const audio = new Audio(audioUrl);
  audio.play();

  return audio;
}

// Download generated voice
export function downloadHindiVoice(
  audioBlob,
  filename = "anime-hindi-voice.mp3"
) {
  if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
    throw new Error("No voice file available to download.");
  }

  const audioUrl = URL.createObjectURL(audioBlob);
  const link = document.createElement("a");

  link.href = audioUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(audioUrl);
}

// Release preview audio URL when no longer needed
export function releaseVoiceAudio(audioUrl) {
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }
}
