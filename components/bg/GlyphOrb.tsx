"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Glyph Orb — a banded ASCII planet turning slowly in the light of a distant sun.
 * TEKTON's own build (after the React Bits Pro idea): a canvas grid of glyphs,
 * each cell shaded by sphere lighting × cloud bands, drawn from a pre-rendered
 * glyph atlas so a frame is just image copies. Optionally carves a logo into the
 * planet's face in bright glyphs.
 */
export type GlyphOrbProps = {
  /** Shadowed bands → sunlit clouds. The brightest limb burns toward white. */
  colors?: [string, string];
  /** Saturated colour between the two — the planet's body. */
  midColor?: string;
  backgroundColor?: string;
  charset?: string;
  fontFamily?: string;
  /** Glyph height in CSS px. */
  glyphSize?: number;
  /** Column gap multiplier, 0.6 (packed) – 2.5 (airy). */
  spacing?: number;
  /** Planet diameter relative to the frame's short side. */
  size?: number;
  centerX?: number;
  centerY?: number;
  /** Axis lean in degrees. */
  tilt?: number;
  spin?: number;
  bands?: number;
  turbulence?: number;
  /** Where the sun is, degrees around the planet (0 = above, −45 = upper left). */
  lightAngle?: number;
  /** 0 = behind the planet (crescent) … 1 = in front (fully lit). */
  lightHeight?: number;
  rim?: number;
  atmosphere?: number;
  contrast?: number;
  /** The sun drifts toward the pointer. */
  hoverLight?: boolean;
  /** An image (transparent PNG) drawn into the planet in bright glyphs. */
  logoSrc?: string;
  /** Logo size relative to the planet's diameter. */
  logoScale?: number;
  /** Seconds per turn of the logo while the pointer is over the planet (0 = never). */
  logoHoverSpin?: number;
  paused?: boolean;
  /** Frames per second cap. */
  fps?: number;
  className?: string;
  children?: React.ReactNode;
};

const DEFAULT_CHARSET =
  " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const LEVELS = 28;
