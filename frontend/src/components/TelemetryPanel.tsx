"use client";

import { useEffect, useRef } from "react";

interface TelemetryPanelProps {
  sitrep: string | null;
  isLoading: boolean;
}

/**
 * TelemetryPanel – displays the Groq-generated SITREP with a typewriter-style
 * reveal animation and a glowing "TRANSMISSION" header.
 */
export function TelemetryPanel({ sitrep, isLoading }: TelemetryPanelProps) {
  const textRef = useRef<HTMLParagraphElement>(null);

  // Animate text reveal when sitrep changes
  useEffect(() => {
    if (!sitrep || !textRef.current) return;
    const el = textRef.current;
    el.style.opacity = "0";
    el.textContent = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < sitrep.length) {
        el.textContent += sitrep[i];
        i++;
      } else {
        clearInterval(interval);
        el.style.opacity = "1";
      }
    }, 12);
    return () => clearInterval(interval);
  }, [sitrep]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-sonar-300 animate-slow-pulse" />
        <span className="text-xs font-mono font-bold tracking-widest text-sonar-300 uppercase">
          SITREP Transmission
        </span>
      </div>

      {/* Panel body */}
      <div className="flex-1 rounded-xl bg-surface border border-border p-4 min-h-[200px] relative overflow-hidden">
        {/* Decorative corner bracket */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sonar-400/40 rounded-tl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sonar-400/40 rounded-br" />

        {isLoading && (
          <div className="flex flex-col gap-3 py-2">
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-5/6" />
            <div className="skeleton h-4 rounded w-4/6" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-3/4" />
          </div>
        )}

        {!isLoading && sitrep && (
          <p
            ref={textRef}
            className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap"
            style={{ transition: "opacity 0.3s" }}
          />
        )}

        {!isLoading && !sitrep && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="relative w-16 h-16">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-sonar-400/20 sonar-ring"
                  style={{ animationDelay: `${i * 0.9}s` }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sonar-500" />
              </div>
            </div>
            <p className="text-xs text-gray-600 font-mono tracking-widest text-center">
              AWAITING SENSOR INPUT
            </p>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-600">
        <span>MODEL: llama-3.1-8b-instant</span>
        <span className={sitrep ? "text-threat-low" : "text-gray-700"}>
          {sitrep ? "● RECEIVED" : "○ IDLE"}
        </span>
      </div>
    </div>
  );
}
