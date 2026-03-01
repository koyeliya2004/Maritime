# processing.py
"""
SUB-SENTINEL processing pipeline (Groq-first, Ultralytics fallback).

Exports:
  enhance_image(raw_bytes) -> (base64_str, np.ndarray)
  run_detection(rgb, sonar_data=None, conf_thresh=0.40) -> list[dict]
  build_heatmap(rgb) -> base64_str
  fuse_sonar_overlay(rgb, sonar_data) -> base64_str
  generate_vector_sketch(detections) -> str (base64 zlib JSON)

Environment:
  DETECTION_BACKEND = "groq" | "ultralytics" | "auto"  (default "auto")
  DETECTION_MODEL   = path to model / compiled groq artifact or ultralytics model id (default "yolov8m.pt")
  GROQ_API_KEY      = optional API key for Groq LLM (if you want LLM postprocessing)
"""
import os
import io
import json
import zlib
import base64
import logging
from typing import Optional, List, Dict, Any

import cv2
import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity as ssim

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

# Config
DEFAULT_DETECTION_MODEL = os.getenv("DETECTION_MODEL", "yolov8m.pt")
DETECTION_BACKEND = os.getenv("DETECTION_BACKEND", "auto").lower()  # "groq", "ultralytics", "auto"
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("groq")  # read common variants

# Maritime label mapping (COCO -> maritime)
_LABEL_MAP: Dict[str, str] = {
    "person": "Diver/Swimmer",
    "boat": "Surface/Sub Threat",
    "ship": "Surface/Sub Threat",
    "submarine": "Surface/Sub Threat",
    "surfboard": "Surface/Sub Threat",
    # extend as needed
}

# --------------------------- utilities -------------------------------------
def _array_to_base64(img_array: np.ndarray, fmt: str = "PNG") -> str:
    pil_img = Image.fromarray(img_array.astype(np.uint8))
    buf = io.BytesIO()
    fmt_upper = fmt.upper()
    pil_img.save(buf, format=fmt_upper, quality=90)
    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
    mime = "image/png" if fmt_upper == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{encoded}"


def _bytes_to_array(raw_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(raw_bytes, np.uint8)
    bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("OpenCV could not decode the image.")
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)


def _ensure_int_box(box: List[float]) -> List[int]:
    return [int(round(v)) for v in box]


# ------------------------ enhancement engines -------------------------------
def _clahe_enhance(rgb: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l = clahe.apply(l)
    a = np.clip(a.astype(np.int16) - 5, 0, 255).astype(np.uint8)
    b = np.clip(b.astype(np.int16) + 10, 0, 255).astype(np.uint8)
    merged = cv2.merge([l, a, b])
    return cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)


def _funiegan_enhance(rgb: np.ndarray) -> Optional[np.ndarray]:
    weights_path = "weights/funiegan.onnx"
    if not os.path.exists(weights_path):
        return None
    try:
        net = cv2.dnn.readNetFromONNX(weights_path)
        h, w = rgb.shape[:2]
        resized = cv2.resize(rgb, (256, 256)).astype(np.float32) / 127.5 - 1.0
        blob = cv2.dnn.blobFromImage(resized)
        net.setInput(blob)
        out = net.forward()
        out_img = ((out[0].transpose(1, 2, 0) + 1.0) * 127.5).clip(0, 255).astype(np.uint8)
        return cv2.resize(out_img, (w, h))
    except Exception as exc:
        logger.warning("FUnIE-GAN inference failed (%s); falling back.", exc)
        return None


def enhance_image(raw_bytes: bytes, prefer_funiegan: bool = True) -> tuple[str, np.ndarray]:
    rgb = _bytes_to_array(raw_bytes)
    enhanced = None
    if prefer_funiegan:
        enhanced = _funiegan_enhance(rgb)
    if enhanced is None:
        enhanced = _clahe_enhance(rgb)
    return _array_to_base64(enhanced, fmt="JPEG"), rgb


# ------------------------- forensic heatmap --------------------------------
def build_heatmap(rgb: np.ndarray) -> str:
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (15, 15), 0)
    try:
        _, ssim_map = ssim(gray, blurred, full=True, data_range=255)
    except Exception:
        diff = cv2.absdiff(gray, blurred).astype(np.float32) / 255.0
        ssim_map = 1.0 - diff
    ssim_norm = ((ssim_map + 1.0) / 2.0 * 255.0).clip(0, 255).astype(np.uint8)
    colormap = cv2.COLORMAP_RdYlGn if hasattr(cv2, "COLORMAP_RdYlGn") else cv2.COLORMAP_JET
    heatmap_bgr = cv2.applyColorMap(ssim_norm, colormap)
    rgb_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(rgb_bgr, 0.55, heatmap_bgr, 0.45, 0)
    overlay_rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
    return _array_to_base64(overlay_rgb, fmt="PNG")


