import os
import uuid
import edge_tts


VOICE_OPTIONS = {
    "female": "hi-IN-SwaraNeural",
    "male": "hi-IN-MadhurNeural"
}


async def generate_voice(text: str, voice_type: str = "female"):
    if not text.strip():
        raise ValueError("Voice text cannot be empty.")

    voice = VOICE_OPTIONS.get(
        voice_type,
        VOICE_OPTIONS["female"]
    )

    os.makedirs("outputs/audio", exist_ok=True)

    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join("outputs/audio", filename)

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(filepath)

    return filepath
