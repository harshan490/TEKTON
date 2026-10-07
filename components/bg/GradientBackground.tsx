"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Noise from "@/components/reactbits/Noise";
import AmbientDust from "@/components/hero/AmbientDust";
import { useFinePointer } from "@/hooks/useMedia";
import { usePointerParallax } from "@/hooks/usePointer";

/**
 * The fixed backdrop: the Glyph Orb palette as slow light — indigo night,
 * body blue, a sunlit portal-blue — drifting over near-black. Blobs are
 * radial gradients moved with transforms only (no blur filters), so the
 * whole thing stays on the compositor.
 */
const BLOBS = [
  // colour, size (vmax), start position, drift animation
  { c: "rgba(26,38,144,0.55)", s: 95, x: "-18%", y: "38%", a: "blob-a 34s" },
  { c: "rgba(53,96,255,0.30)", s: 70, x: "48%", y: "-12%", a: "blob-b 41s" },
  { c: "rgba(143,184,255,0.16)", s: 46, x: "8%", y: "-10%", a: "blob-c 29s" },
  { c: "rgba(53,96,255,0.18)", s: 60, x: "62%", y: "58%", a: "blob-a 47s reverse" },
];

export default function GradientBackground() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { scrollYProgress } = useScroll();
  // The light slowly sinks as you go down the page, and dims toward the door.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);
  const dim = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 0.25, 0.35, 0.6]);
  const p = usePointerParallax(fine && !reduce);
  const px = useTransform(p.x, (v) => v * -18);
  const py = useTransform(p.y, (v) => v * -12);

  return (
    // Sized to the large viewport (lvh), not inset-0: on phones the address bar
    // showing/hiding would otherwise resize this layer and its canvases mid-scroll.
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-0 h-[100lvh] w-full overflow-hidden bg-bg">
      <motion.div className="absolute -inset-[10%] will-change-transform" style={{ y }}>
        <motion.div className="absolute inset-0 will-change-transform" style={{ x: px, y: py }}>
          {BLOBS.map((b, i) => (
            <div
              key={i}
              className="absolute rounded-full will-change-transform"
              style={{
                width: `${b.s}vmax`,
                height: `${b.s}vmax`,
                left: b.x,
                top: b.y,
                background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, transparent 68%)`,
                animation: reduce ? undefined : `${b.a} ease-in-out infinite alternate`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Vignette keeps the edges in the dark the orb lives in. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 40%, rgba(5,7,11,0.7) 100%)" }}
      />
      <motion.div className="absolute inset-0 bg-bg" style={{ opacity: dim }} />

      {/* The same slow dust as the hero, drifting behind every section. */}
      <AmbientDust count={80} className="absolute inset-0 h-full w-full opacity-70" />

      <Noise patternAlpha={9} patternRefreshInterval={3} className="mix-blend-overlay" />
    </div>
  );
}
