"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import AmbientDust from "@/components/hero/AmbientDust";
import { HybridCard, ReflexCard, UltronCard } from "@/components/hero/GlassCards";
import { site } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
// Development only: lets tooling fast-forward timelines when the page isn't painting.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __gsap?: typeof gsap }).__gsap = gsap;
}

const LETTERS = [...site.wordmark];

/*
 * The original logo draws its E as three free bars (no vertical stem). We get
 * that from the font's own E by clipping the stem away: in the wordmark face
 * the stem ends 0.2em into the glyph, so everything left of 0.225em goes, and
 * the letter steps back to keep the spacing even.
 */
const glyphStyle = (ch: string): React.CSSProperties | undefined =>
  ch === "E" ? { clipPath: "inset(-20% -10% -20% 0.225em)", marginLeft: "-0.13em" } : undefined;

/**
 * The first page — an ambient, frosted-glass room at midnight. A breathing
 * blueprint grid, a slowly swaying spotlight, pools of light drifting under
 * the glass and dust rising through it; the TEKTON wordmark lit from behind;
 * the ULTRON family floating beneath as glass cards.
 *
 * Motion (GSAP): everything arrives slowly out of the dark, then keeps
 * breathing — nothing snaps, nothing shouts. The fan leans toward the
 * pointer; scrolling parts it and lets the wordmark sink back.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const q = gsap.utils.selector(el);
    let onMove: ((e: PointerEvent) => void) | null = null;

    const ctx = gsap.context(() => {
      if (reduce) return;

      // ── Arrival: slow, out of the dark ───────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(q(".hero-pool, .hero-dust"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 3.5, stagger: 0.3, ease: "power2.out" }, 0)
        .fromTo(q(".hero-beam"), { autoAlpha: 0, scaleY: 0.3, transformOrigin: "50% 0%" }, { autoAlpha: 1, scaleY: 1, duration: 3 }, 0.2)
        .fromTo(q(".hero-grid"), { "--r": "0%" }, { "--r": "75%", duration: 3.4, ease: "power2.out" }, 0.3)
        .fromTo(q(".hero-eyebrow-line"), { scaleX: 0 }, { scaleX: 1, duration: 2, ease: "expo.out" }, 0.9)
        .fromTo(
          q(".hero-eyebrow-text"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.6, scrambleText: { text: "Introducing", chars: "upperCase", speed: 0.4, revealDelay: 0.5 }, ease: "none" },
          0.9
        )
        .fromTo(
          q(".hero-letter"),
          { yPercent: 40, autoAlpha: 0, filter: "blur(24px)" },
          { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 2.4, stagger: 0.12, ease: "expo.out", clearProps: "filter" },
          1.1
        )
        .fromTo(q(".hero-halo"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 3 }, 1.4)
        .fromTo(q(".hero-shine"), { backgroundPositionX: "130%" }, { backgroundPositionX: "-30%", duration: 1.4, stagger: 0.12, ease: "sine.inOut" }, 2.6)
        .fromTo(
          q(".hero-card"),
          { autoAlpha: 0, y: 160, rotateX: 22, filter: "blur(12px)" },
          { autoAlpha: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 2.6, stagger: { each: 0.18, from: "center" }, ease: "expo.out", clearProps: "filter" },
          1.9
        )
        .fromTo(q(".hero-meter"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1.8 }, 3.2)
        .fromTo(q(".hero-layer"), { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.2, stagger: 0.06 }, 3.2)
        .fromTo(q(".hero-step"), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.9, stagger: 0.35 }, 3.3);

      // ── Ambience: everything keeps breathing ─────────────────
      gsap.to(q(".hero-beam"), { rotate: 2.5, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 0%" });
      gsap.to(q(".hero-grid"), { opacity: 0.55, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
      gsap.to(q(".hero-halo"), { scale: 1.1, opacity: 0.7, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 4 });
      gsap
        .timeline({ repeat: -1, repeatDelay: 6, delay: 7 })
        .fromTo(q(".hero-shine"), { backgroundPositionX: "130%" }, { backgroundPositionX: "-30%", duration: 1.6, stagger: 0.12, ease: "sine.inOut" });
      gsap.to(q(".hero-caret"), { autoAlpha: 0, duration: 0.55, ease: "steps(1)", repeat: -1, yoyo: true });
      gsap.to(q(".hero-pulse"), { scale: 1.8, autoAlpha: 0.3, duration: 1.1, ease: "sine.inOut", repeat: -1, yoyo: true });
      q(".hero-pool").forEach((pool, i) => {
        gsap.to(pool, {
          x: () => gsap.utils.random(-120, 120),
          y: () => gsap.utils.random(-60, 60),
          scale: () => gsap.utils.random(0.85, 1.2),
          duration: 10 + i * 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
        });
      });
      q(".hero-float").forEach((card, i) => {
        gsap.to(card, { y: i === 1 ? -12 : -9, rotate: i === 0 ? -0.6 : i === 2 ? 0.6 : 0, duration: 4 + i * 0.8, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3.5 + i * 0.5 });
      });

      // ── Pointer: the fan and the light lean toward the cursor ──
      if (fine) {
        const fan = q(".hero-fan")[0];
        const rx = gsap.quickTo(fan, "rotationX", { duration: 1.4, ease: "power3" });
        const ry = gsap.quickTo(fan, "rotationY", { duration: 1.4, ease: "power3" });
        const bx = gsap.quickTo(q(".hero-beam-wrap")[0], "x", { duration: 2.2, ease: "power3" });
        onMove = (e: PointerEvent) => {
          const u = e.clientX / window.innerWidth - 0.5;
          const v = e.clientY / window.innerHeight - 0.5;
          ry(u * 9);
          rx(-v * 5);
          bx(u * 70);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
      }

      // ── Scroll: the fan parts, the wordmark sinks back ──────
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } })
        .to(q(".hero-slot-0"), { x: -160, y: -40, rotate: -5 }, 0)
        .to(q(".hero-slot-2"), { x: 160, y: -40, rotate: 5 }, 0)
        .to(q(".hero-slot-1"), { y: -30, scale: 1.03 }, 0)
        .to(q(".hero-title"), { y: 70, autoAlpha: 0, scale: 0.96, duration: 0.6 }, 0)
        .to(q(".hero-beam-wrap"), { autoAlpha: 0, duration: 0.8 }, 0);
    }, el);

    return () => {
      if (onMove) window.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* ── Ambience — the midnight base fades out at the bottom into the page's light ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#05060f]"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%)",
        }}
      >
        {/* Drifting pools of light */}
        <div className="hero-pool absolute left-[8%] top-[18%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(152,192,239,0.16),transparent_65%)]" />
        <div className="hero-pool absolute right-[6%] top-[30%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(102,58,243,0.13),transparent_65%)]" />
        <div className="hero-pool absolute left-[calc(50%-45vh)] top-[52%] h-[60vh] w-[90vh] rounded-full bg-[radial-gradient(ellipse,rgba(53,96,255,0.16),transparent_65%)]" />

        {/* Blueprint grid, opening from the centre and breathing */}
        <div
          className="hero-grid absolute inset-0"
          style={
            {
              "--r": "75%",
              backgroundImage:
                "linear-gradient(rgba(186,215,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(186,215,247,0.06) 1px, transparent 1px)",
              backgroundSize: "88px 88px",
              backgroundPosition: "center top",
              WebkitMaskImage: "radial-gradient(ellipse var(--r) 70% at 50% 30%, #000 30%, transparent 100%)",
              maskImage: "radial-gradient(ellipse var(--r) 70% at 50% 30%, #000 30%, transparent 100%)",
            } as React.CSSProperties
          }
        />

        {/* Spotlight from above, swaying */}
        <div className="hero-beam-wrap absolute inset-x-0 top-0">
          <div
            className="hero-beam absolute left-1/2 top-0 h-[92vh] w-[160vw] -translate-x-1/2"
            style={{
              background:
                "conic-gradient(from 180deg at 50% -6%, transparent 43%, rgba(124,145,182,0.18) 47.5%, rgba(170,195,235,0.5) 50%, rgba(124,145,182,0.18) 52.5%, transparent 57%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 35%, transparent 92%)",
              maskImage: "linear-gradient(to bottom, #000 0%, #000 35%, transparent 92%)",
            }}
          />
        </div>

        <AmbientDust className="hero-dust absolute inset-0 h-full w-full" />
      </div>

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-5 pt-36 text-center sm:px-8 sm:pt-44">
        <div className="hero-title flex flex-col items-center will-change-transform">
          {/* Eyebrow */}
          <p className="flex items-center gap-4 font-mono text-[13px] uppercase tracking-[0.18em] text-[#c7d3ea] sm:text-[14px]">
            <span aria-hidden className="hero-eyebrow-line h-px w-16 origin-right bg-gradient-to-r from-transparent to-[rgba(186,215,247,0.32)] sm:w-24" />
            <span className="hero-eyebrow-text tabular-nums">Introducing</span>
            <span aria-hidden className="hero-eyebrow-line h-px w-16 origin-left bg-gradient-to-l from-transparent to-[rgba(186,215,247,0.32)] sm:w-24" />
          </p>

          {/* The wordmark — Eurostile Extended Bold (Michroma when it isn't installed) */}
          <div className="relative mt-8">
            <div
              aria-hidden
              className="hero-halo pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(ellipse at center, rgba(152,192,239,0.2), rgba(238,186,247,0.05) 45%, transparent 70%)" }}
            />
            <h1
              id="hero-title"
              className="relative flex font-[family-name:var(--font-wordmark)] text-[clamp(40px,11vw,160px)] font-bold uppercase leading-[1] tracking-[0.06em]"
              style={{ filter: "drop-shadow(0 0 6px rgba(186,207,247,0.32)) drop-shadow(0 0 26px rgba(238,186,247,0.14))" }}
            >
              {LETTERS.map((ch, i) => (
                <span key={i} aria-hidden className="hero-letter skywash inline-block will-change-transform" style={glyphStyle(ch)}>
                  {ch}
                </span>
              ))}
              <span className="sr-only">{site.name} — intelligence that runs on your machine</span>
              {/* Light passing slowly through the glass letters */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex"
              >
                {LETTERS.map((ch, i) => (
                  <span
                    key={i}
                    className="hero-shine inline-block"
                    style={{
                      ...glyphStyle(ch),
                      backgroundImage: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.8) 50%, transparent 65%)",
                      backgroundSize: "300% 100%",
                      backgroundPositionX: "130%",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </h1>
          </div>
        </div>

        {/* The ULTRON family, as glass */}
        <div aria-hidden inert className="relative mt-20 h-[620px] w-full [perspective:1600px] sm:mt-24">
          <div className="hero-fan relative h-full w-full [transform-style:preserve-3d]">
            {/* position (CSS) › slot (scroll) › card (arrival) › tilt (CSS) › float (loop) */}
            <div className="absolute left-1/2 top-14 hidden -translate-x-[calc(50%+340px)] lg:block">
              <div className="hero-slot-0">
                <div className="hero-card">
                  <div style={{ transform: "rotate(-7deg)" }}>
                    <div className="hero-float">
                      <ReflexCard />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-14 hidden -translate-x-[calc(50%-340px)] lg:block">
              <div className="hero-slot-2">
                <div className="hero-card">
                  <div style={{ transform: "rotate(7deg)" }}>
                    <div className="hero-float">
                      <HybridCard />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-0 z-10 origin-top -translate-x-1/2 scale-[0.86] sm:scale-100">
              <div className="hero-slot-1">
                <div className="hero-card">
                  <div className="hero-float">
                    <UltronCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
