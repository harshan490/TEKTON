"use client";

import { useEffect, useState } from "react";

/** Client-only media query; `false` on the server and the first render. */
export function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Desktop with a real mouse — the only place mouse parallax and the cursor run. */
export const useFinePointer = () => useMedia("(min-width: 768px) and (pointer: fine)");
