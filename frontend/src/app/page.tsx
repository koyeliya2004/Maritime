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
// Page component
// ---------------------------------------------------------------------------

export default function Home() {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"normal" | "heatmap" | "sonar" | "bio">("normal");

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
    setMode("normal"); // ✅ reset mode
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
  // Image selection logic (🔥 IMPORTANT)
  // -------------------------------------------------------------------

  let displayImage: string | null = null;

  if (result) {
    if (mode === "heatmap") displayImage = result.heatmap_base64;
    else if (mode === "sonar") displayImage = result.sonar_base64;
    else if (mode === "bio") displayImage = result.biolight_base64;
    else displayImage = result.boxed_image_base64; // 👈 BEST DEFAULT
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-panel text-gray-100 flex flex-col">

      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border border-sonar-300 animate-sonar-sweep" />
            <div className="absolute inset-[6px] rounded-full bg-sonar-400" />
          </div>
          <span className="font-mono text-lg font-bold tracking-widest text-sonar-300 uppercase">
            Sub-Sentinel
          </span>
        </div>
        <div className="ml-auto text-xs font-mono text-threat-low animate-slow-pulse">
          ● LIVE
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3">

        {/* LEFT */}
        <div className="lg:col-span-2 p-6 flex flex-col gap-6 border-r border-border">

          {/* Upload */}
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center
            ${isDragActive ? "border-sonar-300 bg-sonar-700/20" : "border-border hover:border-sonar-400"}`}
          >
            <input {...getInputProps()} />
            <p className="text-sm font-mono text-gray-400">
              {isDragActive ? "Release to analyse…" : "Upload underwater image"}
            </p>
          </div>

          {isLoading && <SonarLoader />}

          {/* Image */}
          {!isLoading && originalPreview && displayImage && (
            <div className="rounded-xl overflow-hidden border border-border">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={originalPreview} alt="Original" />}
                itemTwo={<ReactCompareSliderImage src={displayImage} alt="Processed" />}
                style={{ height: 420 }}
              />
            </div>
          )}

          {/* 🔥 NEW MODE BUTTONS */}
          {result && !isLoading && (
            <div className="flex gap-2 flex-wrap">

              {["normal","heatmap","sonar","bio"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as any)}
                  className={`px-3 py-2 text-xs font-mono border rounded 
                  ${mode === m ? "bg-sonar-400 text-white" : "bg-surface border-border"}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}

              <span className="text-xs text-gray-500 font-mono ml-2">
                {result.detections.length} contacts
              </span>

            </div>
          )}

          {/* Detections */}
          {result && (
            <div className="flex flex-wrap gap-2">
              {result.detections.map((d, i) => (
                <DetectionBadge key={i} detection={d} />
              ))}
            </div>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className="p-6">
          <TelemetryPanel sitrep={result?.sitrep_text ?? null} isLoading={isLoading} />

          {/* 🔥 TRANSMISSION */}
          {result && (
            <div className="mt-4 text-xs font-mono border border-border p-3 rounded">
              <p>📡 {result.transmission.mode}</p>
              <p>⚡ {result.transmission.compression}</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
