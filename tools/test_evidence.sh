#!/usr/bin/env bash
# tools/test_evidence.sh
# ──────────────────────
# Dry-run validation of frame_hash.py + sitrep.js.
# Produces:
#   evidence/sample_frame.jpg
#   evidence/sample_frame.jpg.meta.json  (contains sha256)
#   SITREP JSON printed to stdout with byte-length < 1024
#
# Usage:
#   bash tools/test_evidence.sh
#
# Requirements: python3, node

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
EVIDENCE_DIR="$REPO_ROOT/evidence"
SAMPLE_FRAME="$EVIDENCE_DIR/sample_frame.jpg"

echo "=== SUB-SENTINEL Forensic Evidence Dry-Run ==="
echo ""

# ── 1. Create a minimal JPEG test image ──────────────────────────────────────
mkdir -p "$EVIDENCE_DIR"

# Minimal valid JPEG (SOI + APP0 JFIF marker + EOI, ~22 bytes) via Python
python3 -c "
import os, sys
dest = sys.argv[1]
with open(dest, 'wb') as f:
    f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9')
print('[setup] Sample frame written:', dest, '(22 bytes)')
" "$SAMPLE_FRAME"

echo ""

# ── 2. Hash the frame ─────────────────────────────────────────────────────────
echo "--- frame_hash.py ---"
python3 "$SCRIPT_DIR/frame_hash.py" "$SAMPLE_FRAME" \
  --meta lat=1.234567 lon=103.987654 depth_m=42 \
  --evidence-dir "$EVIDENCE_DIR"

echo ""
echo "Meta file contents:"
cat "$EVIDENCE_DIR/sample_frame.jpg.meta.json"
echo ""

# ── 3. Generate SITREP ────────────────────────────────────────────────────────
echo "--- sitrep.js ---"
CONTACT_JSON='{"id":"C01","type":"sub","lat":1.234567,"lon":103.987654,"depth_m":42,"bearing_deg":270,"threat":"HIGH","confidence":0.91}'
SITREP=$(node "$SCRIPT_DIR/sitrep.js" "$CONTACT_JSON" 2>/dev/null)
SITREP_BYTES=$(printf '%s' "$SITREP" | wc -c)

echo "SITREP  : $SITREP"
echo "Bytes   : $SITREP_BYTES"

if [ "$SITREP_BYTES" -lt 1024 ]; then
  echo "✓ SITREP is under 1 KB ($SITREP_BYTES bytes)"
else
  echo "✗ SITREP exceeds 1 KB limit ($SITREP_BYTES bytes)" >&2
  exit 1
fi

echo ""
echo "=== Evidence package ==="
ls -lh "$EVIDENCE_DIR/"
echo ""
echo "=== Dry-run complete ==="
