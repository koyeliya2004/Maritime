"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SonarRadar } from "@/components/SonarRadar";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { ControlPanel, DataWidget } from "@/components/ControlPanel";
import { ModeSelector } from "@/components/ModeSelector";
import type { ModeKey } from "@/components/ModeSelector";

// ---------------------------------------------------------------------------
// Feature cards data
// ---------------------------------------------------------------------------

const FEATURES = [
  { icon: "🎯", title: "Object Detection", description: "YOLOv8-powered maritime threat identification with real-time bounding box overlay." },
  { icon: "📡", title: "Sonar Visualisation", description: "Acoustic radar-style rendering that transforms imagery into tactical sonar displays." },
  { icon: "🌊", title: "Bioluminescence Map", description: "Deep-ocean bio-light visualisation revealing hidden features through luminescence." },
  { icon: "🔥", title: "Forensic Heatmap", description: "SSIM-based structural similarity analysis highlighting anomalous regions." },
  { icon: "🤖", title: "AI SITREP Generation", description: "LLM-powered situational reports providing tactical assessments." },
  { icon: "🔬", title: "Image Enhancement", description: "FUnIE-GAN and CLAHE underwater image restoration for optimal clarity." },
];

// Mode accent colours for the hero glow
const MODE_GLOW: Record<ModeKey, string> = {
  NORMAL: "from-cyan-500/10 via-blue-500/5",
  HEATMAP: "from-orange-500/10 via-red-500/5",
  SONAR: "from-green-500/10 via-cyan-500/5",
  BIO: "from-purple-500/10 via-blue-500/5",
};

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

export default function Home() {
  const [activeMode, setActiveMode] = useState<ModeKey>("NORMAL");
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Parallax on mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setParallax({
      x: (e.clientX - cx) / cx * 12,
      y: (e.clientY - cy) / cy * 12,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <main className="min-h-screen bg-[#020810] text-gray-100 relative overflow-hidden">
      {/* ── FULLSCREEN OCEAN BACKGROUND ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Gradient ocean depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#010812] via-[#041228] to-[#0a1a35]" />

        {/* Parallax ambient glows */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
        >
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-sonar-400/[0.04] rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-teal-500/[0.03] rounded-full blur-[130px]" />
        </div>

        {/* Submarine window vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

        {/* Canvas particles + light rays */}
        <ParticlesBackground />

        {/* CSS bubbles */}
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <nav className="relative z-20 border-b border-cyan-500/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Left – Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-[spin_6s_linear_infinite]" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-slow-pulse" />
              <div className="absolute inset-[5px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-400/40" />
            </div>
            <span className="font-mono text-base sm:text-lg font-bold tracking-[0.2em] text-cyan-300 uppercase">
              Sub-Sentinel
            </span>
          </div>

          {/* Right – Status + Launch */}
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:flex items-center gap-2 text-xs font-mono text-green-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-slow-pulse" />
              SYSTEM ONLINE
            </span>
            <Link
              href="/analyse"
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-mono font-bold rounded-full
                bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                hover:from-cyan-400 hover:to-blue-400
                shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/35
                transition-all duration-300"
            >
              LAUNCH APP
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative z-10 min-h-[calc(100vh-60px)] flex flex-col">

        {/* Mode-dependent glow overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${MODE_GLOW[activeMode]} to-transparent`}
          />
        </AnimatePresence>

        {/* Cockpit layout: left panel – centre – right panel */}
        <div className="flex-1 flex flex-col lg:flex-row items-stretch max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 gap-6">

          {/* LEFT CONTROL PANEL */}
          <ControlPanel side="left">
            <DataWidget label="Depth" value="342" unit="m" accent="cyan" />
            <DataWidget label="Temperature" value="4.2" unit="°C" accent="green" />
            <DataWidget label="Pressure" value="34.8" unit="atm" accent="cyan" />
            <DataWidget label="Visibility" value="12" unit="m" accent="amber" />
            <DataWidget label="Current" value="0.3" unit="kn" accent="green" />
          </ControlPanel>

          {/* CENTRE CONTENT */}
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-300">
                  Underwater Forensics
                </span>
                <br />
                <span className="text-gray-200">&amp; Threat Detection</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed font-mono px-2"
            >
              Advanced acoustic-visual analysis platform combining AI-powered image enhancement,
              real-time object detection, and tactical intelligence.
            </motion.p>

            {/* MODE SELECTOR */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            >
              <ModeSelector active={activeMode} onChange={setActiveMode} />
            </motion.div>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2"
            >
              <Link
                href="/analyse"
                className="group relative px-8 py-4 text-sm sm:text-base font-mono font-bold rounded-2xl
                  bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                  hover:from-cyan-400 hover:to-blue-400
                  shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40
                  transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">BEGIN ANALYSIS →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <a
                href="https://arko007-maritime.hf.space/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 text-sm sm:text-base font-mono font-bold rounded-2xl
                  border-2 border-cyan-500/30 text-cyan-300
                  hover:bg-cyan-500/10 hover:border-cyan-400/50
                  transition-all duration-300"
              >
                API DOCS
              </a>
            </motion.div>

            {/* Mobile sonar widget */}
            <div className="lg:hidden mt-4">
              <SonarRadar size="sm" />
            </div>
          </div>

          {/* RIGHT CONTROL PANEL */}
          <ControlPanel side="right">
            <div className="flex flex-col items-center gap-4 w-full">
              <SonarRadar size="lg" />
              <div className="w-full">
                <DataWidget label="Threat Level" value="LOW" accent="green" />
              </div>
              <div className="w-full">
                <DataWidget label="Contacts" value="3" accent="cyan" />
              </div>
            </div>
          </ControlPanel>
        </div>

        {/* Tablet: mini data cards row */}
        <div className="hidden md:flex lg:hidden justify-center gap-3 px-6 pb-6 flex-wrap">
          <DataWidget label="Depth" value="342" unit="m" accent="cyan" />
          <DataWidget label="Threat" value="LOW" accent="green" />
          <DataWidget label="Contacts" value="3" accent="cyan" />
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pb-20 pt-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-200 mb-3">Capabilities</h2>
          <p className="text-gray-500 font-mono text-xs sm:text-sm">Mission-critical analysis tools</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6
                hover:border-cyan-500/25 hover:bg-cyan-900/10 transition-all duration-300"
            >
              <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">{f.icon}</div>
              <h3 className="text-sm sm:text-base font-bold text-cyan-200 mb-2 font-mono tracking-wide">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-cyan-500/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-slow-pulse" />
            <span className="text-xs font-mono text-gray-500">SUB-SENTINEL v1.0.0</span>
          </div>
          <span className="text-xs font-mono text-gray-600">
            Acoustic-Visual Forensics &amp; Threat Relay
          </span>
        </div>
      </footer>
    </main>
  );
}
