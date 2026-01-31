import { motion, useTransform } from "motion/react";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  formatFn?: (value: number) => string;
  className?: string;
}

/**
 * AnimatedCounter - Displays an animated numeric value using motion values.
 * Uses the useAnimatedCounter hook to smoothly interpolate between values.
 */
export function AnimatedCounter({
  from = 0,
  to,
  duration = 1,
  delay = 0,
  formatFn,
  className,
}: AnimatedCounterProps) {
  const count = useAnimatedCounter(from, to, duration, delay);

  // Transform the motion value to a formatted string
  const displayValue = useTransform(count, (latest) =>
    formatFn ? formatFn(latest) : String(latest)
  );

  return <motion.span className={className}>{displayValue}</motion.span>;
}
