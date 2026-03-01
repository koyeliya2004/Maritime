"""
SUB-SENTINEL backend – FastAPI application.

Enhanced Features Added:
✔ Sonar Mode
✔ Bioluminescence Mode
✔ Bounding Box Visualization
✔ Low Bandwidth Transmission Mode
✔ System Status Panel
"""

import cv2
import numpy as np
import base64
import os
import logging

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from processing import enhance_image, run_detection, build_heatmap
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
# 🔧 HELPER FUNCTIONS (NEW FEATURES)
# ---------------------------------------------------------------------------

def generate_sonar(image_array):
    h, w, _ = image_array.shape
    sonar = np.zeros((h, w, 3), dtype=np.uint8)

    center = (w // 2, h // 2)

    # circular waves
    for r in range(50, min(center), 40):
        cv2.circle(sonar, center, r, (0, 255, 0), 1)

    # scanning line
    cv2.line(sonar, center, (w, h//2), (0, 255, 0), 2)

    blended = cv2.addWeighted(image_array, 0.3, sonar, 0.7, 0)

    _, buffer = cv2.imencode('.jpg', blended)
    return base64.b64encode(buffer).decode('utf-8')


def apply_bioluminescence(image_array):
    hsv = cv2.cvtColor(image_array, cv2.COLOR_BGR2HSV)
    hsv[:, :, 2] = cv2.add(hsv[:, :, 2], 50)

    glow = cv2.GaussianBlur(image_array, (0, 0), 15)
    result = cv2.addWeighted(image_array, 0.6, glow, 0.8, 0)

    _, buffer = cv2.imencode('.jpg', result)
    return base64.b64encode(buffer).decode('utf-8')


def draw_detections(image, detections):
    for det in detections:
        x1, y1, x2, y2 = map(int, det["bbox"])
        label = f"{det['mapped_label']} {int(det['confidence']*100)}%"

        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(
            image,
            label,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2
        )

    return image


def transmission_status():
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
        enhanced_b64, original_array = enhance_image(raw_bytes)
        detections = run_detection(original_array)
        heatmap_b64 = build_heatmap(original_array)
        sitrep = generate_sitrep(detections)

        # 🔹 NEW FEATURES
        sonar_b64 = generate_sonar(original_array)
        biolight_b64 = apply_bioluminescence(original_array)

        boxed = draw_detections(original_array.copy(), detections)
        _, buffer = cv2.imencode('.jpg', boxed)
        boxed_b64 = base64.b64encode(buffer).decode('utf-8')

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
        "detections": detections,
        "sitrep_text": sitrep,
        "transmission": tx_status,
        "system_status": {
            "detection": "ACTIVE",
            "enhancement": "ACTIVE",
            "threat_level": "MEDIUM" if detections else "LOW"
        }
    }