import { Check, Layers, Zap } from "lucide-react";
import { MODELS, type Model } from "@/config/content";

/*
 * The hero fan: the ULTRON family as glass cards — ULTRON-1 in the centre,
 * Reflex and ULTRON-H either side. Decorative (the parent marks them
 * aria-hidden + inert); every number shown is a target.
 */

const byId = (id: string) => MODELS.find((m) => m.id === id) as Model;

function Status({ model }: { model: Model }) {
  return (
    <span className="frost-badge gap-1.5 uppercase tracking-[0.12em]">
      {model.status === "in training" && <span className="live-dot !h-[5px] !w-[5px]" />}
      {model.status}
    </span>
  );
}

function Metrics({ model }: { model: Model }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {model.metrics.map((m) => (
        <div key={m.label}>
          <p className="font-mono text-[15px] tabular-nums text-[#d8ecf8]">
            {m.prefix}
            {m.value}
            {m.suffix}
            {m.unit && <span className="ml-0.5 text-[10px] text-[#9da7ba]">{m.unit}</span>}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-[#9da7ba]">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

function Name({ children, size = "text-[15px]" }: { children: React.ReactNode; size?: string }) {
  return <p className={`font-[family-name:var(--font-wordmark)] ${size} font-bold tracking-[0.06em] text-white`}>{children}</p>;
}

/** Left: ULTRON Reflex — one forward pass, one decision. */
export function ReflexCard() {
  const m = byId("reflex");
  return (
    <div className="glass-plate shimmer w-[300px] p-5 text-left">
      <div className="flex items-center gap-3">
        <span className="frost-tile h-9 w-9">
          <Zap className="h-4 w-4 text-[#d1e4fa]" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <Name size="text-[12.5px]">{m.name}</Name>
          <p className="text-[11px] text-[#9da7ba]">{m.kind}</p>
        </div>
        <Status model={m} />
      </div>

      <div className="frost-input mt-5 px-3 py-2.5 text-[12px] text-[#c7d3ea]">mute notifications for an hour</div>
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-[#9da7ba]">decision</span>
        <span className="font-mono text-[#d1e4fa]">action.mute(60m)</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[12px]">
        <span className="text-[#9da7ba]">confidence</span>
        <span className="relative ml-auto h-1 w-20 overflow-hidden rounded-full bg-[rgba(199,211,234,0.12)]">
          <span className="hero-meter absolute inset-y-0 left-0 w-[94%] rounded-full bg-gradient-to-r from-[#98c0ef] to-[#d8ecf8]" />
        </span>
        <span className="font-mono text-[#d1e4fa]">0.94</span>
      </div>

      <div className="mt-5 border-t border-[rgba(186,215,247,0.08)] pt-4">
        <Metrics model={m} />
      </div>
    </div>
  );
}

/** Centre: ULTRON-1 — reasoning and tools, mid-thought. */
export function UltronCard() {
  const m = byId("u1");
  const steps = ["read 3 notes", "draft the week", "schedule with tools"];
  return (
    <div className="deep-glass shimmer w-[380px] p-7 text-left">
      <div className="flex items-center gap-3">
        <span className="frost-tile h-11 w-11">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tekton-mark.png" alt="" className="h-6 w-6 object-contain" />
        </span>
        <div className="flex-1">
          <Name size="text-[17px]">{m.name}</Name>
          <p className="text-[11.5px] text-[#9da7ba]">{m.kind}</p>
        </div>
        <Status model={m} />
      </div>

      <div className="frost-input mt-6 px-3.5 py-3 text-[13px] text-[#d1e4fa]">
        plan my week from these notes
        <span className="hero-caret ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-[#d1e4fa]" />
      </div>

      <ul className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s} className="hero-step flex items-center gap-2.5 text-[12.5px] text-[#c7d3ea]">
            <span
              className={`grid h-4 w-4 place-items-center rounded-full ${i < 2 ? "bg-[rgba(152,192,239,0.25)]" : "shadow-[inset_0_0_0_1px_rgba(186,215,247,0.3)]"}`}
            >
              {i < 2 ? (
                <Check className="h-2.5 w-2.5 text-[#d8ecf8]" strokeWidth={2.5} />
              ) : (
                <span className="hero-pulse h-1.5 w-1.5 rounded-full bg-[#98c0ef]" />
              )}
            </span>
            {s}
            {i === 2 && <span className="hero-dots ml-auto font-mono text-[11px] text-[#9da7ba]">thinking…</span>}
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-[rgba(186,215,247,0.08)] pt-5">
        <Metrics model={m} />
        <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#9da7ba]">
          targets · {m.credit?.toLowerCase()}
        </p>
      </div>
    </div>
  );
}

/** Right: ULTRON-H — sealed until publication; soft bars that never resolve into a spec. */
export function HybridCard() {
  const m = byId("uh");
  const bars = [44, 70, 52, 86, 60, 76, 48, 66];
  return (
    <div className="glass-plate shimmer w-[300px] p-5 text-left">
      <div className="flex items-center gap-3">
        <span className="frost-tile h-9 w-9">
          <Layers className="h-4 w-4 text-[#d1e4fa]" strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <Name size="text-[12.5px]">{m.name}</Name>
          <p className="text-[11px] text-[#9da7ba]">{m.kind}</p>
        </div>
        <Status model={m} />
      </div>

      <div className="mt-5 flex h-14 items-end gap-1.5">
        {bars.map((p, i) => (
          <span key={i} className="hero-layer flex h-full flex-1 flex-col justify-end">
            <span
              className="block w-full origin-bottom animate-[sealed_3s_ease-in-out_infinite] rounded-[4px] bg-gradient-to-t from-[rgba(152,192,239,0.18)] to-[rgba(216,236,248,0.45)] shadow-[inset_0_0_0_1px_rgba(186,215,247,0.12)]"
              style={{ height: `${p}%`, animationDelay: `${i * 0.2}s` }}
            />
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[rgba(186,215,247,0.08)] pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c7d3ea]">{m.note}</span>
        <span className="frost-badge">sealed</span>
      </div>
    </div>
  );
}
