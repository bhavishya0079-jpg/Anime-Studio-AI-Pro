
import os
import subprocess
import tempfile
import imageio_ffmpeg


OUTPUT_DIR = os.path.abspath("outputs")

VIDEO_SIZES = {
    "9:16": (1080, 1920),
    "16:9": (1920, 1080)
}


def check_output_path(path):
    absolute_path = os.path.abspath(path)

    if os.path.commonpath(
        [OUTPUT_DIR, absolute_path]
    ) != OUTPUT_DIR:
        raise ValueError(
            "Media files must be inside the outputs folder."
        )

    return absolute_path


def render_video(
    image_files: list,
    audio_file: str,
    output_file: str = "outputs/final_video.mp4",
    fps: int = 30,
    aspect_ratio: str = "9:16",
    scene_duration: float = 5
):
    if not image_files:
        raise ValueError("No scene images provided.")

    if aspect_ratio not in VIDEO_SIZES:
        raise ValueError("Use 9:16 or 16:9 aspect ratio.")

    if fps not in (24, 30, 60):
        raise ValueError("FPS must be 24, 30, or 60.")

    if not 0 < scene_duration <= 60:
        raise ValueError("Scene duration must be between 1 and 60 seconds.")

    audio_file = check_output_path(audio_file)
    output_file = check_output_path(output_file)

    if not os.path.isfile(audio_file):
        raise FileNotFoundError("Audio file not found.")

    checked_images = []

    for image in image_files:
        image = check_output_path(image)

        if not os.path.isfile(image):
            raise FileNotFoundError(
                f"Scene image not found: {image}"
            )

        checked_images.append(image)

    if os.path.abspath(output_file) in checked_images:
        raise ValueError("Output file cannot be a scene image.")

    if output_file == audio_file:
        raise ValueError("Output file cannot be the audio file.")

    width, height = VIDEO_SIZES[aspect_ratio]

    os.makedirs(
        os.path.dirname(output_file),
        exist_ok=True
    )

    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    list_file = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".txt",
            delete=False,
            encoding="utf-8"
        ) as file:

            list_file = file.name

            for image in checked_images:
                path = image.replace("\\", "/")
                path = path.replace("'", "'\\''")

                file.write(f"file '{path}'\n")
                file.write(f"duration {scene_duration}\n")

            last = checked_images[-1].replace("\\", "/")
            last = last.replace("'", "'\\''")

            file.write(f"file '{last}'\n")

        command = [
            ffmpeg,
            "-y",
            "-stream_loop", "-1",
            "-f", "concat",
            "-safe", "0",
            "-i", list_file,
            "-i", audio_file,
            "-vf",
            (
                f"scale={width}:{height}:"
                "force_original_aspect_ratio=decrease,"
                f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,"
                f"fps={fps},format=yuv420p"
            ),
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-shortest",
            "-movflags", "+faststart",
            output_file
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=3600
        )

        if result.returncode != 0:
            raise RuntimeError(
                result.stderr[-2000:]
            )

        if not os.path.isfile(output_file):
            raise RuntimeError("Video output was not created.")

        return output_file

    except subprocess.TimeoutExpired as error:
        raise RuntimeError(
            "Video rendering timed out."
        ) from error

    finally:
        if list_file and os.path.exists(list_file):
            os.remove(list_file)
            
