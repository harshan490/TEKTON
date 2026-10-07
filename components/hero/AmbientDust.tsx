"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient dust: a few hundred motes rising very slowly through the light,
 * twinkling, drifting on a lazy sine. Leans a little away from the pointer.
 */
type Mote = { x: number; y: number; z: number; s: number; ph: number; tw: number };

export default function AmbientDust({ count = 140, className }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const motes: Mote[] = [];
    const seed = (m: Mote, anywhere: boolean) => {
      m.x = Math.random() * w;
      m.y = anywhere ? Math.random() * h : h + 10;
      m.z = 0.3 + Math.random() * 0.7;
      m.s = 0.5 + Math.random() * 1.4 * m.z;
      m.ph = Math.random() * Math.PI * 2;
      m.tw = 0.4 + Math.random() * 1.2;
      return m;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (!motes.length) for (let i = 0; i < count; i++) motes.push(seed({} as Mote, true));
    };
    resize();

    let px = 0;
    let tx = 0;
    const onMove = (e: PointerEvent) => (tx = e.clientX / window.innerWidth - 0.5);
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = 0;
    let visible = true;
    const draw = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      px += (tx - px) * 0.03;
      const t = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= (6 + 14 * m.z) * dt;
        m.x += Math.sin(t * 0.3 + m.ph) * 4 * m.z * dt;
        if (m.y < -10) seed(m, false);
        const a = (0.15 + 0.55 * m.z) * (0.55 + 0.45 * Math.sin(t * m.tw + m.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = m.z > 0.75 ? "#d8ecf8" : "#98c0ef";
        ctx.beginPath();
        ctx.arc(m.x - px * 30 * m.z, m.y, m.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (visible) draw(now);
      else last = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
