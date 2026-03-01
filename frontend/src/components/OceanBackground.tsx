/**
 * OceanBackground – deep-ocean animated scene rendered entirely via
 * CSS / inline SVG with no client-side JS (uses CSS animations only).
 *
 * Elements:
 *  - Multi-stop deep-blue gradient base
 *  - Three light-shaft rays from the surface
 *  - Bioluminescence glow orbs
 *  - Three animated wave layers along the bottom
 *  - A large submarine traversing left → right (with vertical bob)
 *  - A whale silhouette slowly crossing the screen
 *  - A small school of fish
 *  - A solitary fish swimming right → left
 *  - Three jellyfish floating up and down
 *  - Sonar-ping expanding rings
 *  - Eight rising bubbles
 */

/* ─── Inline SVG helpers ─────────────────────────────────────────────────── */

function SubmarineSVG() {
  return (
    <svg
      width="320"
      height="110"
      viewBox="0 0 320 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Hull */}
      <ellipse cx="148" cy="68" rx="132" ry="30" fill="#0b2240" />
      {/* Bow dome */}
      <ellipse cx="272" cy="68" rx="18" ry="14" fill="#0d2a50" stroke="#00a1ff" strokeWidth="1" />
      {/* Hull highlight stripe */}
      <ellipse cx="148" cy="55" rx="118" ry="10" fill="#0d2a50" opacity="0.5" />
      {/* Stern cap */}
      <ellipse cx="22" cy="68" rx="12" ry="18" fill="#091828" />

      {/* Conning tower / sail */}
      <rect x="108" y="30" width="62" height="38" rx="7" fill="#091828" />
      <rect x="116" y="20" width="44" height="20" rx="5" fill="#071420" />
      {/* Periscope */}
      <rect x="134" y="5" width="5" height="20" rx="2.5" fill="#091828" />
      <rect x="120" y="7" width="22" height="5" rx="2.5" fill="#091828" />
      {/* Antenna */}
      <rect x="154" y="10" width="3" height="14" rx="1.5" fill="#091828" />

      {/* Forward dive planes */}
      <path d="M238,56 L260,36 L270,54 Z" fill="#091828" />
      <path d="M238,80 L260,100 L270,82 Z" fill="#091828" />

      {/* Stern dive planes / rudder */}
      <path d="M28,55 L8,34 L22,54 Z" fill="#091828" />
      <path d="M28,81 L8,102 L22,82 Z" fill="#091828" />

      {/* Propeller blades */}
      <ellipse cx="22" cy="68" rx="5" ry="22" fill="#091828" opacity="0.8" transform="rotate(15 22 68)" />
      <ellipse cx="22" cy="68" rx="5" ry="22" fill="#091828" opacity="0.8" transform="rotate(-15 22 68)" />
      <ellipse cx="22" cy="68" rx="22" ry="5" fill="#091828" opacity="0.7" />
      <circle cx="22" cy="68" r="6" fill="#0d2a50" />

      {/* Portholes */}
      <circle cx="88"  cy="66" r="9" fill="#050f1e" stroke="#00a1ff" strokeWidth="1.5" />
      <circle cx="88"  cy="66" r="5" fill="#020810" />
      <circle cx="90"  cy="64" r="2" fill="#00a1ff" opacity="0.45" />

      <circle cx="148" cy="66" r="9" fill="#050f1e" stroke="#00a1ff" strokeWidth="1.5" />
      <circle cx="148" cy="66" r="5" fill="#020810" />
      <circle cx="150" cy="64" r="2" fill="#00a1ff" opacity="0.45" />

      <circle cx="208" cy="66" r="9" fill="#050f1e" stroke="#00a1ff" strokeWidth="1.5" />
      <circle cx="208" cy="66" r="5" fill="#020810" />
      <circle cx="210" cy="64" r="2" fill="#00a1ff" opacity="0.45" />

      {/* Running lights */}
      <circle cx="264" cy="60" r="4" fill="#00ff88" opacity="0.85" />
      <circle cx="264" cy="76" r="4" fill="#ff3300" opacity="0.85" />

      {/* Hull detail lines */}
      <line x1="42" y1="56" x2="250" y2="56" stroke="#0d2a50" strokeWidth="0.8" opacity="0.6" />
      <line x1="42" y1="80" x2="250" y2="80" stroke="#0d2a50" strokeWidth="0.8" opacity="0.6" />

      {/* Hatches on top */}
      <ellipse cx="88"  cy="47" rx="15" ry="5" fill="#071420" stroke="#0d2a50" strokeWidth="1" />
      <ellipse cx="178" cy="47" rx="15" ry="5" fill="#071420" stroke="#0d2a50" strokeWidth="1" />
    </svg>
  );
}

