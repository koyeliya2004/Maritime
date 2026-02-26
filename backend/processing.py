"""
Image processing pipeline for SUB-SENTINEL.

Provides three functions:
  enhance_image(raw_bytes)        → (base64_str, numpy_array)
  run_detection(image_array)      → list[dict]
  build_heatmap(image_array)      → base64_str

All heavy-weight model paths gracefully fall back to CPU-friendly alternatives
when model weights are absent.
"""

import base64
import io
import logging
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Maritime label mapping for YOLOv8 COCO classes
# ---------------------------------------------------------------------------
_LABEL_MAP: dict[str, str] = {
    "person": "Diver/Swimmer",
    "boat": "Surface/Sub Threat",
    "ship": "Surface/Sub Threat",
    "submarine": "Surface/Sub Threat",
    "surfboard": "Surface/Sub Threat",
    # extend as needed
}


def _array_to_base64(img_array: np.ndarray, fmt: str = "JPEG") -> str:
    """Convert a uint8 numpy array (H×W×C, RGB) to a base-64 data-URI string."""
    pil_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    pil_img.save(buf, format=fmt, quality=90)
    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
    mime = "image/jpeg" if fmt == "JPEG" else "image/png"
    return f"data:{mime};base64,{encoded}"


def _bytes_to_array(raw_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes to a uint8 RGB numpy array."""
    nparr = np.frombuffer(raw_bytes, np.uint8)
    bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("OpenCV could not decode the image.")
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)


# ---------------------------------------------------------------------------
# 1. Underwater image enhancement
# ---------------------------------------------------------------------------


def _clahe_enhance(rgb: np.ndarray) -> np.ndarray:
    """
    CPU-friendly underwater enhancement using CLAHE on LAB colour space.
    Used when FUnIE-GAN weights are unavailable.
    """
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    # Slight blue-green colour correction typical for underwater footage
    a_channel = np.clip(a_channel.astype(np.int16) - 5, 0, 255).astype(np.uint8)
    b_channel = np.clip(b_channel.astype(np.int16) + 10, 0, 255).astype(np.uint8)
    enhanced_lab = cv2.merge([l_channel, a_channel, b_channel])
    return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)


def _funiegan_enhance(rgb: np.ndarray) -> Optional[np.ndarray]:
    """
    Attempt FUnIE-GAN inference via a local ONNX weight file.
    Returns None if weights are missing so the caller can fall back.
    """
    weights_path = "weights/funiegan.onnx"
    try:
        import os
        if not os.path.exists(weights_path):
            return None
        net = cv2.dnn.readNetFromONNX(weights_path)
        h, w = rgb.shape[:2]
        target_h, target_w = 256, 256
        resized = cv2.resize(rgb, (target_w, target_h)).astype(np.float32) / 127.5 - 1.0
        blob = cv2.dnn.blobFromImage(resized)
        net.setInput(blob)
        out = net.forward()
        out_img = ((out[0].transpose(1, 2, 0) + 1.0) * 127.5).clip(0, 255).astype(np.uint8)
        return cv2.resize(out_img, (w, h))
    except Exception as exc:
        logger.warning("FUnIE-GAN inference failed (%s); using CLAHE fallback.", exc)
        return None


def enhance_image(raw_bytes: bytes) -> tuple[str, np.ndarray]:
    """
    Enhance an underwater image.

    Returns:
        (base64_enhanced, original_rgb_array)
    The original array is returned unchanged for use in downstream steps.
    """
    rgb = _bytes_to_array(raw_bytes)
    enhanced = _funiegan_enhance(rgb)
    if enhanced is None:
        enhanced = _clahe_enhance(rgb)
    return _array_to_base64(enhanced), rgb


# ---------------------------------------------------------------------------
# 2. Object detection (YOLOv8n)
# ---------------------------------------------------------------------------


def run_detection(rgb: np.ndarray) -> list[dict]:
    """
    Run YOLOv8n COCO detection and map labels to maritime terminology.

    Returns a list of detection dicts:
      {class, mapped_label, confidence, bbox: [x1, y1, x2, y2]}
    """
    try:
        from ultralytics import YOLO  # lazy import – large package
        model = YOLO("yolov8n.pt")    # downloads automatically on first run
        results = model(rgb, verbose=False)
    except Exception as exc:
        logger.warning("YOLOv8n detection failed (%s); returning empty detections.", exc)
        return []

    detections = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names.get(cls_id, str(cls_id))
            conf = float(box.conf[0])
            x1, y1, x2, y2 = (float(v) for v in box.xyxy[0])
            detections.append(
                {
                    "class": cls_name,
                    "mapped_label": _LABEL_MAP.get(cls_name, cls_name),
                    "confidence": round(conf, 4),
                    "bbox": [round(x1), round(y1), round(x2), round(y2)],
                }
            )
    return detections


# ---------------------------------------------------------------------------
# 3. SSIM-based forensic heatmap
# ---------------------------------------------------------------------------


def build_heatmap(rgb: np.ndarray) -> str:
    """
    Generate a forensic heatmap by comparing the original image against a
    Gaussian-blurred reference.  High SSIM → green; low SSIM → red.

    Returns a base64-encoded PNG heatmap.
    """
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    # Reference: gently blurred version of the same frame
    blurred = cv2.GaussianBlur(gray, (15, 15), 0)

    # Compute SSIM score map (window-level scores)
    _, ssim_map = ssim(gray, blurred, full=True, data_range=255)

    # Normalise to [0, 255]
    ssim_norm = ((ssim_map + 1.0) / 2.0 * 255).clip(0, 255).astype(np.uint8)

    # Map to BGR: low similarity → red (forensic interest), high → green
    heatmap_bgr = cv2.applyColorMap(ssim_norm, cv2.COLORMAP_RdYlGn if hasattr(cv2, "COLORMAP_RdYlGn") else cv2.COLORMAP_JET)

    # Blend with original for context
    rgb_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(rgb_bgr, 0.55, heatmap_bgr, 0.45, 0)
    overlay_rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)

    return _array_to_base64(overlay_rgb, fmt="PNG")
