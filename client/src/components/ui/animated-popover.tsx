"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { AnimatePresence, motion, type Transition } from "motion/react";
import type * as React from "react";
import { createContext, useContext, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Animated Popover using Radix UI + Framer Motion
 * Fixed version: properly manages open state for animations
 */

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

// Context to share open state between components
interface AnimatedPopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AnimatedPopoverContext = createContext<AnimatedPopoverContextValue | null>(null);

function useAnimatedPopover() {
  const context = useContext(AnimatedPopoverContext);
  if (!context) {
    throw new Error("useAnimatedPopover must be used within AnimatedPopover");
  }
  return context;
}

interface AnimatedPopoverProps extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  defaultOpen?: boolean;
}

function AnimatedPopover({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  ...props
}: AnimatedPopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <AnimatedPopoverContext.Provider value={{ open, setOpen: handleOpenChange }}>
      <PopoverPrimitive.Root
        data-slot="animated-popover"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </PopoverPrimitive.Root>
    </AnimatedPopoverContext.Provider>
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
  const { open } = useAnimatedPopover();

  return (
    <AnimatePresence>
      {open && (
        <PopoverPrimitive.Portal forceMount>
          <PopoverPrimitive.Content
            data-slot="animated-popover-content"
            align={align}
            sideOffset={sideOffset}
            asChild
            onOpenAutoFocus={(e) => {
              // Prevent auto-focus stealing from textareas/inputs
              e.preventDefault();
            }}
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
      )}
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
