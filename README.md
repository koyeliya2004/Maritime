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
