import type { Variants } from "motion/react";

// Prefers-reduced-motion detection
const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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
      delayChildren: 0.1,
    },
  },
};

export const accordion: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

// Advanced Variants

export const textVariant = (delay: number): Variants => ({
  hidden: {
    y: 50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1.25,
      delay,
    },
  },
});

export const glowPulse: Variants = {
  initial: { boxShadow: "0 0 0 rgba(255, 215, 0, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 rgba(255, 215, 0, 0)",
      "0 0 20px rgba(255, 215, 0, 0.3)",
      "0 0 0 rgba(255, 215, 0, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
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
  textVariant,
  glowPulse,
  floatingAnimation,
};

// === LANDING PAGE ENHANCED ANIMATIONS ===

// Shimmer effect for gradient text
export const shimmerText: Variants = {
  initial: { backgroundPosition: "200% center" },
  animate: {
    backgroundPosition: "-200% center",
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Stagger container with longer delays for dramatic reveals
export const heroStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.15,
      delayChildren: 0.2,
    },
  },
};

// Hero text reveal with spring
export const heroText: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

// Card hover with glow effect
export const cardGlow: Variants = {
  initial: {
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    boxShadow: "0 20px 40px -10px rgba(180, 83, 9, 0.3)",
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Parallax floating for background elements
export const parallaxFloat: Variants = {
  initial: { y: 0, x: 0 },
  animate: {
    y: [-20, 20, -20],
    x: [-10, 10, -10],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Slow rotation for decorative elements
export const slowRotate: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 60,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Scroll-triggered reveal
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Scale reveal for cards
export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Pulse animation for CTAs
export const ctaPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Line draw animation
export const lineDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut",
    },
  },
};
