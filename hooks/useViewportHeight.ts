"use client";

import { useEffect, useRef } from "react";

/** Live window.innerHeight in a ref (for scroll transforms that must not re-render). */
export function useViewportHeight() {
  const vh = useRef(900);
  useEffect(() => {
    const update = () => (vh.current = window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return vh;
}
