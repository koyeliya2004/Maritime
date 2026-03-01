"""
tools/frame_hash.py
───────────────────
Compute a SHA-256 chain-of-custody digest for a saved video frame and write
a canonical .meta.json file into an evidence directory.

Usage (CLI):
    python tools/frame_hash.py <frame_path> [--meta key=value ...] [--evidence-dir evidence]

Usage (library):
    from tools.frame_hash import save_evidence
    digest = save_evidence("frames/frame_001.jpg", {"lat": 1.23, "lon": 4.56})
"""

import argparse
import hashlib
import json
import os
import shutil
import sys
from datetime import datetime, timezone


def _canonical_metadata(frame_path: str, extra: dict) -> dict:
    """Build the canonical metadata dict (sorted keys for deterministic JSON)."""
    return dict(sorted({
        "file": os.path.basename(frame_path),
        "captured_utc": extra.get("captured_utc", datetime.now(timezone.utc).isoformat()),
        **{k: v for k, v in extra.items() if k != "captured_utc"},
    }.items()))


def compute_digest(frame_path: str, metadata: dict) -> str:
    """
    Return the SHA-256 hex digest of:
        image bytes  ||  canonical JSON metadata (UTF-8, sorted keys)
    """
    h = hashlib.sha256()
    with open(frame_path, "rb") as fh:
        h.update(fh.read())
    meta_bytes = json.dumps(metadata, sort_keys=True, separators=(",", ":")).encode()
    h.update(meta_bytes)
    return h.hexdigest()


def save_evidence(frame_path: str, metadata: dict, evidence_dir: str = "evidence") -> str:
    """
    Copy *frame_path* into *evidence_dir*, compute the SHA-256 digest, and write
    a <basename>.meta.json file alongside it.

    Returns the hex digest string.
    """
    os.makedirs(evidence_dir, exist_ok=True)

    basename = os.path.basename(frame_path)
    dest_frame = os.path.join(evidence_dir, basename)

    # Copy the original frame into the evidence directory (idempotent if same path)
    if os.path.abspath(frame_path) != os.path.abspath(dest_frame):
        shutil.copy2(frame_path, dest_frame)

    canonical = _canonical_metadata(frame_path, metadata)
    digest = compute_digest(dest_frame, canonical)

    meta = {
        **canonical,
        "sha256": digest,
    }

    meta_path = dest_frame + ".meta.json"
    with open(meta_path, "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, sort_keys=True)
        fh.write("\n")

    return digest


# ── CLI ────────────────────────────────────────────────────────────────────────

def _parse_kv(pairs):
    out = {}
    for pair in pairs:
        k, _, v = pair.partition("=")
        # Try to coerce to number
        try:
            v = int(v)
        except ValueError:
            try:
                v = float(v)
            except ValueError:
                pass
        out[k.strip()] = v
    return out


def main():
    parser = argparse.ArgumentParser(
        description="Hash a video frame and write chain-of-custody metadata."
    )
    parser.add_argument("frame", help="Path to the frame image file")
    parser.add_argument(
        "--meta", nargs="*", default=[], metavar="key=value",
        help="Extra metadata fields (e.g. lat=1.23 lon=4.56 depth_m=10)",
    )
    parser.add_argument(
        "--evidence-dir", default="evidence",
        help="Directory to store evidence files (default: evidence)",
    )
    args = parser.parse_args()

    extra = _parse_kv(args.meta)
    digest = save_evidence(args.frame, extra, args.evidence_dir)

    basename = os.path.basename(args.frame)
    meta_path = os.path.join(args.evidence_dir, basename + ".meta.json")
    print(f"sha256  : {digest}")
    print(f"meta    : {meta_path}")


if __name__ == "__main__":
    main()
