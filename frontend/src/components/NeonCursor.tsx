"use client";

import { useEffect } from "react";

/**
 * NeonCursor – injects the Tubes cursor WebGL effect into the page.
 * The canvas sits at z-index 1, behind all UI (z-10+) but above the
 * ocean background (z-0). mix-blend-mode:screen makes the black WebGL
 * background visually transparent while preserving the neon trails.
 * pointer-events:none keeps all UI controls fully interactive.
 * Loads TubesCursor from CDN via a dynamically injected ES-module script.
 * Skipped on touch-only devices where there is no cursor.
 */
export function NeonCursor() {
  useEffect(() => {
    // No cursor on touch-only (mobile) devices
    if (window.matchMedia("(hover: none)").matches) return;

    const CANVAS_ID = "neon-cursor-canvas";
    if (document.getElementById(CANVAS_ID)) return; // already initialised

    const canvas = document.createElement("canvas");
    canvas.id = CANVAS_ID;
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "pointer-events:none;z-index:1;" +
      "mix-blend-mode:screen;background:transparent;";
    document.body.appendChild(canvas);

    const script = document.createElement("script");
    script.type = "module";
    // Colours tuned to match the app's deep-ocean palette.
    // The click handler reference is stored on window so the React cleanup
    // can remove it when the component unmounts.
    script.textContent = `
      try {
        const { default: TubesCursor } =
          await import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
        const el = document.getElementById("${CANVAS_ID}");
        if (!el) return;
        const cursor = TubesCursor(el, {
          renderer: { alpha: true },
          tubes: {
            colors: ["#00a1ff", "#0080d0", "#66c0ff"],
            lights: {
              intensity: 40,
              colors: ["#00a1ff", "#005fa0", "#66c0ff", "#003f70"]
            }
          }
        });
        // Make the Three.js clear colour fully transparent if the renderer is exposed
        if (cursor && cursor.renderer) {
          cursor.renderer.setClearColor(0x000000, 0);
        }
        // Click-to-randomize colors (preserved from reference implementation)
        function randomColors(count) {
          return Array.from({ length: count }, () =>
            "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
          );
        }
        const handler = () => {
          if (cursor && cursor.tubes) {
            cursor.tubes.setColors(randomColors(3));
            cursor.tubes.setLightsColors(randomColors(4));
          }
        };
        window.__neonCursorClickHandler = handler;
        document.body.addEventListener("click", handler);
      } catch (e) {
        // Gracefully degrade – cursor effect unavailable (e.g. offline)
      }
    `;
    document.head.appendChild(script);

    return () => {
      const w = window as Window & { __neonCursorClickHandler?: EventListener };
      if (w.__neonCursorClickHandler) {
        document.body.removeEventListener("click", w.__neonCursorClickHandler);
        delete w.__neonCursorClickHandler;
      }
      document.getElementById(CANVAS_ID)?.remove();
    };
  }, []);

  return null;
}
