
import os
import uuid

from google import genai
from google.genai import types

from backend.app.config import GEMINI_API_KEY, GEMINI_IMAGE_MODEL


IMAGE_MODEL = GEMINI_IMAGE_MODEL

IMAGE_DIR = "outputs/images"

ASPECT_RATIOS = {
    "9:16",
    "16:9",
    "1:1"
}


def generate_scene_prompt(
    scene_description: str,
    character_details: str = ""
):
    scene_description = str(scene_description).strip()
    character_details = str(character_details).strip()

    if not scene_description:
        raise ValueError("Scene description cannot be empty.")

    return f"""
Create an original, high-quality anime scene.

Scene:
{scene_description}

Character appearance:
{character_details or "Create suitable original anime characters."}

Art direction:
- Professional anime illustration.
- Detailed background and lighting.
- Cinematic composition.
- Expressive character emotions.
- Consistent character appearance.
- Clean image without captions or watermarks.
- Suitable for anime video production.
"""


def generate_scene_image(
    scene_description: str,
    character_details: str = "",
    aspect_ratio: str = "9:16"
):
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing.")

    if aspect_ratio not in ASPECT_RATIOS:
        raise ValueError("Use 9:16, 16:9 or 1:1.")

    prompt = generate_scene_prompt(
        scene_description,
        character_details
    )

    client = genai.Client(api_key=GEMINI_API_KEY)

    response = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio=aspect_ratio
            )
        )
    )

    os.makedirs(IMAGE_DIR, exist_ok=True)

    for part in response.parts:
        if part.inline_data:
            image_data = part.inline_data.data
            mime_type = part.inline_data.mime_type or "image/png"

            extensions = {
                "image/png": ".png",
                "image/jpeg": ".jpg",
                "image/webp": ".webp"
            }

            extension = extensions.get(mime_type)

            if not extension:
                raise RuntimeError(
                    "Unsupported generated image format."
                )

            filename = f"{uuid.uuid4().hex}{extension}"
            filepath = os.path.join(IMAGE_DIR, filename)

            with open(filepath, "wb") as image_file:
                image_file.write(image_data)

            return {
                "success": True,
                "visual_prompt": prompt,
                "image_file": filepath,
                "aspect_ratio": aspect_ratio
            }

    raise RuntimeError(
        "The AI did not return an image."
    )
    
