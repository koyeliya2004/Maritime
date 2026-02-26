"""
SITREP generation using the Groq API (llama-3.1-8b-instant).

Falls back to a static template when GROQ_API_KEY is not set or when
the API call fails, so the system remains functional without credentials.
"""

import os
import logging

logger = logging.getLogger(__name__)


def _build_prompt(detections: list[dict]) -> str:
    """Compose the SITREP prompt from detection results."""
    if not detections:
        det_summary = "No objects detected in the current frame."
    else:
        lines = []
        for d in detections:
            x1, y1, x2, y2 = d["bbox"]
            lines.append(
                f"  - {d['mapped_label']} (conf {d['confidence']:.0%}) "
                f"at pixel coords ({x1},{y1})→({x2},{y2})"
            )
        det_summary = "\n".join(lines)

    return (
        "You are the AI analyst for SUB-SENTINEL, an underwater forensics system.\n"
        "Generate a concise, military-style SITREP (≤120 words) based on these detections:\n\n"
        f"{det_summary}\n\n"
        "Format: SITUATION / ASSESSMENT / RECOMMENDATION. Use clear, direct language."
    )


def _static_sitrep(detections: list[dict]) -> str:
    """Minimal static fallback when Groq is unavailable."""
    if not detections:
        return (
            "SITUATION: Sensor sweep complete – no contacts.\n"
            "ASSESSMENT: Area clear.\n"
            "RECOMMENDATION: Continue routine patrol."
        )
    labels = ", ".join({d["mapped_label"] for d in detections})
    count = len(detections)
    return (
        f"SITUATION: {count} contact(s) detected – {labels}.\n"
        "ASSESSMENT: Requires manual review.\n"
        "RECOMMENDATION: Dispatch response team and maintain sensor lock."
    )


def generate_sitrep(detections: list[dict]) -> str:
    """
    Call Groq llama-3.1-8b-instant to generate a SITREP.
    Falls back to _static_sitrep if GROQ_API_KEY is absent or on any error.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.info("GROQ_API_KEY not set; using static SITREP fallback.")
        return _static_sitrep(detections)

    try:
        from groq import Groq  # lazy import

        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": _build_prompt(detections)},
            ],
            max_tokens=200,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        logger.warning("Groq SITREP generation failed (%s); using static fallback.", exc)
        return _static_sitrep(detections)
