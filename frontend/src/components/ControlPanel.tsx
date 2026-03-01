"use client";

import { motion } from "framer-motion";

/**
 * ControlPanel – glassmorphic floating data panel that mimics
 * submarine control room displays.
 */
export function ControlPanel({
  side,
  children,
}: {
  side: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className={`
        hidden lg:flex flex-col gap-3
        w-56 xl:w-64 shrink-0
        ${side === "left" ? "items-start" : "items-end"}
      `}
    >
      {children}
    </motion.div>
  );
}

/**
 * DataWidget – individual glassmorphic stat card
 */
export function DataWidget({
  label,
  value,
  unit,
  accent = "cyan",
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: "cyan" | "green" | "amber";
}) {
  const accentMap = {
    cyan: "border-cyan-500/25 shadow-cyan-500/5",
    green: "border-green-500/25 shadow-green-500/5",
    amber: "border-amber-500/25 shadow-amber-500/5",
  };
  const textMap = {
    cyan: "text-cyan-400",
    green: "text-green-400",
    amber: "text-amber-400",
  };

  return (
    <div
      className={`
        w-full px-4 py-3 rounded-xl
        bg-white/[0.03] backdrop-blur-md
        border ${accentMap[accent]}
        shadow-lg
      `}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
        {label}
      </div>
      <div className={`text-lg font-mono font-bold ${textMap[accent]}`}>
        {value}
        {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
}
