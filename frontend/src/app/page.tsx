import Link from "next/link";

// ---------------------------------------------------------------------------
// Feature cards data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: "🎯",
    title: "Object Detection",
    description: "YOLOv8-powered maritime threat identification with real-time bounding box overlay and confidence scoring.",
  },
  {
    icon: "📡",
    title: "Sonar Visualisation",
    description: "Acoustic radar-style rendering that transforms underwater imagery into tactical sonar displays.",
  },
  {
    icon: "🌊",
    title: "Bioluminescence Map",
    description: "Deep-ocean bio-light visualisation revealing hidden features through luminescence analysis.",
  },
  {
    icon: "🔥",
    title: "Forensic Heatmap",
    description: "SSIM-based structural similarity analysis highlighting anomalous regions for investigation.",
  },
  {
    icon: "🤖",
    title: "AI SITREP Generation",
    description: "LLM-powered situational reports providing tactical assessments in military-grade format.",
  },
  {
    icon: "🔬",
    title: "Image Enhancement",
    description: "FUnIE-GAN and CLAHE underwater image restoration for optimal clarity and detail.",
  },
];

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <main className="min-h-screen bg-panel text-gray-100 relative overflow-hidden">

      {/* Underwater ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#010812] via-[#041228] to-[#0a1a35]" />
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-sonar-400/4 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[100px]" />
        {/* Animated bubbles */}
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-sonar-600/20 bg-panel/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full border-2 border-sonar-300/60 animate-sonar-sweep" />
              <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-sonar-300 to-sonar-500 shadow-lg shadow-sonar-400/30" />
            </div>
            <span className="font-mono text-lg font-bold tracking-widest text-sonar-300 uppercase">
              Sub-Sentinel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-mono text-threat-low animate-slow-pulse">● SYSTEM ONLINE</span>
            <Link
              href="/analyse"
              className="px-5 py-2 text-sm font-mono font-semibold rounded-lg bg-sonar-400 text-white hover:bg-sonar-300 transition-all duration-200 shadow-lg shadow-sonar-400/20"
            >
              LAUNCH APP
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center">

          {/* Sonar animation */}
          <div className="relative w-32 h-32 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-sonar-400/20"
                style={{ transform: `scale(${0.3 + i * 0.25})` }}
              />
            ))}
            <div className="absolute inset-0 rounded-full border-2 border-sonar-300/30 sonar-ring" />
            <div className="absolute inset-0 rounded-full border-2 border-sonar-300/20 sonar-ring" style={{ animationDelay: "0.9s" }} />
            <div className="absolute inset-0 flex items-center justify-center animate-sonar-sweep origin-center">
              <div
                className="absolute bg-gradient-to-r from-sonar-400/60 to-transparent"
                style={{ width: "50%", height: "2px", left: "50%", top: "50%", transformOrigin: "left center" }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-sonar-300 shadow-lg shadow-sonar-300/50 animate-slow-pulse" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sonar-200 via-sonar-300 to-blue-400">
              Underwater Forensics
            </span>
            <br />
            <span className="text-gray-200">& Threat Detection</span>
          </h1>

          <p className="max-w-2xl text-lg text-gray-400 leading-relaxed mb-10 font-mono">
            Advanced acoustic-visual analysis platform combining AI-powered image enhancement,
            real-time object detection, and tactical intelligence for maritime security operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/analyse"
              className="px-8 py-4 text-base font-mono font-bold rounded-xl bg-gradient-to-r from-sonar-400 to-sonar-300 text-white hover:from-sonar-300 hover:to-sonar-200 transition-all duration-300 shadow-xl shadow-sonar-400/25 hover:shadow-sonar-300/30"
            >
              BEGIN ANALYSIS →
            </Link>
            <a
              href="https://arko007-maritime.hf.space/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-base font-mono font-bold rounded-xl border-2 border-sonar-500/40 text-sonar-300 hover:bg-sonar-600/20 hover:border-sonar-400/60 transition-all duration-300"
            >
              API DOCS
            </a>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-sonar-200 mb-3">Capabilities</h2>
          <p className="text-gray-500 font-mono text-sm">Mission-critical analysis tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-sonar-600/20 bg-surface/40 backdrop-blur-sm p-6 hover:border-sonar-400/40 hover:bg-sonar-700/10 transition-all duration-300"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-sonar-200 mb-2 font-mono tracking-wide">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sonar-600/20 bg-panel/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sonar-400 animate-slow-pulse" />
            <span className="text-xs font-mono text-gray-500">SUB-SENTINEL v1.0.0</span>
          </div>
          <span className="text-xs font-mono text-gray-600">
            Acoustic-Visual Forensics & Threat Relay
          </span>
        </div>
      </footer>
    </main>
  );
}