function WhaleSVG() {
  return (
    <svg
      width="240"
      height="90"
      viewBox="0 0 240 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", opacity: 0.18 }}
    >
      {/* Body */}
      <ellipse cx="105" cy="48" rx="92" ry="28" fill="#1a4870" />
      {/* Tail flukes */}
      <path d="M190,40 L240,14 L228,48 L240,82 L190,56 Z" fill="#16405f" />
      {/* Dorsal fin */}
      <path d="M88,22 L100,2 L122,22" fill="#16405f" />
      {/* Flipper */}
      <path d="M65,55 L42,85 L95,65 Z" fill="#12304a" />
      {/* Eye */}
      <circle cx="30" cy="45" r="5" fill="#00a1ff" opacity="0.35" />
      {/* Smile */}
      <path d="M10,50 Q22,60 36,51" stroke="#0080d0" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Belly */}
      <ellipse cx="85" cy="60" rx="65" ry="14" fill="#1e5a80" opacity="0.4" />
    </svg>
  );
}

function FishSVG({ size = 44 }: { size?: number }) {
  const h = Math.round(size * 0.6);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 44 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Tail */}
      <path d="M36,13 Q44,4 44,13 Q44,22 36,13 Z" fill="#0080d0" />
      {/* Body */}
      <ellipse cx="20" cy="13" rx="20" ry="10" fill="#00a1ff" />
      {/* Belly */}
      <ellipse cx="18" cy="16" rx="14" ry="5" fill="#66c0ff" opacity="0.3" />
      {/* Eye */}
      <circle cx="7" cy="11" r="3.5" fill="#010812" />
      <circle cx="6" cy="10" r="1.2" fill="#66c0ff" />
      {/* Fin */}
      <path d="M14,5 Q18,0 24,5" stroke="#0080d0" strokeWidth="1" fill="none" />
    </svg>
  );
}

function JellyfishSVG({ size = 40, color = "#00a1ff", opacity = 0.4 }: { size?: number; color?: string; opacity?: number }) {
  const h = Math.round(size * 1.5);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 40 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", opacity }}
    >
      {/* Bell */}
      <path d="M4,22 Q20,0 36,22 Q38,36 20,40 Q2,36 4,22Z" fill={color} opacity="0.25" />
      <path d="M4,22 Q20,0 36,22" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* Inner bell detail */}
      <ellipse cx="20" cy="28" rx="10" ry="6" fill={color} opacity="0.12" />
      {/* Tentacles */}
      <path d="M10,40 Q8,50 10,60" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
      <path d="M15,40 Q13,52 15,60" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M20,40 Q20,52 20,60" stroke={color} strokeWidth="1.2" fill="none" opacity="0.4" />
      <path d="M25,40 Q27,52 25,60" stroke={color} strokeWidth="1" fill="none" opacity="0.35" />
      <path d="M30,40 Q32,50 30,60" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
    </svg>
  );
}

/* ─── Wave layers ─────────────────────────────────────────────────────────── */

