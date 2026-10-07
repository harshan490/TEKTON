"use client";

import CircularCarousel from "@/components/reactbits/CircularCarousel";
import BlurText from "@/components/reactbits/BlurText";
import Reveal, { SectionLabel } from "@/components/ui/Reveal";
import { MODELS, type Model } from "@/config/content";
import { MODEL_BRAND } from "@/config/site";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<Model["status"], string> = {
  next: "border-white/20 text-ink-2",
  "in training": "border-accent/50 text-accent",
  research: "border-portal/30 text-portal/85",
};

/** One model as a card face for the ring — name, status, three targets. */
function ModelFace({ model, index, w, h }: { model: Model; index: number; w: number; h: number }) {
  return (
    <div
      className="shimmer relative flex flex-col overflow-hidden rounded-[22px] border border-white/[0.14] p-6 text-left"
      style={{
        width: w,
        height: h,
        background:
          "radial-gradient(120% 70% at 20% 0%, rgba(53,96,255,0.42), transparent 60%), radial-gradient(90% 60% at 100% 100%, rgba(26,38,144,0.75), transparent 70%), linear-gradient(180deg, #0C1434 0%, #070A17 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-[0.2em] text-ink-3">0{index + 1}</span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
            STATUS_STYLE[model.status]
          )}
        >
          {model.status}
        </span>
      </div>

      <h3 className="text-steel mt-auto text-[34px] font-semibold leading-none tracking-[-0.035em]">{model.name}</h3>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">{model.kind}</p>

      {model.note && !model.metrics.length ? (
        <div className="mt-6 border-t border-white/[0.1] pt-5">
          {/* A sealed panel instead of numbers: soft bars that never resolve into a spec */}
          <div className="flex h-10 items-end gap-1.5">
            {[38, 64, 46, 80, 52, 70, 44, 60].map((p, k) => (
              <span
                key={k}
                className="flex-1 origin-bottom animate-[sealed_2.8s_ease-in-out_infinite] rounded-[3px] bg-gradient-to-t from-[rgba(152,192,239,0.15)] to-[rgba(216,236,248,0.35)]"
                style={{ height: `${p}%`, animationDelay: `${k * 0.18}s` }}
              />
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">{model.note}</p>
        </div>
      ) : (
      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.1] pt-5">
        {model.metrics.map((m) => (
          <div key={m.label}>
            <dt className="sr-only">{m.label}</dt>
            <dd className="font-mono text-[20px] font-medium tabular-nums tracking-[-0.02em] text-ink">
              {m.prefix && <span className="text-ink-2">{m.prefix}</span>}
              {m.value}
              {m.suffix}
              {m.unit && <span className="ml-0.5 text-[11px] text-ink-2">{m.unit}</span>}
            </dd>
            <dd className="mt-1 text-[10.5px] leading-snug text-ink-3">{m.label}</dd>
          </div>
        ))}
      </dl>
      )}
      {model.metrics.length > 0 && (
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
          targets{model.credit ? ` · ${model.credit}` : ""}
        </p>
      )}
    </div>
  );
}

/** The model family on a 3D ring. Drag it, or let it drift. */
export default function Models() {
  // One card size everywhere: the ring scales itself to fit its container, so a
  // phone-specific size (picked after load) would only remount it and jump.
  const W = 320;
  const H = Math.round(W / 0.78);

  const items = MODELS.map((m, i) => ({
    title: m.name,
    subtitle: m.status,
    alt: `${m.name} — ${m.kind}`,
    content: <ModelFace model={m} index={i} w={W} h={H} />,
  }));

  return (
    <section id="models" aria-labelledby="models-title" className="relative py-28 sm:py-36">
      <Reveal as="header" className="flex flex-col items-center gap-5 px-5 text-center">
        <SectionLabel index="02">model family</SectionLabel>
        <BlurText
          as="h2"
          segments={[{ text: "Meet" }, { text: `${MODEL_BRAND}.`, className: "serif-accent text-portal" }]}
          delay={80}
          stepDuration={0.7}
          animationFrom={{ filter: "blur(12px)", opacity: 0, y: 24 }}
          animationTo={[{ filter: "blur(0px)", opacity: 1, y: 0 }]}
          className="justify-center text-[clamp(36px,4.6vw,56px)] font-semibold leading-[1] tracking-[-0.035em] text-ink"
        />
      </Reveal>

      <div className="relative mx-auto mt-6 h-[min(680px,82svh)] w-full max-w-[1320px] text-ink">
        <CircularCarousel
          items={items}
          preset="orbit"
          intro="rise"
          cardWidth={W}
          aspectRatio={0.78}
          gap={40}
          speed={9}
          parallax={0.45}
          depthFade={0.7}
          fadeColor="#05070B"
          cornerRadius={22}
          captions
          ariaLabel={`${MODEL_BRAND} models`}
        />
      </div>
    </section>
  );
}
