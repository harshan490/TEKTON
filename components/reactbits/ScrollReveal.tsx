'use client';

// React Bits ScrollReveal (TS-TW), adapted for TEKTON:
// - `as` (the mission copy is a paragraph, not a heading)
// - *word* marks a serif-italic accent, **word** a bright one
// - cleanup kills only this instance's triggers (the original killed every ScrollTrigger)
// - reduced motion shows the text as-is
import React, { useEffect, useRef, useMemo, type ElementType, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  accentClassName?: string;
  strongClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  as: Tag = 'div',
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  accentClassName = 'serif-accent',
  strongClassName = 'text-ink',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom'
}) => {
  const containerRef = useRef<HTMLElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      let cls = '';
      let w = word;
      if (/^\*\*.+\*\*[.,;:!?]*$/.test(w)) {
        cls = strongClassName;
        w = w.replace(/\*\*/g, '');
      } else if (/^\*.+\*[.,;:!?]*$/.test(w)) {
        cls = accentClassName;
        w = w.replace(/\*/g, '');
      }
      return (
        <span className={`inline-block word ${cls}`} key={index}>
          {w}
        </span>
      );
    });
  }, [children, accentClassName, strongClassName]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: { trigger: el, scroller, start: 'top bottom', end: rotationEnd, scrub: true }
        }
      );

      const wordElements = el.querySelectorAll<HTMLElement>('.word');
      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity' },
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: { trigger: el, scroller, start: 'top bottom-=20%', end: wordAnimationEnd, scrub: true }
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'none',
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: { trigger: el, scroller, start: 'top bottom-=20%', end: wordAnimationEnd, scrub: true }
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <Tag ref={containerRef} className={containerClassName}>
      <span className={`block ${textClassName}`}>{splitText}</span>
    </Tag>
  );
};

export default ScrollReveal;
