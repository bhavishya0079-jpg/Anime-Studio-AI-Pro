from google import genai
from backend.app.config import GEMINI_API_KEY


def generate_youtube_metadata(video_topic: str):
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""
    Create YouTube publishing details for this Hindi anime video:

    Topic: {video_topic}

    Return:
    1. An engaging Hindi YouTube title.
    2. A clear Hindi description.
    3. Relevant hashtags.
    4. Search keywords.
    5. A thumbnail concept.

    Keep everything relevant and honest.
    Do not promise viral results.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text
