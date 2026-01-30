import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface FloatingDockItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}

interface FloatingDockProps {
  items: FloatingDockItem[];
  activeValue?: string;
  className?: string;
  maxVisible?: number;
}

function DockItem({
  item,
  mouseX,
}: {
  item: FloatingDockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return 0;
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const heightSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const iconScale = useTransform(distance, [-150, 0, 150], [1, 1.3, 1]);

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <div className="relative">
      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
        >
          <div className="bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
            {item.title}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80" />
        </motion.div>
      )}

      <motion.button
        ref={ref}
        onClick={item.onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width, height }}
        className={cn(
          "relative flex items-center justify-center rounded-2xl transition-colors duration-200",
          "hover:bg-white/10",
          item.isActive
            ? "bg-white/15 ring-2 ring-neon-purple/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            : "bg-white/5"
        )}
      >
        {/* Active indicator */}
        {item.isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-transparent"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Icon with scale effect */}
        <motion.div style={{ scale: iconScale }} className="relative z-10">
          {item.icon}
        </motion.div>

        {/* Active dot */}
        {item.isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-neon-purple"
          />
        )}
      </motion.button>
    </div>
  );
}

export function FloatingDock({
  items,
  activeValue,
  className,
  maxVisible = 8,
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

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

  const visibleItems = items.slice(0, maxVisible);
  const remainingItems = items.slice(maxVisible);
