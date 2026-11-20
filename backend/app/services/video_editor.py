import os
import subprocess
import tempfile
import imageio_ffmpeg


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

    os.makedirs(
        os.path.dirname(output_file) or ".",
        exist_ok=True
    )

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".txt",
        delete=False,
        encoding="utf-8"
    ) as file:
        for image in image_files:
            path = os.path.abspath(image).replace("\\", "/")
            path = path.replace("'", "'\\''")
            file.write(f"file '{path}'\n")
            file.write("duration 5\n")

        last = os.path.abspath(image_files[-1]).replace("\\", "/")
        last = last.replace("'", "'\\''")
        file.write(f"file '{last}'\n")

        list_file = file.name

    command = [
        ffmpeg,
        "-y",
        "-stream_loop", "-1",
        "-f", "concat",
        "-safe", "0",
        "-i", list_file,
        "-i", audio_file,
        "-vf",
        f"scale=1080:1920:force_original_aspect_ratio=decrease,"
        f"pad=1080:1920:(ow-iw)/2:(oh-ih)/2,"
        f"fps={fps},format=yuv420p",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-shortest",
        "-movflags", "+faststart",
        output_file
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise RuntimeError(result.stderr[-2000:])

        return output_file

    finally:
        if os.path.exists(list_file):
            os.remove(list_file)
