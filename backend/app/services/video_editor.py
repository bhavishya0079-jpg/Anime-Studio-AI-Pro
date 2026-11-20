import os
import subprocess


def render_video(
    image_files: list,
    audio_file: str,
    output_file: str,
    fps: int = 30
):
    if not image_files:
        raise ValueError("No scene images provided.")

    if not os.path.exists(audio_file):
        raise FileNotFoundError("Audio file not found.")

    for image in image_files:
        if not os.path.exists(image):
            raise FileNotFoundError(f"Scene not found: {image}")

    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)

    command = [
        "ffmpeg",
        "-y",
        "-framerate", str(fps),
        "-i", "placeholder",
    ]

    raise NotImplementedError(
        "Video rendering pipeline will be connected "
        "after scene timing, transitions and audio sync are ready."
    )
