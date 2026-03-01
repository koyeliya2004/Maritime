"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import Link from "next/link";

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
  sonar_base64: string;
  biolight_base64: string;
  boxed_image_base64: string;
  detections: Detection[];
  sitrep_text: string;
  transmission: {
    mode: string;
    compression: string;
  };
}

// ---------------------------------------------------------------------------
// Mode metadata
// ---------------------------------------------------------------------------

const MODE_META: Record<string, { icon: string; label: string; description: string }> = {
  normal:  { icon: "🎯", label: "NORMAL",  description: "Detection overlay" },
  heatmap: { icon: "🔥", label: "HEATMAP", description: "Forensic SSIM heat" },
  sonar:   { icon: "📡", label: "SONAR",   description: "Acoustic radar view" },
  bio:     { icon: "🌊", label: "BIO",     description: "Bioluminescence map" },
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AnalysePage() {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"normal" | "sonar" | "bio">("normal");
  const [showHeatmap, setShowHeatmap] = useState(false);

  // -------------------------------------------------------------------
  // Upload handler
  // -------------------------------------------------------------------

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setOriginalPreview(preview);
    setResult(null);
    setMode("normal");
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // -------------------------------------------------------------------
  // Image selection logic
  // -------------------------------------------------------------------

  const displayImage = result
    ? mode === "sonar"
      ? result.sonar_base64
      : mode === "bio"
      ? result.biolight_base64
      : showHeatmap
      ? result.heatmap_base64
      : result.enhanced_image_base64
    : null;

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-panel text-gray-100 flex flex-col relative overflow-hidden">

      {/* Underwater ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020a18] via-[#051630] to-[#0a0f1a]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sonar-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]" />
        {/* Subtle bubbles */}
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-sonar-600/30 bg-panel/80 backdrop-blur-md px-6 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-full border-2 border-sonar-300/60 animate-sonar-sweep" />
            <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-sonar-300 to-sonar-500 shadow-lg shadow-sonar-400/30" />
          </div>
          <span className="font-mono text-lg font-bold tracking-widest text-sonar-300 uppercase group-hover:text-sonar-200 transition-colors">
            Sub-Sentinel
          </span>
        </Link>
        <span className="hidden sm:block text-xs font-mono text-sonar-500/60 border-l border-sonar-600/30 pl-4 ml-2">
          ACOUSTIC-VISUAL FORENSICS
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-mono text-threat-low animate-slow-pulse">● LIVE</span>
        </div>
      </header>

      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-3">

        {/* LEFT – Analysis Panel */}
        <div className="lg:col-span-2 p-6 flex flex-col gap-6 border-r border-sonar-600/20">

          {/* Upload zone */}
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300
            ${isDragActive
              ? "border-sonar-300 bg-sonar-500/10 shadow-lg shadow-sonar-400/10"
              : "border-sonar-600/30 hover:border-sonar-400/60 hover:bg-sonar-700/10"}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-sonar-600/20 border border-sonar-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-sonar-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-sm font-mono text-gray-400">
                {isDragActive ? "Release to analyse…" : "Drop underwater image or click to upload"}
              </p>
              <p className="text-xs text-sonar-500/50 font-mono">PNG, JPG, WEBP supported</p>
            </div>
          </div>

          {isLoading && <SonarLoader />}

          {/* Compare slider */}
          {!isLoading && originalPreview && displayImage && (
            <div className="rounded-2xl overflow-hidden border border-sonar-600/30 shadow-xl shadow-black/20">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={originalPreview} alt="Original" />}
                itemTwo={<ReactCompareSliderImage src={displayImage} alt={
                  mode === "sonar"
                    ? "Sonar View"
                    : mode === "bio"
                    ? "Bioluminescence View"
                    : showHeatmap
                    ? "Forensic Heatmap"
                    : "Enhanced"
                } />}
                style={{ height: 440 }}
              />
            </div>
          )}

          {/* Mode buttons */}
          {result && !isLoading && (
            <div className="flex gap-2 flex-wrap items-center">
              {(["normal", "heatmap", "sonar", "bio"] as const).map((m) => {
                const meta = MODE_META[m];
                const isActive =
                  m === "heatmap" ? showHeatmap :
                  m === "normal"  ? mode === "normal" && !showHeatmap :
                  mode === m;
                const handleClick = () => {
                  if (m === "heatmap") {
                    setMode("normal");
                    setShowHeatmap((v) => !v);
                  } else {
                    setMode(m as "normal" | "sonar" | "bio");
                    setShowHeatmap(false);
                  }
                };
                return (
                  <button
                    key={m}
                    onClick={handleClick}
                    className={`px-4 py-2.5 text-xs font-mono border rounded-lg transition-all duration-200 flex items-center gap-2
                    ${isActive
                      ? "bg-sonar-400 text-white border-sonar-300 shadow-md shadow-sonar-400/20"
                      : "bg-surface/80 border-sonar-600/30 text-gray-400 hover:border-sonar-400/50 hover:text-sonar-200"}`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
              <span className="text-xs text-sonar-500/60 font-mono ml-3 border-l border-sonar-600/30 pl-3">
                {result.detections.length} contact{result.detections.length !== 1 ? "s" : ""} detected
              </span>
            </div>
          )}

          {/* Detection badges */}
          {result && result.detections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.detections.map((d, i) => (
                <DetectionBadge key={i} detection={d} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT – Telemetry Panel */}
        <div className="p-6 flex flex-col gap-4">
          <TelemetryPanel sitrep={result?.sitrep_text ?? null} isLoading={isLoading} />

          {result?.transmission && (
            <div className="text-xs font-mono border border-sonar-600/30 bg-surface/60 backdrop-blur-sm p-4 rounded-xl space-y-2">
              <div className="text-sonar-400/80 uppercase tracking-widest text-[10px] mb-2">Transmission</div>
              <p className="text-gray-400">📡 {result.transmission.mode}</p>
              <p className="text-gray-400">⚡ {result.transmission.compression}</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
