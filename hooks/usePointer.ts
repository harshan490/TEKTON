"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, type SpringOptions } from "motion/react";

const SPRING: SpringOptions = { stiffness: 60, damping: 20, mass: 1 };

/**
 * Pointer position normalised to -1…1 around the viewport centre, sprung.
 * Stays at 0 unless `enabled` (desktop, fine pointer, motion allowed).
 */
export function usePointerParallax(enabled: boolean, spring: SpringOptions = SPRING) {
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const x = useSpring(nx, spring);
  const y = useSpring(ny, spring);

  useEffect(() => {
    if (!enabled) {
      nx.set(0);
      ny.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      nx.set((e.clientX / window.innerWidth) * 2 - 1);
      ny.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, nx, ny]);

  return { x, y };
}
