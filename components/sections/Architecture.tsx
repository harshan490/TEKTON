"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Move3d } from "lucide-react";
import BlurText from "@/components/reactbits/BlurText";
import Reveal, { SectionLabel } from "@/components/ui/Reveal";
import { LEARNING_LOOP, TIERS } from "@/config/content";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const LOOP_IDLE = "↺ learning loop · offline";
const LOOP_LIVE = "↺ ULTRON is teaching Reflex";

/* ───────────────────────── The model (floor units, px) ─────────────────────────
 * A 1120 × 640 blueprint floor. Each tier is an extruded block; height tells
 * the story (Rules low, ULTRON the tower). Routes are drawn on the floor.      */
const FLOOR_W = 1120;
const FLOOR_H = 640;

type BlockDef = { id: string; x: number; y: number; w: number; d: number; h: number; focus: number };
const BLOCKS: BlockDef[] = [
  { id: "rules", x: 120, y: 300, w: 110, d: 110, h: 34, focus: -14 },
  { id: "reflex", x: 360, y: 160, w: 140, d: 140, h: 86, focus: 4 },
  { id: "ultron", x: 600, y: 300, w: 170, d: 170, h: 178, focus: -26 },
  { id: "tools", x: 880, y: 150, w: 140, d: 140, h: 58, focus: 18 },
];
const center = (id: string) => {
  const b = BLOCKS.find((k) => k.id === id)!;
  return [b.x + b.w / 2, b.y + b.d / 2] as const;
};

const ROUTES = {
  in: "M0 355 H120",
  rulesReflex: "M230 355 H295 V230 H360",
  act: "M500 220 H880",
  reflexUltron: "M430 300 V385 H600",
  ultronTools: "M770 385 H950 V290",
  loop: "M685 470 V545 H400 V300",
};

// Packet waypoints for each simulated decision.
const FAST: [number, number][] = [[0, 355], [175, 355], [295, 355], [295, 230], [430, 230], [430, 220], [950, 220]];
const SLOW: [number, number][] = [[0, 355], [175, 355], [295, 355], [295, 230], [430, 230], [430, 385], [685, 385], [950, 385], [950, 220]];
const LOOP: [number, number][] = [[685, 385], [685, 545], [400, 545], [400, 300], [430, 230]];
const STOPS: Record<string, [number, number]> = {
  rules: [175, 355],
  reflex: [430, 230],
  ultron: [685, 385],
  tools: [950, 220],
};

const DECISIONS = [
  { q: "next track", conf: 0.98, slow: false },
  { q: "plan my week from these notes", conf: 0.41, slow: true },
  { q: "mute for an hour", conf: 0.94, slow: false },
  { q: "dim screen to 30%", conf: 0.92, slow: false },
  { q: "why did the build fail?", conf: 0.36, slow: true },
];

type Sel = string | null;

