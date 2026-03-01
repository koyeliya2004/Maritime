"use client";

import { motion } from "framer-motion";

const MODES = [
  { key: "NORMAL", icon: "🎯", label: "NORMAL" },
  { key: "HEATMAP", icon: "🔥", label: "HEATMAP" },
  { key: "SONAR", icon: "📡", label: "SONAR" },
  { key: "BIO", icon: "🌊", label: "BIO" },
] as const;

export type ModeKey = (typeof MODES)[number]["key"];

/**
 * ModeSelector – NORMAL / HEATMAP / SONAR / BIO toggle buttons.
 * Glowing active state with smooth framer-motion transitions.
 */
export function ModeSelector({
  active,
  onChange,
}: {
  active: ModeKey;
  onChange: (mode: ModeKey) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {MODES.map((m) => {
        const isActive = active === m.key;
        return (
          <motion.button
            key={m.key}
            onClick={() => onChange(m.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3
              rounded-xl font-mono text-xs sm:text-sm font-semibold
              border transition-colors duration-300
              ${
                isActive
                  ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20"
                  : "bg-white/[0.03] border-white/10 text-gray-400 hover:border-cyan-500/30 hover:text-gray-300"
              }
            `}
          >
            {isActive && (
              <motion.span
                layoutId="mode-glow"
                className="absolute inset-0 rounded-xl bg-cyan-400/10 border border-cyan-400/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{m.icon}</span>
            <span className="relative z-10 tracking-wider">{m.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
