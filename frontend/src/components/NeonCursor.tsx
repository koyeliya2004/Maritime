"use client";

import { useEffect } from "react";

/**
 * NeonCursor – injects the Tubes cursor WebGL effect into the page.
 * The canvas is fixed on top of everything but pointer-events: none so
 * all underlying UI remains fully interactive.
 * Loads TubesCursor from CDN via a dynamically injected ES-module script.
 */
export function NeonCursor() {
  useEffect(() => {
    const CANVAS_ID = "neon-cursor-canvas";
    if (document.getElementById(CANVAS_ID)) return; // already initialised

    const canvas = document.createElement("canvas");
    canvas.id = CANVAS_ID;
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "pointer-events:none;z-index:9999;";
    document.body.appendChild(canvas);

    const script = document.createElement("script");
    script.type = "module";
    // Colours tuned to match the app's deep-ocean palette
    script.textContent = `
      try {
        const { default: TubesCursor } =
          await import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
        const el = document.getElementById("${CANVAS_ID}");
        if (el) {
          TubesCursor(el, {
            tubes: {
              colors: ["#00a1ff", "#0080d0", "#66c0ff"],
              lights: {
                intensity: 200,
                colors: ["#00a1ff", "#005fa0", "#66c0ff", "#003f70"]
              }
            }
          });
        }
      } catch (e) {
        // Gracefully degrade – cursor effect unavailable (e.g. offline)
      }
    `;
    document.head.appendChild(script);
  }, []);

  return null;
}
