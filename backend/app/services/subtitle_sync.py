
from difflib import SequenceMatcher


def sync_subtitles(dialogues: list, duration: float):
    if not dialogues:
        raise ValueError("No dialogue provided.")

    if duration <= 0:
        raise ValueError("Video duration must be positive.")

    valid_dialogues = []

    for item in dialogues:
        text = str(item.get("text", "")).strip()

        if text:
            valid_dialogues.append({
                "character": item.get("character", ""),
                "text": text
            })

    if not valid_dialogues:
        raise ValueError("No valid dialogue found.")

    total_chars = sum(
        len(item["text"]) for item in valid_dialogues
    )

    current_time = 0.0
    results = []

    for item in valid_dialogues:
        share = len(item["text"]) / total_chars
        segment_duration = duration * share

        start = current_time
        end = min(duration, start + segment_duration)

        results.append({
            "character": item["character"],
            "text": item["text"],
            "start": round(start, 3),
            "end": round(end, 3)
        })

        current_time = end

    return results
  
