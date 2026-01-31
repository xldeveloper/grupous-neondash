import * as React from "react";
import { cn } from "@/lib/utils";

const NeonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glow" | "glass";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300",
        // Default: Clean white/navy with subtle border
        variant === "default" && "border-neon-border hover:shadow-md hover:border-neon-blue/30",
        // Glow: For prominent KPIs
        variant === "glow" &&
          "border-neon-gold/50 shadow-neon-gold/10 hover:shadow-neon-gold/20 hover:border-neon-gold",
        // Glass: Modern frosted look
        variant === "glass" && "bg-card border-border shadow-lg",
        className
      )}
      {...props}
    />
  );
});
NeonCard.displayName = "NeonCard";

const NeonCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
NeonCardHeader.displayName = "NeonCardHeader";

const NeonCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-neon-blue-dark",
      className
    )}
    {...props}
  />
));
NeonCardTitle.displayName = "NeonCardTitle";

const NeonCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
NeonCardDescription.displayName = "NeonCardDescription";

const NeonCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
NeonCardContent.displayName = "NeonCardContent";

const NeonCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
NeonCardFooter.displayName = "NeonCardFooter";

export {
  NeonCard,
  NeonCardHeader,
  NeonCardFooter,
  NeonCardTitle,
  NeonCardDescription,
  NeonCardContent,
};
