import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  className,
  children,
  onClick,
  delay = 0,
}: {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        "border-zinc-100 shadow-sm",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export const BentoCardHeader = ({
  title,
  subtitle,
  icon,
  className,
  action,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
  children?: ReactNode;
}) => {
  if (children) {
    return (
      <div className={cn("flex items-start justify-between", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex items-start justify-between", className)}>
      <div className="flex gap-3 items-center">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 group-hover/bento:text-neon-purple group-hover/bento:bg-neon-purple/10 transition-colors duration-200">
            {icon}
          </div>
        )}
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover/bento:text-neon-purple transition-colors duration-200">
            {title}
          </div>
          {subtitle && (
            <div className="font-normal text-slate-500 text-xs dark:text-slate-400">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const BentoCardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex-1", className)}>{children}</div>;
};

export const BentoCardFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={cn("mt-auto pt-4 border-t border-slate-100 dark:border-slate-800", className)}>{children}</div>;
};
