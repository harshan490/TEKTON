"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useIntro } from "@/components/providers/Intro";
import { site } from "@/config/site";
import { EASE, cn } from "@/lib/utils";

/** Minimal top bar — no container, no glass. A soft fade appears behind it once scrolled. */
export default function Nav() {
  const { done } = useIntro();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 80));
  const visible = done;

  return (
    <motion.header
      className={cn("fixed inset-x-0 top-0 z-50", !visible && "pointer-events-none")}
      initial={{ opacity: 0, y: -20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.9, delay: 1.6, ease: EASE }}
      inert={!visible}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/90 to-transparent transition-opacity duration-700",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        className={cn(
          "relative mx-auto flex max-w-[1320px] items-center justify-between px-5 transition-[padding] duration-500 ease-out-expo sm:px-8 lg:px-10",
          scrolled ? "py-4" : "py-6"
        )}
      >
        <a href="#top" className="group flex items-center gap-3" aria-label={`${site.name} — home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tekton-mark.png"
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] object-contain transition-transform duration-700 ease-out-expo group-hover:rotate-[120deg]"
          />
          {/* The wordmark from the original logo — chrome, extended, the three-bar E */}
          <span className="relative block h-[15px] w-[119px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tekton-wordmark.png" alt="" width={1370} height={172} className="h-full w-full object-contain" />
            <span
              aria-hidden
              className="nav-sheen pointer-events-none absolute inset-0"
              style={{
                WebkitMaskImage: "url(/tekton-wordmark.png)",
                maskImage: "url(/tekton-wordmark.png)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
          </span>
        </a>

        <nav aria-label="Primary" className="flex items-center gap-8">
          <ul className="hidden items-center gap-7 lg:flex">
            {site.nav.slice(0, 4).map((item) => (
              <li key={item.href}>
                <a href={item.href} className="nav-link relative text-[13px] text-ink-2 transition-colors duration-300 hover:text-ink">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">
            <span className="live-dot" aria-hidden />
            {site.status}
          </span>
        </nav>
      </div>
    </motion.header>
  );
}
