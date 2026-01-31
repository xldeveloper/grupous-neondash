import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

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

  const distance = useTransform(mouseX, val => {
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
      <Tooltip>
        <TooltipTrigger asChild>

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
        </TooltipTrigger>
        <TooltipContent className="bg-black/80 backdrop-blur-md text-white border-white/10">
          <p>{item.title}</p>
        </TooltipContent>
      </Tooltip>
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
  const hasMoreItems = remainingItems.length > 0;

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-md",
        "border border-white/10",
        className
      )}
      onMouseMove={e => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-black/40 hover:bg-black/60"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Dock items container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {visibleItems.map(item => (
          <DockItem key={item.id} item={item} mouseX={mouseX} />
        ))}

        {/* More items popover */}
        {hasMoreItems && (
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 border-dashed"
              >
                <div className="flex items-center gap-0.5">
                  <span className="text-sm font-medium text-white/70">
                    +{remainingItems.length}
                  </span>
                </div>
              </motion.button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2 bg-black/80 backdrop-blur-xl border-white/10"
              align="end"
            >
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                <div className="px-3 py-2 text-xs text-white/50 font-medium border-b border-white/10 mb-1">
                  <Users className="h-3 w-3 inline mr-1" />
                  Todos os mentorados
                </div>
                {remainingItems.map(item => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      item.isActive
                        ? "bg-neon-purple/20 text-neon-purple-light"
                        : "hover:bg-white/5 text-white/80"
                    )}
                  >
                    <div className="h-8 w-8 shrink-0">{item.icon}</div>
                    <span className="text-sm truncate max-w-[200px]">
                      {item.title}
                    </span>
                    {item.isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-neon-purple" />
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-black/40 hover:bg-black/60"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
