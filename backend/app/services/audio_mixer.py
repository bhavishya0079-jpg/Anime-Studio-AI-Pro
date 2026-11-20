import os
import subprocess


def mix_audio(
    voice_file: str,
    music_file: str,
    output_file: str,
    music_volume: float = 0.15
):
    if not os.path.exists(voice_file):
        raise FileNotFoundError("Voice audio not found.")

    if not os.path.exists(music_file):
        raise FileNotFoundError("Background music not found.")

    music_volume = max(0.0, min(1.0, music_volume))

    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)

    command = [
        "ffmpeg", "-y",
        "-i", voice_file,
        "-i", music_file,
        "-filter_complex",
        f"[1:a]volume={music_volume}[bg];"
        "[0:a][bg]amix=inputs=2:duration=first:normalize=0[a]",
        "-map", "[a]",
        "-c:a", "libmp3lame",
        output_file
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr[-1000:])

    return output_file
