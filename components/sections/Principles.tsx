"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurText from "@/components/reactbits/BlurText";
import LogoLoop from "@/components/reactbits/LogoLoop";
import Reveal, { SectionLabel } from "@/components/ui/Reveal";
import { OPEN_SCIENCE, PRINCIPLES } from "@/config/content";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

// Text marks only — no third-party logos.
const MARKS = OPEN_SCIENCE.map((name) => ({
  node: <span className="font-mono text-[14px] uppercase tracking-[0.22em] text-ink-3">{name}</span>,
  title: name,
}));

/**
 * How we work — a timeline drawn by light. As you scroll, a glowing line runs
 * down the rail with a comet at its head; each principle's node ignites when
 * the light reaches it, and its glass card slides in from its side.
 */
export default function Principles() {
  const railRef = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const q = gsap.utils.selector(rail);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        q(".tl-item").forEach((el) => el.classList.add("is-active"));
        gsap.set(q(".tl-fill"), { scaleY: 1 });
        return;
      }
      const span = { trigger: rail, start: "top 62%", end: "bottom 62%", scrub: 0.6 };
      gsap.fromTo(q(".tl-fill"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: span });
      gsap.fromTo(q(".tl-comet"), { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: span });

      q(".tl-item").forEach((item, i) => {
        // The node ignites when the light reaches it…
        ScrollTrigger.create({ trigger: item, start: "top 62%", toggleClass: { targets: item, className: "is-active" } });
        // …and the card arrives from its side.
        const card = item.querySelector(".tl-card");
        const fromLeft = i % 2 === 0;
        // Phones: rise in place (a sideways offset would push past the screen edge).
        const narrow = window.matchMedia("(max-width: 767px)").matches;
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: narrow ? 0 : fromLeft ? -50 : 50, y: narrow ? 24 : 0, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "expo.out",
            clearProps: "filter",
            scrollTrigger: { trigger: item, start: "top 75%", toggleActions: "play none none reverse" },
          }
        );
      });
    }, rail);
    return () => ctx.revert();
  }, []);

  return (
    <section id="research" aria-label="Research" className="relative px-5 py-32 sm:px-8 sm:py-40 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <SectionLabel index="04">research</SectionLabel>
        </Reveal>
        <BlurText
          as="h2"
          segments={[{ text: "How we" }, { text: "work.", className: "serif-accent text-portal" }]}
          delay={80}
          stepDuration={0.7}
          animationFrom={{ filter: "blur(12px)", opacity: 0, y: 24 }}
          animationTo={[{ filter: "blur(0px)", opacity: 1, y: 0 }]}
          className="mt-5 justify-center text-[clamp(36px,4.6vw,56px)] font-semibold leading-[1] tracking-[-0.035em] text-ink"
        />

        {/* ── The timeline ── */}
        <ol ref={railRef} className="relative mx-auto mt-20 max-w-[960px] pb-4">
          {/* Rail, its light, and the comet at the head of the light */}
          <span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px bg-[rgba(186,215,247,0.12)] md:left-1/2" />
          <span
            aria-hidden
            className="tl-fill absolute bottom-0 left-[18px] top-0 w-[3px] origin-top rounded-full bg-gradient-to-b from-[rgba(143,184,255,0.2)] via-[#8FB8FF] to-[#d8ecf8] shadow-[0_0_14px_2px_rgba(143,184,255,0.55)] md:left-[calc(50%-1px)]"
          />
          <span aria-hidden className="tl-comet absolute left-[20px] top-0 md:left-1/2">
            <span className="absolute -translate-x-1/2 -translate-y-1/2">
              <span className="block h-3 w-3 rounded-full bg-white shadow-[0_0_14px_5px_rgba(143,184,255,0.9),0_0_44px_14px_rgba(53,96,255,0.55)]" />
            </span>
          </span>

          {PRINCIPLES.map((p, i) => {
            const right = i % 2 === 1;
            return (
              <li key={p.title} className="tl-item group relative py-10 pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                {/* Node on the rail */}
                <span
                  aria-hidden
                  className="tl-node absolute left-[20px] top-1/2 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[rgba(186,215,247,0.3)] bg-[#05070B] transition-[background-color,border-color] duration-500 md:left-1/2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[rgba(186,215,247,0.35)] transition-colors duration-500" />
                </span>

                <div className={cn(right ? "md:col-start-2" : "md:col-start-1 md:text-right")}>
                  <div
                    className={cn(
                      "tl-card glass-plate shimmer inline-block w-full max-w-[400px] px-6 py-5 text-left transition-shadow duration-700",
                      !right && "md:text-right"
                    )}
                  >
                    <span className="tl-num font-mono text-[11px] tracking-[0.2em] text-ink-3 transition-colors duration-500">
                      0{i + 1}
                    </span>
                    <h3 className="mt-2 text-[clamp(20px,2.2vw,26px)] font-medium tracking-[-0.02em] text-ink">{p.title}</h3>
                    <p className="mt-2 text-[14px] leading-[1.55] text-[#9da7ba]">{p.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Edges fade with a mask (the background is a gradient, not a flat colour). */}
        <div
          className="mt-24"
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
          }}
        >
          <LogoLoop logos={MARKS} speed={36} direction="left" logoHeight={20} gap={72} pauseOnHover ariaLabel="Open-source projects we build on" />
        </div>
      </div>
    </section>
  );
}
