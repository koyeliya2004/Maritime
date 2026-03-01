"use client";

import { motion } from "framer-motion";

/**
 * SonarRadar – animated circular sonar sweep with concentric rings
 * and blip indicators. Used as a tactical UI element.
 */
export function SonarRadar({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-56 h-56" : size === "md" ? "w-36 h-36" : "w-24 h-24";
  const rings = size === "lg" ? 5 : size === "md" ? 4 : 3;

  return (
    <div className={`relative ${dims}`}>
      {/* Background glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-xl" />

      {/* Concentric rings */}
      {Array.from({ length: rings }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-cyan-400/15"
          style={{ transform: `scale(${0.2 + i * (0.8 / rings)})` }}
        />
      ))}

      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30" />

      {/* Cross hairs */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/10" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/10" />

      {/* Sweep arm with glow */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {/* Sweep gradient cone */}
        <div
          className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(0,255,200,0.15) 0deg, transparent 60deg)",
            borderRadius: "0 100% 0 0",
          }}
        />
        {/* Sweep line */}
        <div
          className="absolute bg-gradient-to-r from-cyan-400/80 to-transparent"
          style={{
            width: "50%",
            height: "2px",
            left: "50%",
            top: "50%",
            transformOrigin: "left center",
          }}
        />
      </motion.div>

      {/* Blips */}
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
        style={{ top: "25%", left: "60%" }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50"
        style={{ top: "65%", left: "35%" }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
      {size !== "sm" && (
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
          style={{ top: "40%", left: "25%" }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2.2 }}
        />
      )}

      {/* Centre dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/60" />
      </div>
    </div>
  );
}
