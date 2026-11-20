import os
import uuid


def generate_srt(subtitle_lines: list, output_dir: str = "outputs/subtitles"):
    os.makedirs(output_dir, exist_ok=True)

    filepath = os.path.join(
        output_dir,
        f"{uuid.uuid4().hex}.srt"
    )

    def timestamp(seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)

        return (
            f"{hours:02}:{minutes:02}:"
            f"{secs:02},{millis:03}"
        )

    with open(filepath, "w", encoding="utf-8") as file:
        for index, line in enumerate(subtitle_lines, start=1):
            start = float(line["start"])
            end = float(line["end"])
            text = line["text"]

            if start < 0 or end <= start:
                raise ValueError("Invalid subtitle timing.")

            file.write(f"{index}\n")
            file.write(
                f"{timestamp(start)} --> {timestamp(end)}\n"
            )
            file.write(f"{text}\n\n")

    return filepath