/* A block: five glass faces around a box, extruded by --h × --rise. */
function Block({ b, active, onEnter, onLeave }: { b: BlockDef; active: boolean; onEnter: () => void; onLeave: () => void }) {
  const H = "calc(var(--h) * var(--rise) * 1px)";
  const side =
    "absolute border border-[rgba(186,215,247,0.14)] bg-[linear-gradient(to_top,rgba(10,14,32,0.96),rgba(26,38,84,0.92))]";
  return (
    <div
      className="arch-block absolute"
      data-id={b.id}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={
        {
          left: b.x,
          top: b.y,
          width: b.w,
          height: b.d,
          transformStyle: "preserve-3d",
          "--h": b.h,
          "--g": 0,
        } as React.CSSProperties
      }
    >
      {/* Footprint shadow + light pool */}
      <div
        className="absolute -inset-6 rounded-[28px] transition-opacity duration-500"
        style={{
          background: "radial-gradient(closest-side, rgba(143,184,255,0.35), transparent)",
          opacity: active ? 0.9 : 0.25,
        }}
      />
      {/* north */}
      <div className={side} style={{ left: 0, width: "100%", top: `calc(-1 * ${H})`, height: H, transformOrigin: "bottom", transform: "rotateX(-90deg)" }} />
      {/* west */}
      <div className={side} style={{ top: 0, height: "100%", left: `calc(-1 * ${H})`, width: H, transformOrigin: "right", transform: "rotateY(90deg)" }} />
      {/* east */}
      <div className={cn(side, "bg-[linear-gradient(to_left,rgba(8,11,26,0.97),rgba(20,30,68,0.94))]")} style={{ top: 0, height: "100%", left: "100%", width: H, transformOrigin: "left", transform: "rotateY(-90deg)" }} />
      {/* south */}
      <div className={side} style={{ left: 0, width: "100%", top: "100%", height: H, transformOrigin: "top", transform: "rotateX(90deg)" }}>
        {/* window strips on the facade */}
        <div className="absolute inset-x-3 bottom-2 top-2 flex flex-col justify-end gap-1.5 opacity-60">
          {Array.from({ length: Math.max(1, Math.floor(b.h / 22)) }).map((_, i) => (
            <span key={i} className="h-px bg-gradient-to-r from-transparent via-[rgba(186,215,247,0.45)] to-transparent" />
          ))}
        </div>
      </div>
      {/* Light column rising from the selected building — two crossed planes, visible from any angle */}
      {[0, 90].map((r) => (
        <div
          key={r}
          className="pointer-events-none absolute left-[15%] w-[70%] transition-opacity duration-700"
          style={{
            top: "calc(50% - 300px)",
            height: 300,
            transformOrigin: "bottom center",
            transform: `translateZ(${H}) rotateZ(${r}deg) rotateX(-90deg)`,
            background: "linear-gradient(to top, rgba(143,184,255,0.55), rgba(143,184,255,0.12) 45%, transparent)",
            opacity: active ? 1 : 0,
          }}
        />
      ))}
      {/* top */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[3px] border border-[rgba(216,236,248,0.35)]"
        style={{
          transform: `translateZ(${H})`,
          background: "linear-gradient(135deg, rgba(60,84,160,0.95), rgba(22,32,72,0.96))",
          boxShadow: "inset 0 0 24px rgba(168,216,245,0.15)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(216,236,248,0.95), rgba(143,184,255,0.55) 45%, transparent 75%)", opacity: "var(--g)" }} />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ background: "linear-gradient(135deg, rgba(143,184,255,0.55), rgba(53,96,255,0.25))", opacity: active ? 1 : 0 }}
        />
        {b.id === "tools" && (
          <div className="absolute inset-4 grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((k) => (
              <span key={k} className="rounded-[2px] border border-[rgba(216,236,248,0.3)] bg-[rgba(10,14,32,0.5)]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* A label floating above a block, always turned to face the camera. */
function Billboard({ b, i, active, onSelect }: { b: BlockDef; i: number; active: boolean; onSelect: () => void }) {
  const t = TIERS.find((k) => k.id === b.id)!;
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onSelect}
      onPointerEnter={onSelect}
      className={cn(
        "arch-label absolute whitespace-nowrap rounded-xl px-3 py-2 text-left transition-[background-color,box-shadow] duration-300",
        active
          ? "bg-[rgba(40,58,120,0.85)] shadow-[inset_0_0_0_1px_rgba(216,236,248,0.5),0_0_30px_-4px_rgba(143,184,255,0.7)]"
          : "bg-[rgba(8,12,28,0.78)] shadow-[inset_0_0_0_1px_rgba(186,215,247,0.18)]"
      )}
      style={{
        left: b.x + b.w / 2,
        top: b.y + b.d / 2,
        translate: "-50% -50%",
        transform:
          "translateZ(calc(var(--h) * var(--rise) * 1px + 54px)) rotateZ(calc(-1 * (var(--spin) + var(--dspin) + var(--drift)))) rotateX(calc(-1 * (var(--tilt) + var(--dtilt))))",
        ["--h" as string]: b.h,
      }}
    >
      <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#9da7ba]">tier {i}</span>
      <span className="block text-[15px] font-semibold tracking-[-0.01em] text-white">{t.name}</span>
      <span className="block font-mono text-[11px] text-[#98c0ef]">{t.latency}</span>
    </button>
  );
}

export default function Architecture() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLSpanElement>(null);
  const [sel, setSel] = useState<Sel>(null);
  const [scale, setScale] = useState(1);
  const hover = useRef<Sel>(null);

  // Fit the 1120-wide model to the stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, (e.contentRect.width - 24) / 1180)));
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  // Camera: focus the selected tier.
  const focus = useCallback((id: Sel) => {
    const world = worldRef.current;
    if (!world) return;
    const b = BLOCKS.find((k) => k.id === id);
    gsap.to(world, {
      "--dspin": `${b ? b.focus : 0}deg`,
      "--dtilt": `${b ? -6 : 0}deg`,
      duration: 1.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, []);

  const select = useCallback(
    (id: Sel) => {
      setSel(id);
      if (id !== "loop") focus(id);
    },
    [focus]
  );

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const world = worldRef.current;
    const stage = stageRef.current;
    if (!section || !world || !stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(world);

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(world, { "--tilt": "56deg", "--spin": "-32deg", "--rise": 1 });
        return;
      }

      // ── Blueprint → building: the camera tilts in and the blocks rise as you scroll in ──
      gsap.fromTo(
        world,
        { "--tilt": "0deg", "--spin": "0deg", "--rise": 0.02 },
        {
          "--tilt": "56deg",
          "--spin": "-32deg",
          "--rise": 1,
          ease: "none",
          scrollTrigger: { trigger: stage, start: "top 85%", end: "center 55%", scrub: 0.9 },
        }
      );
      gsap.fromTo(q(".arch-route"), { strokeDashoffset: 1 }, {
        strokeDashoffset: 0,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: { trigger: stage, start: "top 80%", end: "top 30%", scrub: 0.9 },
      });

      // Idle drift — the model turns a few degrees, slowly, forever.
      gsap.fromTo(world, { "--drift": "-5deg" }, { "--drift": "5deg", duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // ── Live traffic: simulated decisions travelling the routes ──
      const packet = q(".arch-packet")[0];
      const echo = q(".arch-echo")[0];
      const flash = (id: string) => {
        const blk = q(`.arch-block[data-id="${id}"]`)[0];
        if (blk) gsap.fromTo(blk, { "--g": 1 }, { "--g": 0, duration: 1.4, ease: "power2.out", overwrite: "auto" });
      };
      const lit = (keys: string[]) =>
        q(".arch-route-live").forEach((p) => p.classList.toggle("is-on", keys.includes(p.getAttribute("data-k") ?? "")));

      let n = 0;
      let running: gsap.core.Timeline | null = null;
      const run = () => {
        const d = DECISIONS[n++ % DECISIONS.length];
        const pts = d.slow ? SLOW : FAST;
        const tl = gsap.timeline({ onComplete: () => void gsap.delayedCall(0.9, run) });
        running = tl;
        tl.set(packet, { x: pts[0][0], y: pts[0][1], autoAlpha: 1 })
          .call(() => {
            lit(d.slow ? ["in", "rulesReflex", "reflexUltron", "ultronTools"] : ["in", "rulesReflex", "act"]);
            if (tickerRef.current)
              tickerRef.current.textContent = `"${d.q}" · reflex conf ${d.conf.toFixed(2)} → ${d.slow ? "ultron" : "act"}`;
          });
        for (let i = 1; i < pts.length; i++) {
          const [x, y] = pts[i];
          const [px, py] = pts[i - 1];
          const dist = Math.hypot(x - px, y - py);
          const inUltron = d.slow && i >= 7;
          tl.to(packet, { x, y, duration: dist / (inUltron ? 420 : 620), ease: "none" });
          const stop = Object.entries(STOPS).find(([, s]) => s[0] === x && s[1] === y);
          if (stop) {
            tl.call(() => flash(stop[0]));
            if (stop[0] === "ultron") tl.to({}, { duration: 0.6 }); // a moment of thought
          }
        }
        tl.to(packet, { autoAlpha: 0, duration: 0.3 });
        if (d.slow) {
          // The answer becomes tomorrow's training data: an echo around the learning loop.
          // While it travels, the loop's label says what is actually happening.
          const label = q(".arch-loop-label")[0];
          tl.set(echo, { x: LOOP[0][0], y: LOOP[0][1], autoAlpha: 0.9 }, "-=0.2")
            .call(() => lit(["loop"]))
            .to(label, { duration: 0.9, scrambleText: { text: LOOP_LIVE, chars: "lowerCase", speed: 0.6 }, fill: "#d8ecf8", ease: "none" }, "<");
          for (let i = 1; i < LOOP.length; i++) {
            const dist = Math.hypot(LOOP[i][0] - LOOP[i - 1][0], LOOP[i][1] - LOOP[i - 1][1]);
            tl.to(echo, { x: LOOP[i][0], y: LOOP[i][1], duration: dist / 380, ease: "none" });
          }
          tl.call(() => flash("reflex"))
            .to(echo, { autoAlpha: 0, duration: 0.3 })
            .to(label, { duration: 0.9, scrambleText: { text: LOOP_IDLE, chars: "lowerCase", speed: 0.6 }, fill: "rgba(157,167,186,0.9)", ease: "none" }, "+=0.6");
        }
      };
      ScrollTrigger.create({
        trigger: stage,
        start: "top 70%",
        end: "bottom top",
        onEnter: () => run(),
        onEnterBack: () => running?.resume(),
        onLeave: () => running?.pause(),
        once: false,
      });
    }, world);

    // ── Drag to orbit ──
    let drag: { x: number; y: number; s: number; t: number } | null = null;
    const readDeg = (v: string) => parseFloat(getComputedStyle(world).getPropertyValue(v)) || 0;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      drag = { x: e.clientX, y: e.clientY, s: readDeg("--dspin"), t: readDeg("--dtilt") };
      stage.setPointerCapture(e.pointerId);
      stage.dataset.dragging = "";
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      // Grab-and-turn: the model follows the pointer (drag left → it turns left).
      const s = drag.s - (e.clientX - drag.x) * 0.25;
      const t = Math.max(-40, Math.min(14, drag.t - (e.clientY - drag.y) * 0.15));
      gsap.to(world, { "--dspin": `${s}deg`, "--dtilt": `${t}deg`, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    };
    const up = () => {
      drag = null;
      delete stage.dataset.dragging;
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);

    return () => {
      ctx.revert();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, []);

  const info = sel === "loop" ? { name: LEARNING_LOOP.name, role: LEARNING_LOOP.role, latency: LEARNING_LOOP.latency } : TIERS.find((t) => t.id === sel);
  const tabs = [...TIERS.map((t) => ({ id: t.id, name: t.name })), { id: "loop", name: "Loop" }];

  return (
    <section id="architecture" ref={sectionRef} aria-label="Architecture" className="relative px-5 py-32 sm:px-8 sm:py-40 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <Reveal className="flex justify-center">
          <SectionLabel index="03">architecture</SectionLabel>
        </Reveal>
        <BlurText
          as="h2"
          segments={[{ text: "Fast intuition." }, { text: "Slow thought.", className: "serif-accent text-portal" }]}
          delay={80}
          stepDuration={0.7}
          animationFrom={{ filter: "blur(12px)", opacity: 0, y: 24 }}
          animationTo={[{ filter: "blur(0px)", opacity: 1, y: 0 }]}
          className="mt-5 justify-center text-center text-[clamp(36px,4.6vw,56px)] font-semibold leading-[1] tracking-[-0.035em] text-ink"
        />

        {/* ── The 3D stage ── */}
        <div
          ref={stageRef}
          className="group/stage relative mt-12 h-[clamp(440px,58vw,700px)] cursor-grab touch-pan-y select-none data-[dragging]:cursor-grabbing"
        >
          <div aria-hidden className="absolute inset-0 [perspective:1900px] [perspective-origin:50%_30%]">
            <div
              ref={worldRef}
              className="absolute left-1/2 top-[52%]"
              style={
                {
                  width: FLOOR_W,
                  height: FLOOR_H,
                  marginLeft: -FLOOR_W / 2,
                  marginTop: -FLOOR_H / 2,
                  transformStyle: "preserve-3d",
                  "--tilt": "56deg",
                  "--spin": "-32deg",
                  "--dtilt": "0deg",
                  "--dspin": "0deg",
                  "--drift": "0deg",
                  "--rise": 1,
                  transform: `scale(${scale}) rotateX(calc(var(--tilt) + var(--dtilt))) rotateZ(calc(var(--spin) + var(--dspin) + var(--drift)))`,
                } as React.CSSProperties
              }
            >
              {/* Blueprint floor */}
              <div
                className="absolute inset-0 rounded-[28px]"
                style={{
                  background:
                    "radial-gradient(ellipse at 55% 50%, rgba(53,96,255,0.16), transparent 70%), linear-gradient(rgba(186,215,247,0.07) 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, rgba(186,215,247,0.07) 1px, transparent 1px) 0 0 / 40px 40px, rgba(6,9,22,0.55)",
                  boxShadow: "inset 0 0 0 1px rgba(186,215,247,0.14), 0 0 120px -20px rgba(53,96,255,0.45)",
                  WebkitMaskImage: "radial-gradient(ellipse 75% 80% at 50% 50%, #000 55%, transparent 100%)",
                  maskImage: "radial-gradient(ellipse 75% 80% at 50% 50%, #000 55%, transparent 100%)",
                }}
              />

              {/* Routes on the floor */}
              <svg viewBox={`0 0 ${FLOOR_W} ${FLOOR_H}`} className="absolute inset-0 h-full w-full overflow-visible" style={{ transform: "translateZ(1px)" }}>
                {Object.entries(ROUTES).map(([k, d]) => (
                  <g key={k}>
                    <path
                      className="arch-route"
                      d={d}
                      pathLength={k === "loop" ? undefined : 1}
                      strokeDasharray={k === "loop" ? undefined : "1"}
                      fill="none"
                      stroke={k === "loop" ? "rgba(186,215,247,0.3)" : "rgba(186,215,247,0.32)"}
                      strokeWidth={2}
                      style={k === "loop" ? { strokeDasharray: "6 8" } : undefined}
                    />
                    <path className="arch-route-live" data-k={k} d={d} fill="none" stroke="#8FB8FF" strokeWidth={3} strokeDasharray="4 10" />
                  </g>
                ))}
                <text x={20} y={340} fill="rgba(157,167,186,0.9)" fontSize={13} className="font-mono" letterSpacing="0.08em">request</text>
                <text x={640} y={208} fill="rgba(157,167,186,0.9)" fontSize={13} className="font-mono" letterSpacing="0.08em">confident → act</text>
                <text x={470} y={375} fill="rgba(157,167,186,0.9)" fontSize={13} className="font-mono" letterSpacing="0.08em">low conf.</text>
                <text x={470} y={570} fill="rgba(157,167,186,0.9)" fontSize={13} className="arch-loop-label font-mono" letterSpacing="0.08em">{LOOP_IDLE}</text>
              </svg>

              {/* Packets */}
              <div className="arch-packet invisible absolute left-0 top-0 -ml-[7px] -mt-[7px] h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_12px_4px_rgba(143,184,255,0.9),0_0_36px_10px_rgba(53,96,255,0.6)]" style={{ transform: "translateZ(10px)" }} />
              <div className="arch-echo invisible absolute left-0 top-0 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-[#98c0ef] shadow-[0_0_14px_4px_rgba(152,192,239,0.7)]" style={{ transform: "translateZ(8px)" }} />

              {/* Buildings */}
              {BLOCKS.map((b) => (
                <Block
                  key={b.id}
                  b={b}
                  active={sel === b.id}
                  onEnter={() => {
                    hover.current = b.id;
                    select(b.id);
                  }}
                  onLeave={() => (hover.current = null)}
                />
              ))}

              {/* Labels */}
              {BLOCKS.map((b, i) => (
                <Billboard key={b.id} b={b} i={i} active={sel === b.id} onSelect={() => select(b.id)} />
              ))}
            </div>
          </div>

          {/* ── HUD ── */}
          <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3">
            <Move3d className="h-3.5 w-3.5" strokeWidth={1.5} /> drag to orbit
          </div>
          <div className="pointer-events-none absolute right-0 top-0 hidden max-w-[52%] items-center gap-2 truncate font-mono text-[10.5px] text-ink-3 sm:flex">
            <span className="live-dot shrink-0" />
            <span ref={tickerRef} className="truncate">routing…</span>
            <span className="shrink-0 uppercase tracking-[0.16em] text-ink-3/70">· simulated</span>
          </div>
        </div>

        {/* ── Tier selector + info ── */}
        <div className="mt-4 flex flex-col items-center gap-5">
          <div role="tablist" aria-label="Tiers" className="flex flex-wrap justify-center gap-2">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={sel === t.id}
                onClick={() => select(t.id)}
                onFocus={() => select(t.id)}
                className={cn(
                  "frost-pill !px-4 !py-2 !text-[13px]",
                  sel === t.id ? "!bg-[rgba(143,184,255,0.22)] !shadow-[inset_0_0_0_1px_rgba(216,236,248,0.45),0_0_24px_-6px_rgba(143,184,255,0.7)]" : "frost-pill-outline"
                )}
              >
                <span className="font-mono text-[10px] text-ink-3">{t.id === "loop" ? "↺" : `0${i}`}</span>
                {t.name}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="min-h-[86px] w-full max-w-[520px]">
            {info ? (
              <div key={sel} className="glass-plate animate-[arch-in_0.45s_cubic-bezier(0.22,1,0.36,1)] px-5 py-4 text-left">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[16px] font-semibold text-white">{info.name}</span>
                  <span className="font-mono text-[12px] text-[#98c0ef]">
                    {info.latency} {info.latency.startsWith("<") && <span className="text-ink-3">target</span>}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] leading-[1.55] text-[#c7d3ea]">{info.role}</p>
              </div>
            ) : (
              <p className="pt-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">select a tier, or hover a building</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
