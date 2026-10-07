'use client';

// React Bits ClickSpark (TS-TW), adapted for TEKTON: one viewport-sized fixed
// canvas (the original sized a canvas to the whole document), drawn only while
// sparks are alive, DPR-aware. `burst()` lets a component fire sparks itself.
import React, { useRef, useEffect, useCallback, createContext, useContext } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
  scale: number;
}

type Burst = (x: number, y: number, scale?: number) => void;
const SparkContext = createContext<Burst>(() => {});
export const useSparkBurst = () => useContext(SparkContext);

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const eased = easeFunc(Math.max(0, elapsed / duration));
        const distance = eased * sparkRadius * extraScale * spark.scale;
        const lineLength = sparkSize * spark.scale * (1 - eased);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(spark.x + distance * Math.cos(spark.angle), spark.y + distance * Math.sin(spark.angle));
        ctx.lineTo(
          spark.x + (distance + lineLength) * Math.cos(spark.angle),
          spark.y + (distance + lineLength) * Math.sin(spark.angle)
        );
        ctx.stroke();
        return true;
      });

      rafRef.current = sparksRef.current.length ? requestAnimationFrame(draw) : null;
    },
    [sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]
  );

  const burst = useCallback<Burst>(
    (x, y, scale = 1) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const now = performance.now();
      const count = Math.round(sparkCount * Math.max(1, scale));
      for (let i = 0; i < count; i++) {
        sparksRef.current.push({ x, y, angle: (2 * Math.PI * i) / count, startTime: now, scale });
      }
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(draw);
    },
    [sparkCount, draw]
  );

  return (
    <SparkContext.Provider value={burst}>
      <div className="relative" onClick={e => burst(e.clientX, e.clientY)}>
        {children}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] h-screen w-screen"
      />
    </SparkContext.Provider>
  );
};

export default ClickSpark;
