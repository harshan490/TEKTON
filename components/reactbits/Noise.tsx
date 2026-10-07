'use client';

// React Bits Noise (TS-TW), adapted for TEKTON: the grain frames are generated
// once and cycled, instead of filling a fresh 1024² ImageData every other frame
// (that cost a mid-range laptop most of its frame budget). Fixed to the viewport.
import React, { useRef, useEffect } from 'react';

interface NoiseProps {
  patternSize?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  frames?: number;
  className?: string;
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 512,
  patternRefreshInterval = 3,
  patternAlpha = 15,
  frames = 6,
  className = ''
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    canvas.width = patternSize;
    canvas.height = patternSize;

    const pool: ImageData[] = Array.from({ length: frames }, () => {
      const imageData = ctx.createImageData(patternSize, patternSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      return imageData;
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctx.putImageData(pool[0], 0, 0);
    if (reduce) return;

    let frame = 0;
    let animationId: number;
    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        ctx.putImageData(pool[(frame / patternRefreshInterval) % frames | 0], 0, 0);
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };
    loop();

    return () => window.cancelAnimationFrame(animationId);
  }, [patternSize, patternRefreshInterval, patternAlpha, frames]);

  return (
    <canvas
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      ref={grainRef}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default Noise;
