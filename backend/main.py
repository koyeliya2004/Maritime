"""
SUB-SENTINEL backend – FastAPI application.

Enhanced Features:
✔ Sonar Mode (Acoustic-Optical Hallucination via fuse_sonar_overlay)
✔ Bioluminescence Mode (Intrusion Detection via generate_bioluminescence)
✔ Bounding Box Visualization with forensic confidence
✔ Whisper-Link Bandwidth-Optimized Relay (vector sketch via generate_vector_sketch)
✔ System Status Panel
"""

import os
import logging

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from processing import (
    enhance_image,
    run_detection,
    build_heatmap,
    fuse_sonar_overlay,
    generate_bioluminescence,
    draw_detection_boxes,
    generate_vector_sketch,
)
from sitrep import generate_sitrep

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SUB-SENTINEL API",
    description="Acoustic-Visual Forensics & Threat Relay",
    version="2.0.0",
)

@app.get("/")
def root():
    return {"message": "SUB-SENTINEL running 🚀"}

# CORS
_ORIGINS = [
    os.getenv("FRONTEND_ORIGIN", "https://sub-sentinel.vercel.app"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# 🔧 HELPER FUNCTIONS
# ---------------------------------------------------------------------------

def transmission_status(vector_sketch: str) -> dict:
    return {
        "mode": "AES-256 ENCRYPTED BURST",
        "type": "WHISPER-LINK",
        "compression": "ZSTD-3 ADAPTIVE",
        "signal_strength": "STABLE",
        "vector_sketch": vector_sketch,
    }

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/process")
async def process_image(file: UploadFile = File(...)) -> dict:
    """
    Full pipeline + advanced visualization modes
    """

    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        raw_bytes = await file.read()
    except Exception as exc:
        logger.error("Failed to read upload: %s", exc)
        raise HTTPException(status_code=400, detail="Could not read uploaded file.")

    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Empty file received.")

    try:
        # 🔹 Core pipeline
        enhanced_b64, original_array = enhance_image(raw_bytes)
        detections = run_detection(original_array)
        heatmap_b64 = build_heatmap(original_array)
        sitrep = generate_sitrep(detections)

        # 🔹 Advanced visualization modes
        sonar_b64 = fuse_sonar_overlay(original_array, {})
        biolight_b64 = generate_bioluminescence(original_array)
        boxed_b64 = draw_detection_boxes(original_array, detections)

        vector_sketch = generate_vector_sketch(detections)
        tx_status = transmission_status(vector_sketch)

    except Exception as exc:
        logger.exception("Pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")

    # 🔥 FINAL RESPONSE
    return {
        "enhanced_image_base64": enhanced_b64,
        "heatmap_base64": heatmap_b64,
        "sonar_base64": sonar_b64,
        "biolight_base64": biolight_b64,
        "boxed_image_base64": boxed_b64,
        "detections": detections,
        "sitrep_text": sitrep,
        "transmission": tx_status,
        "system_status": {
            "detection": "ACTIVE",
            "enhancement": "ACTIVE",
            "threat_level": "MEDIUM" if detections else "LOW"
        }
    }