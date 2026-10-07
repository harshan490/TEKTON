'use client';

// React Bits SpotlightCard (TS-TW), adapted for TEKTON: liquid-glass surface by
// default, pointer position written to CSS variables (no re-render per move).
import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(207, 224, 245, 0.12)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--sx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--sy', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => setOpacity(1)}
      onBlur={() => setOpacity(0)}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`glass overflow-hidden p-8 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(480px circle at var(--sx, 50%) var(--sy, 50%), ${spotlightColor}, transparent 70%)`
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

export default SpotlightCard;
