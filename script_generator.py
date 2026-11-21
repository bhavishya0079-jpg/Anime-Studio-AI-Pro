
from google import genai
from backend.app.config import GEMINI_API_KEY, GEMINI_TEXT_MODEL


def generate_script(topic: str, mode: str = "original", episode: str = ""):

    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    client = genai.Client(api_key=GEMINI_API_KEY)

    if mode == "explanation":
        prompt = f"""
        Create an engaging Hindi anime explanation script.

        Anime: {topic}
        Episode: {episode}

        Requirements:
        - Write in natural Hindi.
        - Explain the story clearly.
        - Include important scenes and events.
        - Use engaging narration.
        - Add character dialogues where appropriate.
        - Do not invent events that are not in the episode.
        - Make it suitable for YouTube Shorts or long videos.
        """
    else:
        prompt = f"""
        Create an original anime story script in Hindi.

        Story idea: {topic}

        Requirements:
        - Create original characters.
        - Give each character a distinct personality.
        - Include natural Hindi dialogues.
        - Add scene-by-scene descriptions.
        - Make the story engaging and cinematic.
        - Keep character details consistent.
        """

    response = client.models.generate_content(
        model=GEMINI_TEXT_MODEL,
        contents=prompt
    )

    return response.text
    
