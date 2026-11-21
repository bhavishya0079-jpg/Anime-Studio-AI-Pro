
import os
import uuid
import math


def generate_srt(
    subtitle_lines: list,
    output_dir: str = "outputs/subtitles"
):
    if not subtitle_lines:
        raise ValueError("No subtitle lines provided.")

    validated_lines = []

    for line in subtitle_lines:
        try:
            start = float(line["start"])
            end = float(line["end"])
            text = str(line["text"]).strip()
        except (KeyError, TypeError, ValueError):
            raise ValueError("Invalid subtitle data.")

        if not math.isfinite(start) or not math.isfinite(end):
            raise ValueError("Subtitle timing must be finite.")

        if start < 0 or end <= start:
            raise ValueError("Invalid subtitle timing.")

        if not text:
            raise ValueError("Subtitle text cannot be empty.")

        validated_lines.append({
            "start": start,
            "end": end,
            "text": text
        })

    def timestamp(seconds):
        total_ms = round(seconds * 1000)

        hours, remainder = divmod(total_ms, 3600000)
        minutes, remainder = divmod(remainder, 60000)
        secs, millis = divmod(remainder, 1000)

        return (
            f"{hours:02}:{minutes:02}:"
            f"{secs:02},{millis:03}"
        )

    os.makedirs(output_dir, exist_ok=True)

    filepath = os.path.join(
        output_dir,
        f"{uuid.uuid4().hex}.srt"
    )

    with open(filepath, "w", encoding="utf-8") as file:
        for index, line in enumerate(validated_lines, start=1):
            file.write(f"{index}\n")
            file.write(
                f"{timestamp(line['start'])} --> "
                f"{timestamp(line['end'])}\n"
            )
            file.write(f"{line['text']}\n\n")

    return filepath
    
