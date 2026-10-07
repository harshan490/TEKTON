"use client";

import { Cpu, Gauge, Ruler } from "lucide-react";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import Reveal, { SectionLabel } from "@/components/ui/Reveal";

const MISSION =
  "Intelligence shouldn't live in someone else's data centre. We build models that run on *your* *machine* — instant for the everyday, **deliberate** only when it matters.";

const PILLARS = [
  { icon: Cpu, title: "Local first", body: "Your data stays on your device." },
  { icon: Gauge, title: "Real-time", body: "Milliseconds per decision." },
  { icon: Ruler, title: "Measured", body: "Every number has a run ID." },
];

export default function Mission() {
  return (
    <section id="mission" aria-label="Mission" className="relative px-5 pb-32 pt-10 sm:px-8 sm:pb-44 lg:px-10">
      <div className="relative mx-auto max-w-[1000px]">
        <Reveal className="flex justify-center">
          <SectionLabel index="01">mission</SectionLabel>
        </Reveal>

        <ScrollReveal
          as="p"
          baseOpacity={0.1}
          baseRotation={2}
          blurStrength={8}
          containerClassName="mx-auto mt-12 max-w-[880px] text-center"
          textClassName="text-[clamp(26px,3.4vw,44px)] font-medium leading-[1.25] tracking-[-0.025em] text-ink-2"
          accentClassName="serif-accent text-portal"
        >
          {MISSION}
        </ScrollReveal>

        <ul className="mt-24 grid gap-4 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={i * 0.1}>
              <SpotlightCard className="glass-deep shimmer group h-full transition-transform duration-500 ease-out-expo hover:-translate-y-1.5">
                <span
                  className="grid h-10 w-10 animate-[float_5s_ease-in-out_infinite] place-items-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-500 group-hover:border-accent/40"
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <Icon className="h-[18px] w-[18px] text-portal transition-transform duration-500 group-hover:scale-110" strokeWidth={1.6} />
                </span>
                <h3 className="mt-8 text-[21px] font-semibold tracking-[-0.02em] text-ink">{title}</h3>
                <p className="mt-1.5 text-[15px] text-ink-2">{body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
