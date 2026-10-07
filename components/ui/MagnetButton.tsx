"use client";

import Magnet from "@/components/reactbits/Magnet";
import { useFinePointer } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";

type Variant = "solid" | "glass";

type Props = {
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-[background-color,box-shadow,color] duration-300 ease-out-expo whitespace-nowrap";

const variants: Record<Variant, string> = {
  solid:
    "bg-ink text-bg shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_10px_40px_-10px_rgba(143,184,255,0.55)] hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.9),0_12px_48px_-8px_rgba(143,184,255,0.85)]",
  glass: "glass !rounded-full text-ink hover:bg-white/10",
};

const sizes = {
  sm: "h-9 px-4 text-[14px]",
  md: "h-12 px-6 text-[15px]",
};

/** Primary/secondary CTA. React Bits Magnet pulls it ≤25 % of the cursor offset. */
export default function MagnetButton({
  href,
  type = "button",
  variant = "solid",
  size = "md",
  className,
  disabled,
  onClick,
  children,
}: Props) {
  const fine = useFinePointer();
  const cls = cn(base, variants[variant], sizes[size], className);
  const inner = href ? (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  ) : (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
  return (
    <Magnet disabled={!fine} magnetStrength={4} padding={40}>
      {inner}
    </Magnet>
  );
}
