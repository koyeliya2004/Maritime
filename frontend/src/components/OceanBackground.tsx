"use client";

/**
 * OceanBackground – Deep-ocean ambient background layer.
 *
 * Pure-CSS animated scene featuring:
 *  • multi-layer wave motion at the top
 *  • a drifting submarine (SVG silhouette)
 *  • a swimming scuba diver (SVG silhouette)
 *  • enhanced bubble particles
 *  • light-ray effects from the surface
 *  • deep-ocean gradient
 *
 * Fully responsive – elements scale down on small viewports.
 */

export function OceanBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep ocean gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#010812] via-[#041228] to-[#0a1a35]" />

      {/* Subtle ambient glows */}
      <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-sonar-400/4 rounded-full blur-[150px]" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[100px]" />

      {/* Light rays from surface */}
      <div className="ocean-light-rays" />

      {/* Wave layers */}
      <div className="ocean-wave ocean-wave--1" />
      <div className="ocean-wave ocean-wave--2" />
      <div className="ocean-wave ocean-wave--3" />

      {/* Submarine */}
      <div className="ocean-submarine">
        <svg
          viewBox="0 0 220 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Hull */}
          <ellipse cx="110" cy="44" rx="90" ry="28" fill="#0c2a4a" stroke="#1a4a72" strokeWidth="1.5" />
          {/* Conning tower */}
          <rect x="90" y="14" width="36" height="18" rx="6" fill="#0e3258" stroke="#1a4a72" strokeWidth="1" />
          {/* Periscope */}
          <rect x="106" y="4" width="4" height="14" rx="2" fill="#1a4a72" />
          {/* Porthole windows */}
          <circle cx="60" cy="44" r="6" fill="#041228" stroke="#00a1ff" strokeWidth="1" opacity="0.5" />
          <circle cx="85" cy="44" r="6" fill="#041228" stroke="#00a1ff" strokeWidth="1" opacity="0.5" />
          <circle cx="110" cy="44" r="6" fill="#041228" stroke="#00a1ff" strokeWidth="1" opacity="0.5" />
          <circle cx="135" cy="44" r="6" fill="#041228" stroke="#00a1ff" strokeWidth="1" opacity="0.5" />
          {/* Porthole inner glow */}
          <circle cx="60" cy="44" r="3" fill="#00a1ff" opacity="0.15" />
          <circle cx="85" cy="44" r="3" fill="#00a1ff" opacity="0.15" />
          <circle cx="110" cy="44" r="3" fill="#00a1ff" opacity="0.15" />
          <circle cx="135" cy="44" r="3" fill="#00a1ff" opacity="0.15" />
          {/* Tail fin */}
          <polygon points="200,30 220,18 220,70 200,58" fill="#0c2a4a" stroke="#1a4a72" strokeWidth="1" />
          {/* Propeller */}
          <ellipse cx="218" cy="44" rx="3" ry="12" fill="#1a4a72" opacity="0.6" />
          {/* Bow */}
          <ellipse cx="22" cy="44" rx="4" ry="8" fill="#0e3258" />
          {/* Headlight glow */}
          <circle cx="22" cy="44" r="3" fill="#00a1ff" opacity="0.25">
            <animate attributeName="opacity" values="0.15;0.35;0.15" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* Scuba diver */}
      <div className="ocean-diver">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Body */}
          <ellipse cx="50" cy="50" rx="14" ry="20" fill="#0e3258" stroke="#1a4a72" strokeWidth="1" />
          {/* Head */}
          <circle cx="50" cy="26" r="10" fill="#0c2a4a" stroke="#1a4a72" strokeWidth="1" />
          {/* Mask / visor */}
          <ellipse cx="53" cy="25" rx="7" ry="5" fill="#041228" stroke="#00a1ff" strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="53" cy="25" rx="4" ry="3" fill="#00a1ff" opacity="0.12" />
          {/* Air tank */}
          <rect x="33" y="35" width="8" height="22" rx="4" fill="#0c2a4a" stroke="#1a4a72" strokeWidth="0.8" />
          {/* Hose from tank to mask */}
          <path d="M37 35 Q37 28, 43 26" stroke="#1a4a72" strokeWidth="1" fill="none" />
          {/* Left arm (forward) */}
          <path d="M36 45 L22 38 L18 42" stroke="#1a4a72" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Right arm (back) */}
          <path d="M64 45 L76 50 L80 46" stroke="#1a4a72" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Left leg with fin */}
          <path d="M42 68 L38 82 L28 86" stroke="#1a4a72" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M28 86 L22 84 L28 88 Z" fill="#1a4a72" opacity="0.6" />
          {/* Right leg with fin */}
          <path d="M58 68 L62 82 L72 86" stroke="#1a4a72" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M72 86 L78 84 L72 88 Z" fill="#1a4a72" opacity="0.6" />
          {/* Diver bubbles */}
          <circle cx="58" cy="18" r="2" fill="none" stroke="#00a1ff" strokeWidth="0.5" opacity="0.4">
            <animate attributeName="cy" values="18;8" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="62" cy="16" r="1.5" fill="none" stroke="#00a1ff" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="cy" values="16;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="56" cy="14" r="1" fill="none" stroke="#00a1ff" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="cy" values="14;2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* Bubbles */}
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
      <div className="bubble bubble-5" />
      <div className="bubble bubble-6" />
      <div className="bubble bubble-7" />
      <div className="bubble bubble-8" />

      {/* Ocean particles / plankton */}
      <div className="ocean-particle ocean-particle--1" />
      <div className="ocean-particle ocean-particle--2" />
      <div className="ocean-particle ocean-particle--3" />
      <div className="ocean-particle ocean-particle--4" />
      <div className="ocean-particle ocean-particle--5" />
      <div className="ocean-particle ocean-particle--6" />
    </div>
  );
}
