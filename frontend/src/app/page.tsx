"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

import { SonarLoader } from "@/components/SonarLoader";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { DetectionBadge } from "@/components/DetectionBadge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Detection {
  class: string;
  mapped_label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface ApiResponse {
  enhanced_image_base64: string;
  heatmap_base64: string;
  detections: Detection[];
  sitrep_text: string;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Home() {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // -------------------------------------------------------------------
  // Drag-and-drop upload handler
  // -------------------------------------------------------------------
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }

      // Show local preview immediately
      const preview = URL.createObjectURL(file);
      setOriginalPreview(preview);
      setResult(null);
      setShowHeatmap(false);
      setIsLoading(true);

      const toastId = toast.loading("Analysing image…");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${apiUrl}/process`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody?.detail ?? `Server error ${res.status}`);
        }

        const data: ApiResponse = await res.json();
        setResult(data);
        toast.success("Analysis complete.", { id: toastId });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`Pipeline failed: ${msg}`, { id: toastId });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  const displayImage = showHeatmap && result
    ? result.heatmap_base64
    : result?.enhanced_image_base64 ?? null;

  return (
    <main className="min-h-screen bg-panel text-gray-100 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Sonar icon */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border border-sonar-300 animate-sonar-sweep" />
            <div className="absolute inset-[6px] rounded-full bg-sonar-400" />
          </div>
          <span className="font-mono text-lg font-bold tracking-widest text-sonar-300 uppercase">
            Sub-Sentinel
          </span>
        </div>
        <span className="hidden sm:block text-xs text-gray-500 font-mono tracking-wider">
          Acoustic-Visual Forensics &amp; Threat Relay
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono text-threat-low animate-slow-pulse">● LIVE</span>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">

        {/* Left: upload + results */}
        <div className="lg:col-span-2 p-6 flex flex-col gap-6 border-r border-border">

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`
              relative cursor-pointer rounded-xl border-2 border-dashed transition-colors p-8 text-center
              ${isDragActive
                ? "border-sonar-300 bg-sonar-700/20"
                : "border-border hover:border-sonar-400 hover:bg-surface"
              }
            `}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-400 font-mono">
              {isDragActive
                ? "Release to analyse…"
                : "Drag & drop an underwater image, or click to select"}
            </p>
            <p className="mt-1 text-xs text-gray-600">PNG, JPEG, WEBP supported</p>
          </div>

          {/* Loading skeleton */}
          {isLoading && <SonarLoader />}

          {/* Before / After slider */}
          {!isLoading && originalPreview && displayImage && (
            <div className="rounded-xl overflow-hidden border border-border">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={originalPreview}
                    alt="Original"
                    style={{ objectFit: "cover" }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={displayImage}
                    alt={showHeatmap ? "Forensic Heatmap" : "Enhanced"}
                    style={{ objectFit: "cover" }}
                  />
                }
                style={{ height: 420 }}
              />
            </div>
          )}

          {/* Single original preview (no result yet, not loading) */}
          {!isLoading && originalPreview && !result && (
            <div className="rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalPreview} alt="Preview" className="w-full max-h-[420px] object-cover" />
            </div>
          )}

          {/* Controls */}
          {result && !isLoading && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHeatmap((v) => !v)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-mono font-semibold tracking-widest border transition-colors
                  ${showHeatmap
                    ? "bg-sonar-400 border-sonar-300 text-white"
                    : "bg-surface border-border text-gray-300 hover:border-sonar-400"
                  }
                `}
              >
                {showHeatmap ? "◉ HEATMAP ON" : "◎ HEATMAP OFF"}
              </button>
              <span className="text-xs text-gray-500 font-mono">
                {result.detections.length} contact(s) detected
              </span>
            </div>
          )}

          {/* Detections */}
          {result && result.detections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.detections.map((d, i) => (
                <DetectionBadge key={i} detection={d} />
              ))}
            </div>
          )}
        </div>

        {/* Right: SITREP telemetry panel */}
        <div className="p-6">
          <TelemetryPanel sitrep={result?.sitrep_text ?? null} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
