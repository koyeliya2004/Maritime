"""
SUB-SENTINEL backend – FastAPI application.

Endpoints:
  POST /process   – accepts an image upload and returns:
    {
      enhanced_image_base64 : str,
      heatmap_base64        : str,
      detections            : [{class, mapped_label, confidence, bbox:[x1,y1,x2,y2]}],
      sitrep_text           : str
    }
"""

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
    version="1.0.0",
)

# CORS – allow Vercel production domain + localhost development
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
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict:
    """Liveness probe."""
    return {"status": "ok"}


@app.post("/process")
async def process_image(file: UploadFile = File(...)) -> dict:
    """
    Accept an image upload and run the full forensic pipeline:
      1. Underwater image enhancement (FUnIE-GAN fallback → CLAHE)
      2. YOLOv8n object detection with maritime label mapping
      3. SSIM-based forensic heatmap generation
      4. Groq SITREP generation
    """
    # Validate content type
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
        enhanced_b64, original_array = enhance_image(raw_bytes)
        detections = run_detection(original_array)
        heatmap_b64 = build_heatmap(original_array)
        sitrep = generate_sitrep(detections)
    except Exception as exc:
        logger.exception("Pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Processing pipeline failed: {exc}")

    return {
        "enhanced_image_base64": enhanced_b64,
        "heatmap_base64": heatmap_b64,
        "detections": detections,
        "sitrep_text": sitrep,
    }
