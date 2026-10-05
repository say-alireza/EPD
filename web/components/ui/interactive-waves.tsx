"use client";

import { useEffect, useRef } from "react";

interface InteractiveWavesProps {
  className?: string;
}

export function InteractiveWaves({ className = "" }: InteractiveWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Mouse coordinates tracking with smooth Lerp physics
    const targetMouse = { x: width * 0.5, y: height * 0.7, active: false };
    const currentMouse = { x: width * 0.5, y: height * 0.7 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
      targetMouse.active = true;
    };

    const handleMouseLeave = () => {
      targetMouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 0.018;

      // Smooth lerp toward mouse target
      if (targetMouse.active) {
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.07;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.07;
      } else {
        // Gently return to center when idle
        currentMouse.x += (width * 0.5 - currentMouse.x) * 0.03;
        currentMouse.y += (height * 0.75 - currentMouse.y) * 0.03;
      }

      // Helper function to draw dynamic interactive wave
      const drawWave = (
        baseYRatio: number,
        frequency: number,
        amplitude: number,
        color: string,
        mouseFactor: number,
        speedOffset: number
      ) => {
        const baseY = height * baseYRatio;
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 8) {
          // 1. Natural oscillation
          const naturalY =
            Math.sin(x * frequency + step + speedOffset) * amplitude +
            Math.cos(x * 0.004 + step * 0.7) * (amplitude * 0.45);

          // 2. Cursor dynamic attraction & ripple
          const dx = x - currentMouse.x;
          const radius = Math.max(180, width * 0.22);
          const mouseInfluence = Math.exp(-(dx * dx) / (2 * radius * radius));

          // Vertical pull toward cursor
          const dy = (currentMouse.y - baseY) * mouseFactor * mouseInfluence;

          const y = baseY + naturalY + dy;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      // Layer 1: EPD Teal Wave (#34CDBB)
      drawWave(0.62, 0.0028, 45, "rgba(52, 205, 187, 0.09)", 0.28, 0);

      // Layer 2: EPD Deep Navy Wave (#1B2540)
      drawWave(0.72, 0.0035, 38, "rgba(27, 37, 64, 0.06)", 0.22, 1.4);

      // Layer 3: EPD Warm Gold Wave (#FBC757)
      drawWave(0.82, 0.0022, 52, "rgba(251, 199, 87, 0.07)", 0.18, 2.8);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
