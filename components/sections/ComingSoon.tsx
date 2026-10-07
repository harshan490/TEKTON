"use client";

import { useEffect, useState } from "react";
import GlyphOrb from "@/components/bg/GlyphOrb";
import DecryptedText from "@/components/reactbits/DecryptedText";
import Reveal from "@/components/ui/Reveal";
import { useMedia } from "@/hooks/useMedia";
import { MODEL_BRAND, site } from "@/config/site";

// Night side indigo → body blue → sunlit portal-blue; only the hottest glyphs go white.
const ORB_COLORS: [string, string] = ["#1A2690", "#8FB8FF"];

function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(to).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [to]);
  if (left === null) return <span>&nbsp;</span>;
  const d = Math.floor(left / 864e5);
  const h = Math.floor((left / 36e5) % 24);
  const m = Math.floor((left / 6e4) % 60);
  const s = Math.floor((left / 1e3) % 60);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="tabular-nums">
      {d}d {p(h)}h {p(m)}m {p(s)}s
    </span>
  );
}

const FOOTER_LINKS = [
  { label: "X", href: site.socials.x },
  { label: "GitHub", href: site.socials.github },
  { label: "Hugging Face", href: site.socials.huggingface },
  { label: "Privacy", href: "#" },
];

/**
 * The door. A glyph planet turns in the dark with the TEKTON mark drawn into
 * its face; the status sits beneath it.
 */
export default function ComingSoon() {
  const mobile = useMedia("(max-width: 767px)");

  return (
    <section id="soon" aria-labelledby="soon-title" className="relative flex min-h-[100svh] flex-col bg-bg">
      {/* Melt the page's blue light into the dark the planet lives in. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-48 h-48 bg-gradient-to-b from-transparent to-bg" />
      {/* The orb owns the first screen of this section; the copy rises over its dark side. */}
      <div className="absolute inset-x-0 top-0 h-[100svh]" aria-hidden>
        <GlyphOrb
          className="h-full w-full"
          colors={ORB_COLORS}
          midColor="#3560FF"
          backgroundColor="#05070B"
          logoSrc="/tekton-mark.png"
          logoScale={0.46}
          glyphSize={mobile ? 8 : 9}
          size={mobile ? 0.82 : 0.66}
          centerY={mobile ? 0.32 : 0.39}
          tilt={-24}
          bands={9}
          lightAngle={-35}
          lightHeight={0.62}
          rim={0.8}
          atmosphere={0.7}
        />
        {/* Fade the planet's lower half into the page so the copy reads. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-b from-transparent via-bg/80 to-bg" />
      </div>

      <div className="pointer-events-none relative flex-1 min-h-[58svh] md:min-h-[62svh]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-5 pb-16 text-center sm:px-8">
        <h2 id="soon-title" className="w-full">
          <DecryptedText
            text="COMING SOON"
            animateOn="view"
            sequential
            revealDirection="center"
            speed={45}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$0123456789"
            parentClassName="text-steel block text-[clamp(44px,10vw,140px)] font-semibold leading-[0.95] tracking-[0.08em]"
            encryptedClassName="text-ink-3"
          />
        </h2>

        <Reveal delay={0.1}>
          <p className="mt-6 text-[clamp(17px,1.6vw,20px)] text-ink-2">
            <span className="serif-accent text-[1.15em] text-portal">{MODEL_BRAND}</span> is in training.
          </p>
        </Reveal>

        <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.18em] text-ink-3">
          {site.launchDate ? (
            <>
              launch in <Countdown to={site.launchDate} />
            </>
          ) : (
            <>
              <span className="live-dot mr-2.5 align-middle" aria-hidden />
              status: training · run {site.runId}
            </>
          )}
        </p>
      </div>

      <footer className="relative z-10 border-t border-white/[0.07] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-5 text-[13px] text-ink-3 md:flex-row md:justify-between">
          <p>© 2026 {site.name}</p>
          <p className="serif-accent text-[17px] text-ink-2">{site.tagline}</p>
          <nav aria-label="Footer">
            <ul className="flex items-center gap-6">
              {FOOTER_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="nav-link relative transition-colors hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </section>
  );
}
