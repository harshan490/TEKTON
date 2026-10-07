"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/utils";

/**
 * The site's one section reveal: opacity 0 → 1, y 24 → 0, blur 8 → 0, 0.7 s, once.
 * Filter is cleared afterwards — a filtered parent would cut glass off from the
 * backdrop (it becomes the backdrop root).
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "header";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Mono section label: `01 ── mission`. The number drops in, the rule draws, the word follows. */
export function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  const v = { once: true, amount: 0.8 } as const;
  return (
    <p className="label flex items-center gap-3">
      <motion.span
        className="text-accent"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={v}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {index}
      </motion.span>
      <motion.span
        aria-hidden
        className="h-px w-8 origin-left bg-gradient-to-r from-accent/70 to-white/15"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={v}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
      />
      <motion.span
        initial={{ opacity: 0, x: -8, letterSpacing: "0.4em" }}
        whileInView={{ opacity: 1, x: 0, letterSpacing: "0.18em" }}
        viewport={v}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      >
        {children}
      </motion.span>
    </p>
  );
}
