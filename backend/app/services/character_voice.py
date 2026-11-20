
import os
import uuid
import hashlib
import edge_tts


CHARACTER_VOICES = {
    "male": "hi-IN-MadhurNeural",
    "female": "hi-IN-SwaraNeural"
}

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
    character_key = character.strip().casefold()

    profile_hash = hashlib.sha256(
        character_key.encode("utf-8")
    ).digest()

    profile_index = profile_hash[0] % len(VOICE_PROFILES)

    return VOICE_PROFILES[profile_index]


async def generate_character_dialogues(dialogues: list):
    if not dialogues:
        raise ValueError("No character dialogues provided.")

    output_dir = "outputs/dubbing"
    os.makedirs(output_dir, exist_ok=True)

    results = []

    for dialogue in dialogues:
        character = str(
            dialogue.get("character", "")
        ).strip()

        text = str(
            dialogue.get("text", "")
        ).strip()

        voice_type = str(
            dialogue.get("voice_type", "female")
        ).lower().strip()

        if not text:
            continue

        if not character:
            raise ValueError("Character name is required.")

        if voice_type not in CHARACTER_VOICES:
            raise ValueError(
                "Voice type must be male or female."
            )

        voice = CHARACTER_VOICES[voice_type]

        profile = get_character_profile(character)

        filename = f"{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(output_dir, filename)

        communicate = edge_tts.Communicate(
            text,
            voice,
            rate=profile["rate"],
            pitch=profile["pitch"]
        )

        await communicate.save(filepath)

        results.append({
            "character": character,
            "voice_type": voice_type,
            "voice_profile": profile,
            "audio_file": filepath
        })

    if not results:
        raise ValueError("No valid character dialogues found.")

    return results
    
