import os
import uuid
import edge_tts

CHARACTER_VOICES = {
    "male": "hi-IN-MadhurNeural",
    "female": "hi-IN-SwaraNeural"
}


async def generate_character_dialogues(dialogues: list):
    if not dialogues:
        raise ValueError("No character dialogues provided.")

    output_dir = "outputs/dubbing"
    os.makedirs(output_dir, exist_ok=True)

    results = []

    for dialogue in dialogues:
        character = dialogue.get("character", "unknown")
        text = dialogue.get("text", "").strip()
        voice_type = dialogue.get("voice_type", "female")

        if not text:
            continue

        voice = CHARACTER_VOICES.get(
            voice_type,
            CHARACTER_VOICES["female"]
        )

        filename = f"{uuid.uuid4().hex}.mp3"
        filepath = os.path.join(output_dir, filename)

        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(filepath)

        results.append({
            "character": character,
            "audio_file": filepath
        })

    return results
