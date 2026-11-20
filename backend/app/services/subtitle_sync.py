
def sync_subtitles(dialogues: list, duration: float):
    if not dialogues:
        raise ValueError("No dialogue provided.")

    if duration <= 0:
        raise ValueError("Video duration must be positive.")

    valid_dialogues = []

    for item in dialogues:
        text = str(item.get("text", "")).strip()

        if not text:
            continue

        words = text.split()

        weight = len(words)

        # Give a little extra time for punctuation pauses.
        weight += sum(
            0.5 for char in text
            if char in "।.!?;,"
        )

        valid_dialogues.append({
            "character": str(item.get("character", "")),
            "text": text,
            "weight": max(weight, 1)
        })

    if not valid_dialogues:
        raise ValueError("No valid dialogue found.")

    total_weight = sum(
        item["weight"] for item in valid_dialogues
    )

    current_time = 0.0
    results = []

    for index, item in enumerate(valid_dialogues):
        start = current_time

        if index == len(valid_dialogues) - 1:
            end = duration
        else:
            segment_duration = (
                duration * item["weight"] / total_weight
            )

            end = min(
                duration,
                start + segment_duration
            )

        results.append({
            "character": item["character"],
            "text": item["text"],
            "start": round(start, 3),
            "end": round(end, 3)
        })

        current_time = end

    return results
    
