"""
SUB-SENTINEL backend – FastAPI application.
Enhanced Features Added:
✔ Sonar Mode
✔ Bioluminescence Mode
✔ Bounding Box Visualization
✔ Low Bandwidth Transmission Mode
✔ System Status Panel
"""

import os
import logging

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Import ALL needed functions from processing.py (use the fixed versions!)
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

def transmission_status():
    """System transmission metadata"""
    return {
        "mode": "ACTIVE",
        "type": "LOW BANDWIDTH",
        "compression": "1KB",
        "signal_strength": "STABLE"
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
        enhanced_b64, rgb_array = enhance_image(raw_bytes)
        detections = run_detection(rgb_array)
        heatmap_b64 = build_heatmap(rgb_array)
        sitrep = generate_sitrep(detections)

        # 🔹 ADVANCED VISUALIZATION MODES (using fixed processing.py functions)
        sonar_b64 = fuse_sonar_overlay(rgb_array, sonar_data={"angle": 0, "sweep": 30})
        biolight_b64 = generate_bioluminescence(rgb_array)
        boxed_b64 = draw_detection_boxes(rgb_array, detections)

        # 🔹 Low-bandwidth vector sketch
        vector_sketch = generate_vector_sketch(detections, max_bytes=1024)

        # 🔹 Transmission status
        tx_status = transmission_status()

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
        "vector_sketch": vector_sketch,
        "detections": detections,
        "sitrep_text": sitrep,
        "transmission": tx_status,
        "system_status": {
            "detection": "ACTIVE",
            "enhancement": "ACTIVE",
            "threat_level": "MEDIUM" if detections else "LOW"
        }
    }