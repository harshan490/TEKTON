"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Phones resize the viewport whenever the address bar shows or hides; recomputing
// every scroll animation then makes components jump. Ignore those resizes.
if (typeof window !== "undefined") ScrollTrigger.config({ ignoreMobileResize: true });

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, anchors: { offset: -24 } }}>
      {children}
    </ReactLenis>
  );
}
