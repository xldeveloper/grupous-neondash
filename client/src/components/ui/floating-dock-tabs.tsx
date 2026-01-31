"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRef, useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import * as TabsPrimitive from "@radix-ui/react-tabs";

// Context for tab state
const FloatingDockTabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: "",
  setActiveTab: () => {},
});

export interface FloatingDockTabItem {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface FloatingDockTabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface FloatingDockTabsListProps {
  tabs: FloatingDockTabItem[];
  className?: string;
}

// Individual dock tab item
function DockTabItem({
  tab,
  isActive,
  onClick,
}: {
  tab: FloatingDockTabItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-xl transition-colors duration-200",
        "px-4 py-2.5 font-medium whitespace-nowrap",
        "ring-0 outline-none focus-visible:ring-0 focus:outline-none focus:ring-0",
        "z-10" // Ensure clickability
      )}
    >
      {/* Active indicator background */}
      {isActive && (
        <motion.div
          layoutId="activeDockTab"
          className="absolute inset-0 rounded-xl bg-neon-petroleo dark:bg-neon-gold shadow-sm"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      {/* Hover indicator (lighter) */}
      {!isActive && isHovered && (
        <div className="absolute inset-0 rounded-xl bg-slate-200/50 dark:bg-white/5" />
      )}

      {/* Icon */}
      {Icon && (
        <span className={cn(
          "relative z-20 transition-colors duration-200",
           isActive 
             ? "text-white dark:text-black" 
             : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
        )}>
           <Icon className="w-4 h-4" />
        </span>
      )}

      {/* Label text */}
      <span
        className={cn(
          "relative z-20 text-sm font-medium whitespace-nowrap transition-colors duration-200",
          isActive
            ? "text-white dark:text-black"
            : "text-slate-600 dark:text-slate-400"
        )}
      >
        {tab.label}
      </span>
    </button>
  );
}

// Main FloatingDockTabs component
const FloatingDockTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  FloatingDockTabsProps
>(({ defaultValue, value, onValueChange, children, className }, ref) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <FloatingDockTabsContext.Provider
      value={{ activeTab, setActiveTab: handleValueChange }}
    >
      <TabsPrimitive.Root
        ref={ref}
        value={value !== undefined ? value : activeTab}
        onValueChange={handleValueChange}
        defaultValue={defaultValue}
        className={cn("flex flex-col gap-6", className)}
      >
        {children}
      </TabsPrimitive.Root>
    </FloatingDockTabsContext.Provider>
  );
});
FloatingDockTabs.displayName = "FloatingDockTabs";

// FloatingDockTabsList component
const FloatingDockTabsList = React.forwardRef<
  HTMLDivElement,
  FloatingDockTabsListProps
>(({ tabs, className }, ref) => {
  const { activeTab, setActiveTab } = useContext(FloatingDockTabsContext);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // tolerance
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center gap-2 p-1.5 rounded-2xl backdrop-blur-md",
        "bg-white/80 dark:bg-[#0A0A0A]/80 border border-slate-200/50 dark:border-white/10 shadow-sm",
        "w-max max-w-full mx-auto", // Center the dock
        className
      )}
    >
      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Dock items container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map(tab => (
          <DockTabItem
            key={tab.value}
            tab={tab}
            isActive={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          />
        ))}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});
FloatingDockTabsList.displayName = "FloatingDockTabsList";

// Export TabsContent from radix for convenience
const FloatingDockTabsContent = TabsPrimitive.Content;

export { FloatingDockTabs, FloatingDockTabsList, FloatingDockTabsContent };
