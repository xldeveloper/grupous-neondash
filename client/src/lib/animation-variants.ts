import { Variants } from "motion/react";

// Prefers-reduced-motion detection
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// No-op variants for reduced motion
const noOpVariants: Variants = {
  initial: {},
  animate: {},
  exit: {},
};

// Helper to conditionally return variants based on motion preference
export function getVariants(variants: Variants): Variants {
  return prefersReducedMotion ? noOpVariants : variants;
}

export const transition = prefersReducedMotion
  ? { duration: 0 }
  : {
      type: "spring",
      stiffness: 300,
      damping: 30,
    };

export const springTransition = prefersReducedMotion
  ? { duration: 0 }
  : {
      type: "spring",
      stiffness: 500,
      damping: 30,
    };

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.05,
    },
  },
};

export const accordion: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

export const animations = {
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  staggerContainer,
  accordion,
};