# ------------------------- detection helpers --------------------------------
def _local_texture_authenticity(patch: np.ndarray) -> float:
    if patch is None or patch.size == 0:
        return 0.0
    gray = cv2.cvtColor(patch, cv2.COLOR_RGB2GRAY) if patch.ndim == 3 else patch
    var = cv2.Laplacian(gray, cv2.CV_64F).var()
    norm = (var - 10.0) / (200.0 - 10.0)
    return float(np.clip(norm, 0.0, 1.0))


# ---------------------- Groq runtime backend (placeholder) ------------------
def _run_detection_groq(rgb: np.ndarray, compiled_model_path: str, conf_thresh: float) -> List[Dict[str, Any]]:
    """
    Placeholder Groq runner. Replace with your project's Groq runtime/SDK calls.

    Recommended flow:
      - import the Groq runtime installed in your environment (API differs by Groq release)
      - load compiled artifact or use a long-lived runner
      - prepare input (resize / normalize) exactly as the compiled model expects
      - run inference and parse outputs into COCO-like detections:
            [ {"class": "person", "conf": 0.82, "bbox":[x1,y1,x2,y2]}, ... ]
    If Groq runtime isn't installed, this function raises and the pipeline will fallback.
    """
    # Try to import a Groq runtime package (NAME VARIES). This is intentionally guarded.
    try:
        # Example placeholder import; replace with your runtime import
        import groq_runtime  # <<-- REPLACE with actual Groq runtime package for your compiled model
    except Exception as exc:
        raise RuntimeError("Groq runtime not installed") from exc

    # PSEUDOCODE (replace with your actual runtime usage):
    try:
        # runner = groq_runtime.Runner(compiled_model_path)
        # model_input = cv2.resize(rgb, (MODEL_W, MODEL_H)).astype(np.float32) / 255.0
        # batch = np.expand_dims(model_input, axis=0)
        # outputs = runner.run(batch)
        # parse outputs -> parsed_detections
        parsed_detections: List[Dict[str, Any]] = []
        # -----> Replace the pseudocode above with real runtime calls and parsing
        return parsed_detections
    except Exception as exc:
        raise RuntimeError("Groq model execution failed") from exc


