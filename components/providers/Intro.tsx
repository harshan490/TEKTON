"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Intro = { done: boolean; finish: () => void };
const IntroContext = createContext<Intro>({ done: true, finish: () => {} });

/**
 * "The page has opened." The Gate's own opening is the intro now, so this
 * flips on mount; components that wait on it (nav, reveals) start then.
 */
export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  useEffect(() => setDone(true), []);
  return <IntroContext.Provider value={{ done, finish: () => setDone(true) }}>{children}</IntroContext.Provider>;
}

export const useIntro = () => useContext(IntroContext);
