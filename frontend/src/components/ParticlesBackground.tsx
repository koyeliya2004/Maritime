"use client";

import { useEffect, useRef } from "react";

/**
 * ParticlesBackground – canvas-based underwater particle system
 * Renders floating particles, bubbles, and light rays for the deep-ocean
 * atmosphere without heavy DOM overhead.
 */
export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    interface Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      opacity: number;
      type: "bubble" | "dust";
    }

    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.4 + 0.1),
          opacity: Math.random() * 0.4 + 0.1,
          type: Math.random() > 0.6 ? "bubble" : "dust",
        });
      }
    }

    function drawLightRays() {
      if (!ctx) return;
      const gradient = ctx.createLinearGradient(w * 0.3, 0, w * 0.3, h * 0.7);
      gradient.addColorStop(0, "rgba(0,200,255,0.04)");
      gradient.addColorStop(1, "rgba(0,200,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, 0);
      ctx.lineTo(w * 0.1, h * 0.7);
      ctx.lineTo(w * 0.35, h * 0.7);
      ctx.lineTo(w * 0.3, 0);
      ctx.fill();

      const g2 = ctx.createLinearGradient(w * 0.6, 0, w * 0.6, h * 0.6);
      g2.addColorStop(0, "rgba(0,180,255,0.03)");
      g2.addColorStop(1, "rgba(0,180,255,0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(w * 0.55, 0);
      ctx.lineTo(w * 0.5, h * 0.6);
      ctx.lineTo(w * 0.7, h * 0.6);
      ctx.lineTo(w * 0.65, 0);
      ctx.fill();

      const g3 = ctx.createLinearGradient(w * 0.8, 0, w * 0.8, h * 0.5);
      g3.addColorStop(0, "rgba(0,220,255,0.025)");
      g3.addColorStop(1, "rgba(0,220,255,0)");
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.moveTo(w * 0.75, 0);
      ctx.lineTo(w * 0.72, h * 0.5);
      ctx.lineTo(w * 0.88, h * 0.5);
      ctx.lineTo(w * 0.85, 0);
      ctx.fill();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      drawLightRays();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        if (p.type === "bubble") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,200,255,${p.opacity * 0.6})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.fillStyle = `rgba(0,200,255,${p.opacity * 0.15})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(120,180,255,${p.opacity * 0.3})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    const handleResize = () => { resize(); init(); };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