# -------------------- Groq LLM refinement (optional) ------------------------
def refine_with_groq_llm(detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    (Optional) Use a Groq LLM to refine/correct YOLO outputs (label mapping, merge boxes, etc.)
    This function is intentionally conservative: if no GROQ_API_KEY or client, it returns original detections.

    To enable: install the Groq client/SDK for LLM usage and replace the body below
    with a real call. Keep the function robust: always return a list of detections.
    """
    if not GROQ_API_KEY or not detections:
        return detections

    # >>> EXAMPLE (COMMENTED) - Replace with your Groq LLM client usage <<<
    # try:
    #     import groq
    #     client = groq.Client(api_key=GROQ_API_KEY)
    #     prompt = "You are a maritime analyst. Given these detections (JSON), correct labels and return JSON list."
    #     response = client.chat.completions.create(
    #         model="llama-3-small", messages=[{"role":"user","content":prompt + json.dumps(detections)}], temperature=0.2
    #     )
    #     refined = json.loads(response.choices[0].message.content)
    #     return refined
    # except Exception as e:
    #     logger.warning("Groq LLM refine failed: %s", e)
    #     return detections

    # By default, return unchanged (safe!)
    return detections


# ------------------------- unified detection (Groq -> Ultralytics) ----------
def run_detection(rgb: np.ndarray,
                  sonar_data: Optional[Dict[str, Any]] = None,
                  conf_thresh: float = 0.40,
                  allowed_only: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Try configured backend(s) and return enriched detection dicts:
      {
        "class": str,
        "mapped_label": str,
        "confidence": float,
        "forensic_confidence": "HIGH|MEDIUM|LOW",
        "bbox": [x1,y1,x2,y2],
        "hallucinated": bool
      }
    """
    allowed = set(allowed_only) if allowed_only else set(_LABEL_MAP.keys())
    backend_choice = DETECTION_BACKEND
    model_path = os.getenv("DETECTION_MODEL", DEFAULT_DETECTION_MODEL)

    # 1) Try Groq compiled runtime if requested or auto
    if backend_choice in ("groq", "auto"):
        try:
            groq_dets = _run_detection_groq(rgb, model_path, conf_thresh)
            if groq_dets:
                enriched: List[Dict[str, Any]] = []
                h, w = rgb.shape[:2]
                for d in groq_dets:
                    cls_name = d.get("class", "unknown")
                    conf = float(d.get("conf", 0.0))
                    if conf < conf_thresh or cls_name not in allowed:
                        continue
                    x1, y1, x2, y2 = _ensure_int_box(d.get("bbox", [0, 0, 0, 0]))
                    patch = rgb[y1:y2, x1:x2] if y2 > y1 and x2 > x1 else None
                    texture = _local_texture_authenticity(patch)
                    combined = 0.6 * conf + 0.4 * texture
                    forensic = "HIGH" if combined > 0.75 else "MEDIUM" if combined > 0.55 else "LOW"
                    hallucinated = (conf > 0.6 and texture < 0.25)
                    enriched.append({
                        "class": cls_name,
                        "mapped_label": _LABEL_MAP.get(cls_name, cls_name),
                        "confidence": round(conf, 4),
                        "forensic_confidence": forensic,
                        "bbox": [x1, y1, x2, y2],
                        "hallucinated": hallucinated,
                    })
                if enriched:
                    # Optional LLM refine step (won't run unless GROQ_API_KEY & client wired)
                    return refine_with_groq_llm(enriched)
        except Exception as exc:
            logger.info("Groq backend not used: %s", exc)

    # 2) Fallback to Ultralytics (YOLO)
    try:
        from ultralytics import YOLO  # type: ignore
    except Exception as exc:
        logger.warning("ultralytics not available (%s); detection disabled.", exc)
        return []

    try:
        model = YOLO(model_path)
        results = model(rgb, verbose=False)
    except Exception as exc:
        logger.warning("Ultralytics model load/inference failed (%s).", exc)
        return []

    detections: List[Dict[str, Any]] = []
    h, w = rgb.shape[:2]
    for result in results:
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            continue
        for box in boxes:
            try:
                conf = float(box.conf[0]) if hasattr(box.conf, "__len__") else float(box.conf)
                if conf < conf_thresh:
                    continue
                cls_id = int(box.cls[0]) if hasattr(box.cls, "__len__") else int(box.cls)
                cls_name = model.names.get(cls_id, str(cls_id)) if hasattr(model, "names") else str(cls_id)
                xyxy = box.xyxy[0] if hasattr(box.xyxy, "__len__") and len(box.xyxy) > 0 else None
                if xyxy is None:
                    continue
                x1, y1, x2, y2 = (int(round(float(v))) for v in xyxy)
                if cls_name not in allowed:
                    continue
                patch = rgb[y1:y2, x1:x2] if y2 > y1 and x2 > x1 else None
                texture_score = _local_texture_authenticity(patch)
                combined = 0.6 * conf + 0.4 * texture_score
                forensic = "HIGH" if combined > 0.75 else "MEDIUM" if combined > 0.55 else "LOW"
                hallucinated = (conf > 0.6 and texture_score < 0.25)
                detections.append({
                    "class": cls_name,
                    "mapped_label": _LABEL_MAP.get(cls_name, cls_name),
                    "confidence": round(conf, 4),
                    "forensic_confidence": forensic,
                    "bbox": [x1, y1, x2, y2],
                    "hallucinated": hallucinated,
                })
            except Exception as exc:
                logger.debug("Skipping a box due to error: %s", exc)
                continue

    # Optional LLM refinement (no-op unless you wire in GROQ LLM client)
    detections = refine_with_groq_llm(detections)

    # Sonar-guided hallucination placeholders when no vision detections
    if sonar_data and not detections:
        contours = sonar_data.get("contours", [])
        for c in contours:
            pts = []
            for nx, ny in c:
                px = int(np.clip(nx, 0.0, 1.0) * w)
                py = int(np.clip(ny, 0.0, 1.0) * h)
                pts.append([px, py])
            if len(pts) < 3:
                continue
            pts_np = np.array(pts, dtype=np.int32)
            x, y, ww, hh = cv2.boundingRect(pts_np)
            detections.append({
                "class": "sonar_contact",
                "mapped_label": "Sonar Contact (hallucinated)",
                "confidence": 0.0,
                "forensic_confidence": "LOW",
                "bbox": [int(x), int(y), int(x + ww), int(y + hh)],
                "hallucinated": True,
                "sonar_polygon": pts,
            })

    return detections


# -------------------- whisper-link / vector sketch --------------------------
def generate_vector_sketch(detections: List[Dict[str, Any]], max_bytes: int = 1024) -> str:
    sketch = {"detections": []}
    for d in detections:
        x1, y1, x2, y2 = d.get("bbox", [0, 0, 0, 0])
        w = max(1, x2 - x1)
        h = max(1, y2 - y1)
        cx = x1 + w / 2.0
        cy = y1 + h / 2.0
        sketch["detections"].append({
            "label": d.get("mapped_label", d.get("class")),
            "conf": float(d.get("confidence", 0.0)),
            "center": [float(cx), float(cy)],
            "size": [float(w), float(h)],
            "hallucinated": bool(d.get("hallucinated", False)),
        })
    raw = json.dumps(sketch, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    compressed = zlib.compress(raw, level=9)
    if len(compressed) > max_bytes:
        summary = {"summary": [{"label": x["label"], "conf": x["conf"]} for x in sketch["detections"]]}
        compressed = zlib.compress(json.dumps(summary, separators=(",", ":")).encode("utf-8"), level=9)
    return base64.b64encode(compressed).decode("utf-8")


# --------------------- sonar overlay / wireframe ---------------------------
def fuse_sonar_overlay(rgb: np.ndarray, sonar_data: Dict[str, Any]) -> str:
    h, w = rgb.shape[:2]
    canvas = rgb.copy()

    center = (w // 2, h // 2)

    # Radar circles
    for r in range(50, min(center), 60):
        cv2.circle(canvas, center, r, (0, 255, 0), 1)

    # Sweep line
    cv2.line(canvas, center, (w, h//2), (0, 255, 0), 2)

    # Keep original contour logic also
    if sonar_data:
        contours = sonar_data.get("contours", [])
        for c in contours:
            pts = []
            for nx, ny in c:
                px = int(np.clip(nx, 0.0, 1.0) * (w - 1))
                py = int(np.clip(ny, 0.0, 1.0) * (h - 1))
                pts.append([px, py])

            if len(pts) >= 2:
                pts_np = np.array(pts, dtype=np.int32)
                cv2.polylines(canvas, [pts_np], True, (0, 255, 255), 2)

    return _array_to_base64(canvas, fmt="PNG")

# --------------------------- SITREP helper ---------------------------------
# ===================== 🔥 NEW VISUAL FEATURES ==============================

def draw_detection_boxes(rgb: np.ndarray, detections: List[Dict[str, Any]]) -> str:
    """
    Draw bounding boxes on image (for frontend display)
    """
    img = rgb.copy()

    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        label = f"{det['mapped_label']} {int(det['confidence']*100)}%"

        # Box
        cv2.rectangle(img, (x1, y1), (x2, y2), (255, 50, 50), 2)

        # Text
        cv2.putText(
            img,
            label,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 50, 50),
            2
        )

    return _array_to_base64(img, fmt="JPEG")


def generate_bioluminescence(rgb: np.ndarray) -> str:
    """
    Underwater glowing effect
    """
    glow = cv2.GaussianBlur(rgb, (0, 0), 20)

    tint = np.zeros_like(rgb)
    tint[:, :, 1] = 80   # green
    tint[:, :, 2] = 120  # blue

    combined = cv2.addWeighted(rgb, 0.6, glow, 0.7, 0)
    final = cv2.addWeighted(combined, 0.8, tint, 0.2, 0)

    return _array_to_base64(final, fmt="JPEG")
    
def detections_to_sitrep_txt(detections: List[Dict[str, Any]]) -> str:
    if not detections:
        return ("SITUATION: Sensor sweep complete – no contacts.\n"
                "ASSESSMENT: Area clear.\n"
                "RECOMMENDATION: Continue routine patrol.")
    labels = ", ".join({d["mapped_label"] for d in detections})
    count = len(detections)
    return (f"SITUATION: {count} contact(s) detected – {labels}.\n"
            "ASSESSMENT: Requires manual review (forensic confidence noted).\n"
            "RECOMMENDATION: Dispatch response team and maintain sensor lock.")


__all__ = [
    "enhance_image",
    "run_detection",
    "build_heatmap",
    "fuse_sonar_overlay",
    "generate_vector_sketch",
    "detections_to_sitrep_txt",
    "draw_detection_boxes",
    "generate_bioluminescence",
]