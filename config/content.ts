import { MODEL_BRAND } from "./site";

/**
 * Page copy and numbers. Every metric here is a TARGET until a benchmark run
 * exists — the UI labels them "target" and must keep doing so.
 */

export type Metric = {
  value: number;
  prefix?: string;
  suffix?: string;
  unit: string;
  label: string;
};

export type Model = {
  id: string;
  name: string;
  kind: string;
  status: "next" | "in training" | "research";
  summary: string;
  credit?: string;
  /** Shown instead of metrics when a model's numbers are not public yet. */
  note?: string;
  metrics: Metric[];
};

export const MODELS: Model[] = [
  {
    id: "reflex",
    name: `${MODEL_BRAND} Reflex`,
    kind: "System-1 · decisions",
    status: "next",
    summary:
      "A decision model. It reads a request and returns a typed decision in a single forward pass — no generation, no waiting.",
    metrics: [
      { value: 15, prefix: "<", unit: "ms", label: "single decision" },
      { value: 3, prefix: "<", unit: "ms", label: "batched, per decision" },
      { value: 0.7, unit: "GB", label: "VRAM" },
    ],
  },
  {
    id: "u1",
    name: `${MODEL_BRAND}-1`,
    kind: "System-2 · reasoning & tools",
    status: "in training",
    summary:
      "Reasoning and tool use for the requests Reflex isn't sure about — planning, multi-step work, real answers.",
    credit: "Built on Qwen3-1.7B",
    metrics: [
      { value: 1.7, unit: "B", label: "parameters (base)" },
      { value: 32, unit: "K", label: "context tokens" },
      { value: 2, prefix: "<", unit: "GB", label: "VRAM, 4-bit" },
    ],
  },
  {
    id: "uh",
    name: `${MODEL_BRAND}-H`,
    kind: "Original hybrid architecture",
    status: "research",
    // Deliberately unspecific: the design stays private until publication.
    summary: "Our own architecture, built for long context on small hardware. Details at publication.",
    note: "details at publication",
    metrics: [],
  },
];

export type Tier = {
  id: string;
  name: string;
  role: string;
  latency: string;
};

export const TIERS: Tier[] = [
  { id: "rules", name: "Rules", role: "Exact commands. Never guesses.", latency: "<1 ms" },
  { id: "reflex", name: "Reflex", role: "One forward pass: a decision and a confidence.", latency: "<15 ms" },
  { id: "ultron", name: MODEL_BRAND, role: "Reasons and plans — only when Reflex is unsure.", latency: "<1 s" },
  { id: "tools", name: "Tools", role: "Acts on your machine, policy-checked.", latency: "governed" },
];

export const LEARNING_LOOP = {
  name: "Learning loop",
  role: "Every escalation trains Reflex overnight.",
  latency: "nightly",
};

export const PRINCIPLES = [
  {
    title: "Measure before you market",
    body: "Every number we publish ships with the hardware, the settings and the run ID behind it.",
  },
  {
    title: "Gate every release",
    body: "A model ships when it passes its evaluations on consumer hardware — not when the calendar says so.",
  },
  {
    title: "Own the data",
    body: "Training data we can trace, licenses we can read, and nothing taken from your device.",
  },
  {
    title: "Credit the stack",
    body: "We build on open science and say so — base models, libraries and papers, by name.",
  },
];

export const OPEN_SCIENCE = ["PyTorch", "Hugging Face", "Qwen", "ModernBERT"];
