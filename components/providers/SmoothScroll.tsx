"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, anchors: { offset: -24 } }}>
      {children}
    </ReactLenis>
  );
}
