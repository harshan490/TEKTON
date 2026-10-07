import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "@/config/site";

export const alt = `${site.name} — coming soon`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: the Coming Soon frame — the mark in a portal glow, the words beneath. */
export default async function OpengraphImage() {
  const mark = await readFile(path.join(process.cwd(), "public", "tekton-mark.png"));
  const src = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse 55% 60% at 50% 38%, rgba(63,96,255,0.35) 0%, rgba(26,38,144,0.18) 45%, #05070B 80%)",
          backgroundColor: "#05070B",
          color: "#EEF2F7",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={170} height={172} alt="" style={{ marginBottom: 36 }} />
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "0.12em", color: "#DDE3EC" }}>COMING SOON</div>
        <div style={{ marginTop: 18, fontSize: 28, letterSpacing: "0.42em", color: "#A9B4C4" }}>TEKTON AGI</div>
      </div>
    ),
    size
  );
}