function WaveLayers() {
  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none">
      {/* Layer 1 – slowest, deepest colour */}
      <div className="wave-layer wave-layer-1">
        <svg viewBox="0 0 2880 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "160px" }}>
          <path
            d="M0,90 C90,50 270,130 360,90 C450,50 630,130 720,90 C810,50 990,130 1080,90 C1170,50 1350,130 1440,90 C1530,50 1710,130 1800,90 C1890,50 2070,130 2160,90 C2250,50 2430,130 2520,90 C2610,50 2790,130 2880,90 L2880,160 L0,160 Z"
            fill="rgba(3,16,45,0.55)"
          />
        </svg>
      </div>

      {/* Layer 2 – medium speed, slightly lighter */}
      <div className="wave-layer wave-layer-2">
        <svg viewBox="0 0 2880 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "120px" }}>
          <path
            d="M0,65 C120,35 360,95 480,65 C600,35 840,95 960,65 C1080,35 1320,95 1440,65 C1560,35 1800,95 1920,65 C2040,35 2280,95 2400,65 C2520,35 2760,95 2880,65 L2880,120 L0,120 Z"
            fill="rgba(5,22,62,0.4)"
          />
        </svg>
      </div>

      {/* Layer 3 – fastest, front, smallest amplitude */}
      <div className="wave-layer wave-layer-3">
        <svg viewBox="0 0 2880 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "90px" }}>
          <path
            d="M0,48 C60,28 180,68 240,48 C300,28 420,68 480,48 C540,28 660,68 720,48 C780,28 900,68 960,48 C1020,28 1140,68 1200,48 C1260,28 1380,68 1440,48 C1500,28 1620,68 1680,48 C1740,28 1860,68 1920,48 C1980,28 2100,68 2160,48 C2220,28 2340,68 2400,48 C2460,28 2580,68 2640,48 C2700,28 2820,68 2880,48 L2880,90 L0,90 Z"
            fill="rgba(8,30,78,0.28)"
          />
        </svg>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export function OceanBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#010812] via-[#021325] to-[#04101e]" />

      {/* Surface light shafts */}
      <div
        className="absolute top-0 left-[22%] w-3 bg-gradient-to-b from-cyan-400/[0.07] to-transparent blur-2xl"
        style={{ height: "48vh", transform: "rotate(10deg)", transformOrigin: "top center", animation: "light-shaft-pulse 8s ease-in-out infinite" }}
      />
      <div
        className="absolute top-0 left-[46%] w-4 bg-gradient-to-b from-blue-400/[0.05] to-transparent blur-3xl"
        style={{ height: "55vh", transform: "rotate(-5deg)", transformOrigin: "top center", animation: "light-shaft-pulse 10s ease-in-out infinite", animationDelay: "-2s" }}
      />
      <div
        className="absolute top-0 right-[28%] w-2 bg-gradient-to-b from-cyan-300/[0.06] to-transparent blur-2xl"
        style={{ height: "42vh", transform: "rotate(7deg)", transformOrigin: "top center", animation: "light-shaft-pulse 9s ease-in-out infinite", animationDelay: "-5s" }}
      />

      {/* Bioluminescence glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] bg-[#00a1ff]/[0.04]" />
      <div className="absolute bottom-1/3 right-1/4 w-[420px] h-[420px] rounded-full blur-[130px] bg-blue-600/[0.05]" />
      <div className="absolute top-1/2 left-10  w-[280px] h-[280px] rounded-full blur-[100px] bg-cyan-500/[0.03]" />

      {/* Sonar pings */}
      <div className="sonar-ping" style={{ left: "14%",  top: "42%", animationDuration: "4.5s", animationDelay: "0s"   }} />
      <div className="sonar-ping" style={{ left: "64%",  top: "57%", animationDuration: "5.5s", animationDelay: "-2s"  }} />
      <div className="sonar-ping" style={{ left: "82%",  top: "26%", animationDuration: "6s",   animationDelay: "-4s"  }} />
      <div className="sonar-ping" style={{ left: "38%",  top: "72%", animationDuration: "5s",   animationDelay: "-1.5s"}} />

      {/* ── Whale silhouette ──────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          animation: "ocean-traverse-right 58s linear infinite",
          animationDelay: "-22s",
        }}
      >
        <WhaleSVG />
      </div>

      {/* ── Submarine (outer = traverse, inner = bob) ─────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "36%",
          animation: "ocean-traverse-right 34s linear infinite",
          animationDelay: "-9s",
        }}
      >
        <div style={{ animation: "sub-bob 4s ease-in-out infinite" }}>
          <SubmarineSVG />
          {/* Bubble trail behind propeller */}
          <div className="sub-bubble sub-bubble-1" />
          <div className="sub-bubble sub-bubble-2" />
          <div className="sub-bubble sub-bubble-3" />
        </div>
      </div>

      {/* ── Fish school (right) ───────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          display: "flex",
          gap: "14px",
          alignItems: "center",
          animation: "ocean-traverse-right 20s linear infinite",
          animationDelay: "-6s",
        }}
      >
        {([44, 34, 42, 28, 38] as number[]).map((sz, i) => (
          <div
            key={i}
            style={{
              transform: `translateY(${Math.sin(i * 1.3) * 8}px)`,
              opacity: 0.55 - i * 0.04,
            }}
          >
            <FishSVG size={sz} />
          </div>
        ))}
      </div>

      {/* ── Solitary fish (left) ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "72%",
          animation: "ocean-traverse-left 26s linear infinite",
          animationDelay: "-14s",
        }}
      >
        <div style={{ opacity: 0.4 }}>
          <FishSVG size={50} />
        </div>
      </div>

      {/* ── Jellyfish ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "28%",
          animation: "jelly-drift 6s ease-in-out infinite",
        }}
      >
        <JellyfishSVG size={46} color="#00a1ff" opacity={0.45} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "76%",
          top: "48%",
          animation: "jelly-drift 8.5s ease-in-out infinite",
          animationDelay: "-3s",
        }}
      >
        <JellyfishSVG size={32} color="#0080d0" opacity={0.3} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "52%",
          top: "63%",
          animation: "jelly-drift 7s ease-in-out infinite",
          animationDelay: "-5s",
        }}
      >
        <JellyfishSVG size={38} color="#005fa0" opacity={0.25} />
      </div>

      {/* ── Wave layers ───────────────────────────────────────────────────── */}
      <WaveLayers />

      {/* ── Bubbles ───────────────────────────────────────────────────────── */}
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
      <div className="bubble bubble-5" />
      <div className="bubble bubble-6" />
      <div className="bubble bubble-7" />
      <div className="bubble bubble-8" />
    </div>
  );
}
