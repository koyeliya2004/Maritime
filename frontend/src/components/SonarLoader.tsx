"use client";

/**
 * SonarLoader – animated skeleton shown while the backend is processing.
 * Displays a rotating sonar sweep with shimmering content placeholders.
 */
export function SonarLoader() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Sonar sweep graphic */}
      <div className="flex justify-center py-6">
        <div className="relative w-24 h-24">
          {/* Static rings */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-sonar-400/30"
              style={{ transform: `scale(${0.4 + i * 0.3})` }}
            />
          ))}
          {/* Sweep arm */}
          <div className="absolute inset-0 flex items-center justify-center animate-sonar-sweep origin-center">
            <div
              className="absolute bg-gradient-to-r from-sonar-400/60 to-transparent"
              style={{ width: "50%", height: "2px", left: "50%", top: "50%", transformOrigin: "left center" }}
            />
          </div>
          {/* Centre dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-sonar-300 animate-slow-pulse" />
          </div>
        </div>
      </div>

      {/* Shimmer content placeholders */}
      <div className="skeleton h-48 rounded-xl" />
      <div className="flex gap-3">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-8 w-48 rounded-lg" />
      </div>
      <div className="skeleton h-24 rounded-xl" />

      <p className="text-center text-xs text-gray-500 font-mono tracking-widest animate-slow-pulse">
        PROCESSING SENSOR DATA…
      </p>
    </div>
  );
}
