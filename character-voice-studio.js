
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// CHARACTER VOICE STUDIO
// =====================================

// Generate separate voices for characters
export async function generateCharacterVoices({
  dialogues,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  if (!Array.isArray(dialogues) || dialogues.length === 0) {
    const error = new Error("Please add character dialogues.");
    onError(error.message);
    throw error;
  }

  const cleanedDialogues = dialogues.map((item) => ({
    character: String(item.character || "").trim(),
    text: String(item.text || "").trim(),
    voice_type: String(item.voice_type || "female").toLowerCase()
  }));

  const invalidDialogue = cleanedDialogues.find(
    item =>
      !item.character ||
      !item.text ||
      !["male", "female"].includes(item.voice_type)
  );

  if (invalidDialogue) {
    const error = new Error(
      "Every dialogue needs a character name, text, and valid voice type."
    );
    onError(error.message);
    throw error;
  }

  try {
    onLoading(true);

    const result = await API.generateCharacterVoices({
      dialogues: cleanedDialogues
    });

    if (!result || !result.success || !Array.isArray(result.characters)) {
      throw new Error("Character voice generation failed.");
    }

    onSuccess(result.characters);
    return result.characters;

  } catch (error) {
    onError(error.message || "Character voice generation failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Group dialogues by character
export function groupDialoguesByCharacter(dialogues = []) {
  const groups = {};

  dialogues.forEach((dialogue) => {
    const name = String(dialogue.character || "").trim();

    if (!name) return;

    if (!groups[name]) {
      groups[name] = [];
    }

    groups[name].push(dialogue);
  });

  return groups;
}

// Create a character voice profile
export function createCharacterVoiceProfile({
  character,
  voiceType = "female"
}) {
  const name = String(character || "").trim();

  if (!name) {
    throw new Error("Character name is required.");
  }

  if (!["male", "female"].includes(voiceType)) {
    throw new Error("Voice type must be male or female.");
  }

  return {
    character: name,
    voice_type: voiceType
  };
}

// Play generated character audio
export function playCharacterAudio(audioUrl) {
  if (!audioUrl) {
    throw new Error("Audio file is not available.");
  }

  const audio = new Audio(audioUrl);
  audio.play();

  return audio;
}
