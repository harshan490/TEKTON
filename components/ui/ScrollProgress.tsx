"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** A hairline of portal-blue across the top that fills as you read. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gradient-to-r from-accent/0 via-accent to-portal"
      style={{ scaleX }}
    />
  );
}
