---
license: apache-2.0
title: SUB-SENTINEL
sdk: docker
emoji: 🌍
colorFrom: indigo
colorTo: blue
short_description: Acoustic-Visual Forensics & Threat Relay
---

# SUB-SENTINEL: Acoustic-Visual Forensics & Threat Relay

A production-ready monorepo for underwater acoustic-visual forensics and threat detection.

```
Maritime/
├── backend/      # FastAPI – deployed to Hugging Face Spaces
├── frontend/     # Next.js + Tailwind – deployed to Vercel
└── .github/
    └── workflows/
        └── sync_to_hf.yml   # Pushes ONLY /backend to HF Space
```

---

## Quick Start

### Backend (local)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (local)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

### Run backend tests

```bash
cd backend
pytest tests/ -v
```

---

## Required Secrets

Set these in your GitHub repository **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `HF_TOKEN` | Hugging Face write token (from https://huggingface.co/settings/tokens) |
| `HF_SPACE` | HF Space repo ID, e.g. `your-username/sub-sentinel` |

Set this in your **Vercel** project environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Full URL of your HF Space API, e.g. `https://your-username-sub-sentinel.hf.space` |

---

## Deployment

### Hugging Face Spaces (backend)

The GitHub Actions workflow (`.github/workflows/sync_to_hf.yml`) automatically pushes the `/backend` directory to your HF Space on every push to `main`. The Space must be set to **Docker** SDK and will listen on port **7860**.

### Vercel (frontend)

1. Import the `frontend/` directory (or the full repo with root set to `frontend/`) into Vercel.
2. Add `NEXT_PUBLIC_API_URL` to your Vercel project's environment variables.
3. Deploy.

---

## Forensic Tools

### Overview

The `tools/` and `ui/overlays/` directories provide lightweight forensic capabilities:

| File | Purpose |
|------|---------|
| `ui/overlays/forensic-overlay.html` | Self-contained HUD overlay (timestamp, GPS, depth, REC, threat badge, contact count) |
| `tools/frame_hash.py` | SHA-256 chain-of-custody hashing for saved frames; writes `.meta.json` |
| `tools/sitrep.js` | Compact SITREP JSON generator for acoustic-modem transmission |
| `tools/test_evidence.sh` | Dry-run CI/local validation of the hashing + SITREP pipeline |

---

### Running the test script

```bash
bash tools/test_evidence.sh
```

Expected output:
- `evidence/sample_frame.jpg` — copy of the test frame
- `evidence/sample_frame.jpg.meta.json` — canonical metadata including `sha256`
- SITREP JSON printed to stdout; byte length confirmed `< 1024`

---

### Including the overlay in the frontend

The overlay is framework-agnostic HTML/CSS/JS. Drop it in as an `<iframe>` or inline it
alongside your video element. A small `window.forensicOverlay` API lets the detection
pipeline push live data:

```js
// After loading the overlay (iframe or inline)
const ov = window.forensicOverlay;   // or contentWindow.forensicOverlay for iframe

// Called by the detection pipeline on each frame
ov.setGPS({ lat: 1.2345, lon: 103.9876 });
ov.setDepth(42);          // metres
ov.setThreat('HIGH');     // LOW | MEDIUM | HIGH | CRITICAL
ov.setContacts(3);        // number of tracked contacts
ov.setRecording(true);    // toggle REC indicator
```

To convert to React/Vue, wrap the logic inside a component and bind `state` to
component state; the `render()` function becomes the JSX/template.

---

### Evidence package contents

After processing a frame the evidence directory contains:

```
evidence/
├── <frame>.jpg            # original captured frame
├── <frame>.jpg.meta.json  # canonical metadata + SHA-256 digest
```

The `.meta.json` structure:

```json
{
  "captured_utc": "2026-03-01T21:42:00+00:00",
  "depth_m": 42,
  "file": "frame_001.jpg",
  "lat": 1.234567,
  "lon": 103.987654,
  "sha256": "<hex-digest>"
}
```

The SHA-256 digest covers **image bytes ∥ canonical JSON metadata** (sorted keys,
no whitespace), ensuring any tampering of either the image or the metadata is
detectable.

---

### Generating a SITREP

```bash
# From a JSON file
node tools/sitrep.js contact.json

# Inline JSON
node tools/sitrep.js '{"id":"C01","type":"sub","lat":1.23,"lon":103.98,"depth_m":50,"bearing_deg":270,"threat":"HIGH","confidence":0.91}'
```

In Node.js / the backend:

```js
const { makeSitrep } = require('./tools/sitrep');
const json = makeSitrep({
  id: 'C01', type: 'sub',
  lat: 1.23, lon: 103.98,
  depth_m: 50, bearing_deg: 270,
  threat: 'HIGH', confidence: 0.91,
});
// Transmit json over acoustic modem
```

---

## API Response Schema

```json
{
  "enhanced_image_base64": "<base64-string>",
  "heatmap_base64": "<base64-string>",
  "sonar_base64": "<base64-string>",
  "biolight_base64": "<base64-string>",
  "boxed_image_base64": "<base64-string>",
  "detections": [
    {
      "class": "person",
      "mapped_label": "Diver/Swimmer",
      "confidence": 0.87,
      "bbox": [x1, y1, x2, y2]
    }
  ],
  "sitrep_text": "<Groq-generated situational report>",
  "transmission": {
    "mode": "AES-256 ENCRYPTED BURST",
    "compression": "ZSTD-3 ADAPTIVE"
  }
}
```
