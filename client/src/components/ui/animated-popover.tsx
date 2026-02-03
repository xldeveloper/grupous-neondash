import * as PopoverPrimitive from "@radix-ui/react-popover";
import { AnimatePresence, motion, type Transition } from "motion/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Animated Popover using Radix UI + Framer Motion
 * Based on animate-ui patterns with spring animations
 */

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

function AnimatedPopover({
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return (
    <PopoverPrimitive.Root data-slot="animated-popover" {...props}>
      {children}
    </PopoverPrimitive.Root>
  );
}

function AnimatedPopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="animated-popover-trigger"
      className={cn("cursor-pointer", className)}
      {...props}
    />
  );
}

interface AnimatedPopoverContentProps
  extends Omit<React.ComponentProps<typeof PopoverPrimitive.Content>, "asChild" | "forceMount"> {
  transition?: Transition;
}

function AnimatedPopoverContent({
  className,
  align = "center",
  sideOffset = 8,
  transition = defaultTransition,
  children,
  ...props
}: AnimatedPopoverContentProps) {
  return (
    <AnimatePresence>
      <PopoverPrimitive.Portal forceMount>
        <PopoverPrimitive.Content
          data-slot="animated-popover-content"
          align={align}
          sideOffset={sideOffset}
          forceMount
          asChild
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={transition}
            className={cn(
              "bg-popover text-popover-foreground z-50 w-80 origin-[var(--radix-popover-content-transform-origin)] rounded-xl border border-border p-4 shadow-lg outline-hidden",
              className
            )}
          >
            {children}
          </motion.div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </AnimatePresence>
  );
}

function AnimatedPopoverClose({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return (
    <PopoverPrimitive.Close
      data-slot="animated-popover-close"
      className={cn(
        "absolute right-2 top-2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

function AnimatedPopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="animated-popover-anchor" {...props} />;
}

export {
  AnimatedPopover,
  AnimatedPopoverTrigger,
  AnimatedPopoverContent,
  AnimatedPopoverClose,
  AnimatedPopoverAnchor,
};
