"use client";

import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import { motion, useReducedMotion, useSpring, type MotionStyle } from "motion/react";
import { useFinePointer } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";

type GlassProps = Omit<ComponentPropsWithoutRef<"div">, "style" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  /** Cursor-following highlight (SpotlightCard logic). */
  spotlight?: boolean;
  /** Tilt toward the cursor, at most `maxTilt` degrees (TiltedCard logic). */
  tilt?: boolean;
  maxTilt?: number;
  /** Darker fill where body text must hold 4.5:1 over bright video. */
  deep?: boolean;
  style?: MotionStyle;
};

const TILT_SPRING = { stiffness: 150, damping: 18, mass: 0.6 };

/** The one glass panel used across the site. */
export default function Glass({
  spotlight = true,
  tilt = true,
  maxTilt = 4,
  deep = false,
  className,
  style,
  children,
  ...rest
}: GlassProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const interactive = fine && !reduce;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !interactive) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt) {
      rotateY.set((x / rect.width - 0.5) * 2 * maxTilt);
      rotateX.set(-(y / rect.height - 0.5) * 2 * maxTilt);
    }
  };

  const onPointerLeave = () => {
    setHover(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("glass overflow-hidden", deep && "glass-deep", className)}
      style={{ rotateX, rotateY, transformPerspective: 1000, ...style }}
      onPointerEnter={() => setHover(true)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      {children}
      {spotlight && interactive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500"
          style={{
            opacity: hover ? 1 : 0,
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(207,224,245,0.12), transparent 60%)",
          }}
        />
      )}
    </motion.div>
  );
}
