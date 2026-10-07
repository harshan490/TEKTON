/**
 * Every brand string lives here. ULTRON is an internal codename — change
 * MODEL_BRAND and the whole site follows.
 */
export const MODEL_BRAND = "ULTRON";

export const site = {
  name: "TEKTON AGI",
  wordmark: "TEKTON",
  title: "TEKTON AGI — Intelligence that runs on your machine",
  description:
    "TEKTON AGI builds fast, local-first models that reason and act in real time on consumer hardware — no cloud, no per-token rent, no data leaving your device.",
  url: "https://tekton.ai",
  tagline: "Learn. Build. Beyond.",
  /** ISO date (e.g. "2026-12-01T00:00:00Z") shows a countdown; null shows the status line. */
  launchDate: null as string | null,
  launchLabel: "launching 2026",
  status: "models training",
  runId: "TK-U1-SFT-001",
  nav: [
    { label: "Mission", href: "#mission" },
    { label: MODEL_BRAND, href: "#models" },
    { label: "Architecture", href: "#architecture" },
    { label: "Research", href: "#research" },
  ],
  socials: {
    x: "#",
    github: "#",
    huggingface: "#",
  },
} as const;
