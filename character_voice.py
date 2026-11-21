
import os
import uuid
import hashlib
import edge_tts


CHARACTER_VOICES = {
    "male": "hi-IN-MadhurNeural",
    "female": "hi-IN-SwaraNeural"
}

# Each profile changes rate/pitch so characters sharing the same
# base voice still sound different. edge-tts only ships two Hindi
# voices, so these profiles are what separates the characters.
VOICE_PROFILES = [
    {"rate": "-5%", "pitch": "-8Hz"},
    {"rate": "+0%", "pitch": "-4Hz"},
    {"rate": "+4%", "pitch": "+0Hz"},
    {"rate": "-3%", "pitch": "+4Hz"},
    {"rate": "+6%", "pitch": "+8Hz"},
    {"rate": "+2%", "pitch": "-6Hz"},
    {"rate": "-2%", "pitch": "+6Hz"}
]


def get_character_profile(character: str):
    """Hash-based profile. Kept for backward compatibility."""
    character_key = character.strip().casefold()

    profile_hash = hashlib.sha256(
        character_key.encode("utf-8")
    ).digest()

    profile_index = profile_hash[0] % len(VOICE_PROFILES)

    return VOICE_PROFILES[profile_index]


def assign_character_profiles(names: list[str]):
    """
    Give each distinct character its own profile, in order of first
    appearance. Two characters in the same batch never share a profile
    until there are more characters than profiles.
    """
    profiles = {}

    for name in names:
        key = name.strip().casefold()

        if key not in profiles:
            index = len(profiles) % len(VOICE_PROFILES)
            profiles[key] = VOICE_PROFILES[index]

    return profiles


async def generate_character_dialogues(dialogues: list):
    if not dialogues:
        raise ValueError("No character dialogues provided.")

    output_dir = "outputs/dubbing"
    os.makedirs(output_dir, exist_ok=True)

    # Validate and normalise first so profiles are assigned to real lines only.
    cleaned = []

    for dialogue in dialogues:
        character = str(dialogue.get("character", "")).strip()
        text = str(dialogue.get("text", "")).strip()
        voice_type = str(
            dialogue.get("voice_type", "female")
        ).lower().strip()

        if not text:
            continue

        if not character:
            raise ValueError("Character name is required.")

        if voice_type not in CHARACTER_VOICES:
            raise ValueError("Voice type must be male or female.")

        cleaned.append({
            "character": character,
            "text": text,
            "voice_type": voice_type
        })

    if not cleaned:
        raise ValueError("No valid character dialogues found.")

    profiles = assign_character_profiles(
        [item["character"] for item in cleaned]
    )

    results = []

    for item in cleaned:
        voice = CHARACTER_VOICES[item["voice_type"]]
        profile = profiles[item["character"].casefold()]

        filename = f"{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(output_dir, filename)

        communicate = edge_tts.Communicate(
            item["text"],
            voice,
            rate=profile["rate"],
            pitch=profile["pitch"]
        )

        await communicate.save(filepath)

        results.append({
            "character": item["character"],
            "voice_type": item["voice_type"],
            "voice_profile": profile,
            "audio_file": filepath
        })

    return results
