"""
pytest tests for the SUB-SENTINEL FastAPI backend.

Run:
    cd backend
    pytest tests/ -v
"""

import base64
import io
import os

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure we do NOT need a real GROQ_API_KEY for tests
os.environ.setdefault("GROQ_API_KEY", "")

from main import app  # noqa: E402 – import after env setup

client = TestClient(app)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_png_bytes(width: int = 64, height: int = 64, color=(30, 80, 120)) -> bytes:
    """Create a small solid-colour PNG in memory."""
    img = Image.new("RGB", (width, height), color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _assert_valid_image_base64(b64_str: str) -> None:
    """Assert that a string is a valid base64-encoded image data-URI."""
    assert b64_str.startswith("data:image/")
    raw = b64_str.split(",", 1)[1]
    decoded = base64.b64decode(raw)
    img = Image.open(io.BytesIO(decoded))
    assert img.size[0] > 0
    assert img.size[1] > 0


# ---------------------------------------------------------------------------
# /health
# ---------------------------------------------------------------------------


def test_health_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# /process – happy path
# ---------------------------------------------------------------------------


def test_process_returns_required_keys():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "enhanced_image_base64" in data
    assert "heatmap_base64" in data
    assert "sonar_base64" in data
    assert "biolight_base64" in data
    assert "boxed_image_base64" in data
    assert "detections" in data
    assert "sitrep_text" in data
    assert "transmission" in data


def test_process_enhanced_image_is_valid_base64():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    _assert_valid_image_base64(response.json()["enhanced_image_base64"])


def test_process_heatmap_is_valid_base64():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    _assert_valid_image_base64(response.json()["heatmap_base64"])


def test_process_detections_structure():
    """Each detection must have the required keys with correct types."""
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    detections = response.json()["detections"]
    assert isinstance(detections, list)
    for det in detections:
        assert "class" in det
        assert "mapped_label" in det
        assert "confidence" in det
        assert "bbox" in det
        assert isinstance(det["confidence"], float)
        assert len(det["bbox"]) == 4


def test_process_sitrep_is_string():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    sitrep = response.json()["sitrep_text"]
    assert isinstance(sitrep, str)
    assert len(sitrep) > 0


def test_process_sonar_is_valid_base64():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    _assert_valid_image_base64(response.json()["sonar_base64"])


def test_process_biolight_is_valid_base64():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    _assert_valid_image_base64(response.json()["biolight_base64"])


def test_process_boxed_image_is_valid_base64():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    _assert_valid_image_base64(response.json()["boxed_image_base64"])


def test_process_transmission_structure():
    png = _make_png_bytes()
    response = client.post(
        "/process",
        files={"file": ("test.png", png, "image/png")},
    )
    assert response.status_code == 200
    transmission = response.json()["transmission"]
    assert isinstance(transmission, dict)
    assert "mode" in transmission
    assert "compression" in transmission
    assert isinstance(transmission["mode"], str)
    assert isinstance(transmission["compression"], str)


# ---------------------------------------------------------------------------
# /process – error cases
# ---------------------------------------------------------------------------


def test_process_rejects_non_image():
    response = client.post(
        "/process",
        files={"file": ("data.txt", b"hello world", "text/plain")},
    )
    assert response.status_code == 400


def test_process_rejects_empty_file():
    response = client.post(
        "/process",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400


def test_process_jpeg_image():
    """Pipeline should work with JPEG input."""
    img = Image.new("RGB", (80, 80), (50, 100, 150))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    response = client.post(
        "/process",
        files={"file": ("test.jpg", buf.getvalue(), "image/jpeg")},
    )
    assert response.status_code == 200
    assert "enhanced_image_base64" in response.json()
