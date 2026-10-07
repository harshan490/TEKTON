"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useFinePointer } from "@/hooks/useMedia";

const INTERACTIVE = "a, button, input, textarea, select, label, [role=button], [data-cursor]";

/** 8 px portal-blue dot + 32 px glass ring that opens over anything clickable. Desktop only. */
export default function CustomCursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 });
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setActive(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    };
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div
        className="absolute left-0 top-0 rounded-full border border-white/25 bg-white/[0.03]"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%", width: 32, height: 32 }}
        animate={{ scale: down ? 0.8 : active ? 1.6 : 1, borderColor: active ? "rgba(143,184,255,0.6)" : "rgba(255,255,255,0.25)" }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <motion.div
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: active ? 0.5 : 1 }}
      />
    </div>
  );
}