const VARIANTS = 3;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export default function GlyphOrb({
  colors = ["#1B2B9E", "#CFE0F5"],
  midColor = "#3F7BFF",
  backgroundColor = "#05070B",
  charset = DEFAULT_CHARSET,
  fontFamily = "var(--font-geist-mono), ui-monospace, monospace",
  glyphSize = 11,
  spacing = 1.1,
  size = 0.8,
  centerX = 0.5,
  centerY = 0.42,
  tilt = -24,
  spin = 1,
  bands = 9,
  turbulence = 1,
  lightAngle = -45,
  lightHeight = 0.4,
  rim = 0.7,
  atmosphere = 0.6,
  contrast = 0.4,
  hoverLight = true,
  logoSrc,
  logoScale = 0.62,
  logoHoverSpin = 20,
  paused = false,
  fps = 30,
  className,
  children,
}: GlyphOrbProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [shadow, sunlit] = [hexToRgb(colors[0]), hexToRgb(colors[1])];
    const mid = hexToRgb(midColor);
    const resolvedFont = getComputedStyle(wrap).getPropertyValue("--font-geist-mono").trim();
    const font = fontFamily.replace("var(--font-geist-mono)", resolvedFont || "ui-monospace");

    let dpr = 1;
    let w = 0;
    let h = 0;
    let cellW = 0;
    let cellH = 0;
    let cols = 0;
    let rows = 0;
    let atlas: HTMLCanvasElement | null = null;
    let logoMask: { a: Float32Array; l: Float32Array; halo: Float32Array; n: number } | null = null;

    // ── Glyph atlas: LEVELS brightness steps × VARIANTS characters, colour baked in ──
    const ramp = charset;
    const buildAtlas = () => {
      const a = document.createElement("canvas");
      const cw = Math.ceil(cellW * dpr);
      const ch = Math.ceil(cellH * dpr);
      a.width = cw * VARIANTS;
      a.height = ch * LEVELS;
      const g = a.getContext("2d")!;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.font = `${Math.round(glyphSize * dpr)}px ${font}`;
      for (let lv = 0; lv < LEVELS; lv++) {
        const b = lv / (LEVELS - 1);
        // shadow → mid (saturated) → sunlit → white
        const t1 = smooth(0.0, 0.5, b);
        const t2 = smooth(0.45, 0.85, b);
        let r = mix(mix(shadow[0], mid[0], t1), sunlit[0], t2);
        let gg = mix(mix(shadow[1], mid[1], t1), sunlit[1], t2);
        let bl = mix(mix(shadow[2], mid[2], t1), sunlit[2], t2);
        const t = t2;
        const hot = smooth(0.86, 1, b);
        r = mix(r, 255, hot);
        gg = mix(gg, 255, hot);
        bl = mix(bl, 255, hot);
        const alpha = mix(0.22, 1, smooth(0, 0.55, b));
        g.fillStyle = `rgba(${r | 0},${gg | 0},${bl | 0},${alpha})`;
        g.shadowColor = `rgba(${r | 0},${gg | 0},${bl | 0},${0.55 * hot + 0.15 * t})`;
        g.shadowBlur = (2 + 6 * hot) * dpr;
        for (let v = 0; v < VARIANTS; v++) {
          const idx = Math.round(b * (ramp.length - 1)) + (v - 1) * (b > 0.05 ? 1 : 0);
          const c = ramp[Math.max(1, Math.min(ramp.length - 1, idx))];
          g.fillText(c, v * cw + cw / 2, lv * ch + ch / 2);
        }
      }
      atlas = a;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      cellH = glyphSize * 1.18;
      cellW = glyphSize * 0.6 * spacing;
      cols = Math.ceil(w / cellW);
      rows = Math.ceil(h / cellH);
      buildAtlas();
      draw(lastT);
    };

    // ── Logo → alpha + luminance grid, sampled per cell ──
    if (logoSrc) {
      const img = new Image();
      img.onload = () => {
        const n = 256;
        const c = document.createElement("canvas");
        c.width = c.height = n;
        const g = c.getContext("2d")!;
        const s = Math.min(n / img.width, n / img.height);
        const iw = img.width * s;
        const ih = img.height * s;
        g.drawImage(img, (n - iw) / 2, (n - ih) / 2, iw, ih);
        const d = g.getImageData(0, 0, n, n).data;
        // A blurred copy gives a soft halo that follows the mark's shape.
        g.clearRect(0, 0, n, n);
        g.filter = "blur(9px)";
        g.drawImage(img, (n - iw) / 2, (n - ih) / 2, iw, ih);
        g.filter = "none";
        const hd = g.getImageData(0, 0, n, n).data;
        const a = new Float32Array(n * n);
        const l = new Float32Array(n * n);
        const halo = new Float32Array(n * n);
        for (let i = 0; i < n * n; i++) {
          a[i] = d[i * 4 + 3] / 255;
          l[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
          halo[i] = Math.min(1, (hd[i * 4 + 3] / 255) * 1.8);
        }
        logoMask = { a, l, halo, n };
        draw(lastT);
      };
      img.src = logoSrc;
    }

    // ── Light: eases toward the pointer when hoverLight ──
    let lightA = (lightAngle * Math.PI) / 180;
    let lightTarget = lightA;
    let overPlanet = false;
    let logoAngle = 0;
    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width * centerX);
      const dy = e.clientY - (rect.top + rect.height * centerY);
      if (hoverLight) lightTarget = Math.atan2(dx, -dy);
      overPlanet = Math.hypot(dx, dy) < Math.min(rect.width, rect.height) * 0.5 * size;
    };
    const onLeave = () => {
      lightTarget = (lightAngle * Math.PI) / 180;
      overPlanet = false;
    };
    if ((hoverLight || (logoSrc && logoHoverSpin > 0)) && !reduce) {
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
    }

    const tiltR = (tilt * Math.PI) / 180;
    const cosT = Math.cos(tiltR);
    const sinT = Math.sin(tiltR);
    const lz = mix(-0.35, 1, lightHeight);
    const lxy = Math.sqrt(Math.max(0, 1 - lz * lz));
    const gamma = 1 + contrast;

    let lastT = 0;
    function draw(tMs: number) {
      if (!atlas) return;
      const t = tMs / 1000;
      const cx = w * centerX;
      const cy = h * centerY;
      const R = Math.min(w, h) * 0.5 * size;
      const lx = Math.sin(lightA) * lxy;
      const ly = -Math.cos(lightA) * lxy;
      const cw = Math.ceil(cellW * dpr);
      const ch = Math.ceil(cellH * dpr);

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      if (backgroundColor === "transparent") {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      } else {
        ctx!.fillStyle = backgroundColor;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }

      // Atmosphere: a soft halo leaning toward the sun.
      if (atmosphere > 0) {
        const hx = (cx + lx * R * 0.18) * dpr;
        const hy = (cy + ly * R * 0.18) * dpr;
        const grad = ctx!.createRadialGradient(hx, hy, R * 0.9 * dpr, hx, hy, R * 1.35 * dpr);
        grad.addColorStop(0, `rgba(${sunlit[0]},${sunlit[1]},${sunlit[2]},${0.10 * atmosphere})`);
        grad.addColorStop(0.4, `rgba(${shadow[0]},${shadow[1]},${shadow[2]},${0.12 * atmosphere})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      }

      const spinT = t * spin * 0.12;
      const c0 = Math.max(0, Math.floor((cx - R) / cellW) - 1);
      const c1 = Math.min(cols, Math.ceil((cx + R) / cellW) + 1);
      const r0 = Math.max(0, Math.floor((cy - R) / cellH) - 1);
      const r1 = Math.min(rows, Math.ceil((cy + R) / cellH) + 1);
      const logoS = R * 2 * logoScale;
      const la = Math.cos(-logoAngle);
      const lb = Math.sin(-logoAngle);

      for (let r = r0; r < r1; r++) {
        const py = (r + 0.5) * cellH;
        const ny = (py - cy) / R;
        for (let c = c0; c < c1; c++) {
          const px = (c + 0.5) * cellW;
          const nx = (px - cx) / R;
          const d2 = nx * nx + ny * ny;
          if (d2 > 1) continue;
          const nz = Math.sqrt(1 - d2);

          // Surface coordinates on the tilted, spinning sphere.
          const tx = nx * cosT - ny * sinT;
          const ty = nx * sinT + ny * cosT;
          const lat = Math.asin(Math.max(-1, Math.min(1, -ty)));
          const lon = Math.atan2(tx, nz) + spinT;

          const swirl =
            turbulence *
            (0.55 * Math.sin(lon * 3 + lat * 2.2 + t * 0.21) + 0.3 * Math.sin(lon * 7.1 - lat * 5.3 - t * 0.13));
          const band = 0.5 + 0.5 * Math.sin(lat * bands + swirl);
          const detail = 0.12 * Math.sin(lon * 17 + lat * 11 + band * 3);

          const ndl = nx * lx + ny * ly + nz * lz;
          // Wrapped Lambert: a soft terminator, then a steep fall into the night side.
          const diff = Math.pow(clamp01((ndl + 0.2) / 1.2), gamma);
          const rimv = Math.pow(1 - nz, 2.4) * smooth(-0.1, 0.6, ndl) * rim;
          let b = diff * (0.22 + 0.78 * band + detail) + rimv + 0.05 * band;

          // Logo carved in bright glyphs.
          let solid = false;
          if (logoMask) {
            // Sample the logo rotated by logoAngle about its centre.
            const ox = (px - cx) / logoS;
            const oy = (py - cy) / logoS;
            const u = ox * la - oy * lb + 0.5;
            const v = ox * lb + oy * la + 0.5;
            if (u >= 0 && u < 1 && v >= 0 && v < 1) {
              const i = ((v * logoMask.n) | 0) * logoMask.n + ((u * logoMask.n) | 0);
              const a = logoMask.a[i];
              if (a > 0.4) {
                // Chrome shading kept, lifted into the white end of the ramp.
                b = 0.78 + 0.22 * logoMask.l[i];
                solid = true;
              } else {
                // Quiet the clouds just around the mark so it reads.
                b *= 1 - 0.75 * logoMask.halo[i];
              }
            }
          }

          b = clamp01(b);
          if (b < 0.02) continue;
          const lv = Math.min(LEVELS - 1, Math.round(b * (LEVELS - 1)));
          // Variant travels with the surface so characters move with the rotation.
          const variant = solid ? VARIANTS - 1 : ((((lon * 9) | 0) * 7 + ((lat * 13) | 0) * 13) >>> 0) % VARIANTS;
          ctx!.drawImage(atlas, variant * cw, lv * ch, cw, ch, (px - cellW / 2) * dpr, (py - cellH / 2) * dpr, cw, ch);
        }
      }
    }

    // ── Loop: capped fps, only while on screen ──
    let raf = 0;
    let visible = true;
    let last = 0;
    const frameMs = 1000 / fps;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < frameMs) return;
      if (overPlanet && logoHoverSpin > 0 && last) logoAngle += ((now - last) / 1000) * ((Math.PI * 2) / logoHoverSpin);
      last = now;
      lightA += (lightTarget - lightA) * 0.06;
      lastT = now;
      draw(now);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(wrap);
    resize();
    if (!reduce && !paused) raf = requestAnimationFrame(loop);
    else draw(8000);

    // Redraw once the mono font has loaded (the atlas is built from it).
    document.fonts?.ready.then(() => {
      buildAtlas();
      draw(lastT || 8000);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    colors[0],
    colors[1],
    midColor,
    backgroundColor,
    charset,
    fontFamily,
    glyphSize,
    spacing,
    size,
    centerX,
    centerY,
    tilt,
    spin,
    bands,
    turbulence,
    lightAngle,
    lightHeight,
    rim,
    atmosphere,
    contrast,
    hoverLight,
    logoSrc,
    logoScale,
    logoHoverSpin,
    paused,
    fps,
  ]);

  return (
    <div ref={wrapRef} className={cn("relative min-h-[240px] overflow-hidden", className)} style={{ backgroundColor }}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block" />
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
