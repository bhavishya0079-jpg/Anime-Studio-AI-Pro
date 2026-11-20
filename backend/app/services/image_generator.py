from google import genai
from backend.app.config import GEMINI_API_KEY


def generate_scene_prompt(
    scene_description: str,
    character_details: str = ""
):
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    if not scene_description.strip():
        raise ValueError("Scene description cannot be empty.")

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""
    Create a detailed visual prompt for an original anime scene.

    Scene:
    {scene_description}

    Character details:
    {character_details}

    Requirements:
    - High-quality anime art direction.
    - Consistent character appearance.
    - Detailed background and lighting.
    - Cinematic composition.
    - Expressive character emotions.
    - Suitable for YouTube Shorts and episodes.
    - Do not include text or watermarks.

    Return only the final image-generation prompt.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text
