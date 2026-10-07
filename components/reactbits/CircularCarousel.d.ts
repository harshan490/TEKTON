import type { CSSProperties, FC, ReactNode } from "react";

export type CircularCarouselItem = {
  src?: string;
  /** TEKTON: React content rendered in place of the photo. */
  content?: ReactNode;
  alt?: string;
  title?: string;
  subtitle?: string;
};

export type CircularCarouselProps = {
  items?: CircularCarouselItem[];
  preset?: "cylinder" | "orbit" | "wheel" | "panorama";
  intro?: "assemble" | "rise" | "spin" | "none";
  cardWidth?: number;
  aspectRatio?: number;
  gap?: number;
  curve?: number;
  tilt?: number;
  perspective?: number;
  autoplay?: "drift" | "step" | "off";
  speed?: number;
  interval?: number;
  direction?: "left" | "right";
  draggable?: boolean;
  momentum?: number;
  snap?: boolean;
  pauseOnHover?: boolean;
  focusOnClick?: boolean;
  parallax?: number;
  stretch?: number;
  depthFade?: number;
  fadeColor?: string;
  innerShade?: number;
  cornerRadius?: number;
  captions?: boolean;
  onChange?: (index: number) => void;
  onItemClick?: (item: CircularCarouselItem, index: number) => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

declare const CircularCarousel: FC<CircularCarouselProps>;
export default CircularCarousel;
