"use client";

interface Detection {
  class: string;
  mapped_label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

/**
 * DetectionBadge – displays a single detected object with its mapped label,
 * confidence, and bounding-box coordinates.
 */
export function DetectionBadge({ detection }: { detection: Detection }) {
  const { mapped_label, confidence, bbox } = detection;
  const [x1, y1, x2, y2] = bbox;

  // Colour-code by confidence
  const confidenceColor =
    confidence >= 0.75
      ? "border-threat-high text-threat-high"
      : confidence >= 0.5
      ? "border-threat-mid text-threat-mid"
      : "border-threat-low text-threat-low";

  return (
    <div
      className={`
        flex flex-col gap-0.5 px-3 py-2 rounded-lg border bg-surface text-xs font-mono
        ${confidenceColor}
      `}
    >
      <span className="font-bold tracking-wide uppercase">{mapped_label}</span>
      <span className="text-gray-400">
        {(confidence * 100).toFixed(1)}% conf
      </span>
      <span className="text-gray-600 text-[10px]">
        [{x1},{y1}]→[{x2},{y2}]
      </span>
    </div>
  );
}
