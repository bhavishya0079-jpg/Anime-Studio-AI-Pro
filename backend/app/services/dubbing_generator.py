from google import genai
from backend.app.config import GEMINI_API_KEY


def generate_hindi_dubbing(
    anime_title: str,
    dialogue_text: str
):
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    if not dialogue_text.strip():
        raise ValueError("Dialogue text cannot be empty.")

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""
    You are a professional Hindi anime dubbing script writer.

    Anime: {anime_title}

    Original dialogue:
    {dialogue_text}

    Create a Hindi dubbing script.

    Rules:
    - Keep every character's name separate.
    - Translate dialogue naturally into Hindi.
    - Preserve the original meaning and emotions.
    - Keep the dialogue order unchanged.
    - Do not merge different characters.
    - Return clear speaker labels.
    - Do not invent missing dialogue.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text
