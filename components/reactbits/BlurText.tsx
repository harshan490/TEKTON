'use client';

// React Bits BlurText (TS-TW), adapted for TEKTON:
// - `segments` lets one line mix styles (sans + one serif-italic word)
// - `as` renders a heading instead of <p>
// - `start` gates the reveal (the hero waits for the preloader)
import { motion, type Transition, type Easing } from 'motion/react';
import { useEffect, useRef, useState, useMemo, type ElementType } from 'react';

type Segment = { text: string; className?: string };

type BlurTextProps = {
  text?: string;
  segments?: Segment[];
  as?: ElementType;
  start?: boolean;
  delay?: number;
  initialDelay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  segments,
  as: Tag = 'p',
  start = true,
  delay = 200,
  initialDelay = 0,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = [0.22, 1, 0.36, 1],
  onAnimationComplete,
  stepDuration = 0.35
}) => {
  const parts = useMemo(() => {
    const segs = segments ?? [{ text }];
    return segs.flatMap(seg =>
      (animateBy === 'words' ? seg.text.split(' ') : seg.text.split('')).map(t => ({ t, className: seg.className }))
    );
  }, [segments, text, animateBy]);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const animateKeyframes = useMemo(() => buildKeyframes(fromSnapshot, toSnapshots), [fromSnapshot, toSnapshots]);

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));
  const play = inView && start;

  return (
    <Tag ref={ref} className={`blur-text ${className} flex flex-wrap`}>
      {parts.map((part, index) => {
        // A "\n" segment forces a line break inside the flex-wrap line.
        if (part.t === '\n') return <span key={index} aria-hidden className="basis-full" />;
        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: initialDelay + (index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={play ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === parts.length - 1 ? onAnimationComplete : undefined}
            className={part.className}
            style={{
              display: 'inline-block',
              willChange: 'transform, filter, opacity'
            }}
          >
            {part.t === ' ' ? ' ' : part.t}
            {animateBy === 'words' && index < parts.length - 1 && ' '}
          </motion.span>
        );
      })}
    </Tag>
  );
};

export default BlurText;
