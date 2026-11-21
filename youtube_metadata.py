
from google import genai
from backend.app.config import GEMINI_API_KEY, GEMINI_TEXT_MODEL


def generate_youtube_metadata(video_topic: str):
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    video_topic = str(video_topic).strip()

    if not video_topic:
        raise ValueError("Video topic cannot be empty.")

    if len(video_topic) > 2000:
        raise ValueError("Video topic is too long.")

    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""
    You are a professional Hindi YouTube content assistant.

    Create publishing details for this anime video.

    Video topic:
    {video_topic}

    Return these sections in natural Hindi:

    1. YouTube title:
       Clear, engaging and relevant.

    2. Description:
       Explain what the video contains.
       Do not invent facts.

    3. Hashtags:
       Use relevant and limited hashtags.

    4. Search keywords:
       Provide useful search terms.

    5. Thumbnail concept:
       Describe an attractive original thumbnail.

    Important rules:
    - Never promise viral results.
    - Do not create misleading clickbait.
    - Do not invent episode events or facts.
    - Do not claim official affiliation.
    - Keep the content suitable for YouTube.
    """

    try:
        response = client.models.generate_content(
            model=GEMINI_TEXT_MODEL,
            contents=prompt
        )

        result = response.text

        if not result or not result.strip():
            raise RuntimeError(
                "AI returned an empty YouTube response."
            )

        return result.strip()

    except Exception as error:
        raise RuntimeError(
            "YouTube metadata generation failed."
        ) from error
        
