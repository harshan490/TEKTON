# TEKTON AGI — landing site

Single-page site for TEKTON AGI and its first model family (codename **ULTRON**, swappable via
`MODEL_BRAND` in `config/site.ts`). A frosted-glass first screen (an ambient, illuminated wordmark over the ULTRON family as glass cards), a drifting blue gradient, the model family on a 3D ring, an interactive architecture
diagram, and a Coming Soon ending with a hand-built ASCII planet carrying the TEKTON mark.

```powershell
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Motion (`motion/react`) · Lenis ·
React Bits (shadcn CLI, TS + Tailwind) · GSAP (pulled in by React Bits ScrollReveal) · lucide-react ·
Geist Sans / Geist Mono / Instrument Serif via `next/font`.

## Page

| # | Section | File |
|---|---|---|
| 1 | Minimal top bar — appears once the first screen is behind you | `components/nav/Nav.tsx` |
| 2 | Hero — ambient frosted glass: breathing grid, swaying spotlight, drifting light pools, rising dust (`components/hero/AmbientDust.tsx`); the TEKTON wordmark in Eurostile Extended Bold; the ULTRON family as a fan of glass cards (`components/hero/GlassCards.tsx`) | `components/sections/Hero.tsx` |
| 3 | Mission — scroll-revealed paragraph + three glass cards | `components/sections/Mission.tsx` |
| 4 | Models — React Bits CircularCarousel (orbit) of model cards | `components/sections/Models.tsx` |
| 5 | Architecture — hover a tier to light its path; lines draw on scroll | `components/sections/Architecture.tsx` |
| 6 | Research principles + "built on open science" loop | `components/sections/Principles.tsx` |
| 7 | Coming Soon — Glyph Orb, status line, footer | `components/sections/ComingSoon.tsx` |

Copy and numbers live in `config/content.ts`; brand strings, launch date and socials in
`config/site.ts`. **Every metric is a target** and is labelled so — keep it that way until a
benchmark run backs it. Setting `site.launchDate` (ISO string) swaps the status line for a live
countdown. The social links are `#` placeholders.

## Background

A fixed gradient in the Glyph Orb palette (`components/bg/GradientBackground.tsx`): indigo
`#1A2690`, body blue `#3560FF` and sunlit `#8FB8FF` as radial-gradient light drifting over
`#05070B` (CSS keyframes, transforms only), leaning slightly away from the pointer and sinking as
you scroll, plus film grain. The earlier moon-walk video background was removed at the owner's
request; its source stays in `_assets/`.
### Logo

The supplied logo is a JPEG on black (no transparency). The black was keyed out with ffmpeg:

```powershell
ffmpeg -i "_assets/tekton transparent.jpeg" -vf "colorkey=0x000000:0.07:0.10,format=rgba" public/tekton-logo.png
ffmpeg -i "_assets/tekton transparent.jpeg" -vf "crop=680:690:590:30,colorkey=0x000000:0.07:0.10,format=rgba" public/tekton-mark.png
```

A real transparent PNG export would give cleaner edges — drop it in `public/` under the same names.

## React Bits components

Installed with `npx shadcn@latest add https://reactbits.dev/r/<Name>-TS-TW` into
`components/reactbits/`. shadcn installs source you own; the adaptations are marked at the top
of each file.

| Component | Used for | Changes for TEKTON |
|---|---|---|
| BlurText | hero headline | `segments` (mixed sans/serif, forced line breaks), `as`, `start` gate |
| ShinyText | model names | — |
| Magnet | CTAs (≈25 % pull) | — |
| Noise | film grain | frames generated once and cycled (the original filled a 1024² ImageData every other frame) |
| GlassSurface | installed, currently unused | dark-only, SSR-safe, `frost` blur |
| ClickSpark | global click sparks | one viewport canvas, idle when no sparks, `useSparkBurst()` |
| DecryptedText | "COMING SOON" | screen readers get the final text, not the scramble |
| CountUp | model metrics | — |
| SpotlightCard | mission cards | glass surface, pointer via CSS variables |
| ScrollReveal | mission paragraph | `as`, `*accent*` / `**strong**` words, scoped GSAP cleanup |
| StarBorder | installed, currently unused | `innerClassName` |
| LogoLoop | "built on open science" (text marks only) | — (edges faded with a CSS mask) |
| CircularCarousel (JS + CSS) | model cards on an orbit ring | items may carry `content` (a React node) instead of `src`; `ariaLabel`; typed by `CircularCarousel.d.ts` |

**Hero styling** follows a midnight frosted-glass reference: `.frost-pill`, `.deep-glass`, `.glass-plate`, `.frost-input`, `.frost-badge`, `.frost-tile` and `.skywash` in `app/globals.css`. Wordmark face: **Eurostile Extended Bold** via `--font-wordmark` — used when installed on the visitor's machine (licensed font, not bundled); otherwise Michroma, a free face drawn after Eurostile Extended. To ship the real face, add the licensed file under `public/fonts/` and a `url()` source to the `@font-face` rules at the top of `app/globals.css`.

**Glyph Orb** (`components/bg/GlyphOrb.tsx`) is TEKTON's own build, modelled on the React Bits
Pro component of the same name (no Pro license needed): a canvas grid of glyphs shaded by sphere
lighting × cloud bands, drawn from a pre-rendered glyph atlas, capped at 30 fps and paused off
screen. It carves `logoSrc` into the planet in bright glyphs; the logo turns once per 20 s while
the pointer is over the planet, and the sun follows the pointer.

Removed after review: the glass dock nav (now a plain top bar) and the hero routing console.

## Notes

- Glass is CSS (`.glass` in `app/globals.css`, in `@layer components` so utilities can override
  it). A parent with a CSS `filter` cuts glass off from what's behind it, so reveals clear their
  blur when they finish.
- `next.config.ts` pins the Turbopack root: a stray `package-lock.json` in the user folder
  otherwise makes Next guess the wrong workspace root.
- OneDrive: if an install or build fails with `EPERM`, pause OneDrive sync for this folder.
- `_assets/` (the source media) is git-ignored.
