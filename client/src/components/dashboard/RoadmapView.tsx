import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { getModuleIcon } from "./RoadmapIcons";

interface RoadmapViewProps {
  mentoradoId?: number;
}

export function RoadmapView({ mentoradoId }: RoadmapViewProps) {
  const { data: roadmap, isLoading } = trpc.playbook.getRoadmap.useQuery({ mentoradoId });

  if (isLoading || !roadmap) {
    return (
      <div className="w-full h-96 bg-slate-950/50 animate-pulse rounded-3xl border border-slate-800/50" />
    );
  }

  const modules = roadmap.modules;
  const modulesPerRow = 3;

  // Calculate rows
  const rows = [];
  for (let i = 0; i < modules.length; i += modulesPerRow) {
    rows.push(modules.slice(i, i + modulesPerRow));
  }

  const totalProgress = calculateTotalProgress(modules);

  return (
    <div className="w-full bg-[#0B1221] rounded-3xl p-6 md:p-12 relative overflow-hidden border border-[#D4AF37]/10 shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0F4C75]/10 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <div className="relative z-10 mb-20 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
          NEON Journey: Your Path to Success
        </h2>
        <div className="h-1.5 w-32 bg-gradient-to-r from-[#D4AF37] to-[#F2D06B] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)] mx-auto md:mx-0" />
      </div>

      {/* Snake Layout Container */}
      <div className="relative z-10 max-w-5xl mx-auto pb-12">
        {rows.map((rowModules, rowIndex) => {
          const isReverse = rowIndex % 2 !== 0; // Even rows (0, 2) left-to-right, Odd rows (1, 3) right-to-left
          const isLastRow = rowIndex === rows.length - 1;

          return (
            <div key={rowIndex} className="relative mb-24 last:mb-0">
              {/* 
                  U-Turn Connector Logic:
                  Connects the END of the current row to the START of the next row.
                  Visible only on Desktop (md+).
                  
                  If current row is LTR (Even): Connector goes on the RIGHT.
                  If current row is RTL (Odd): Connector goes on the LEFT.
               */}
              {!isLastRow && (
                <div
                  className={cn(
                    "absolute hidden md:block w-20 h-full border-4 border-slate-800 rounded-[3rem] -z-20"
                  )}
                  style={{
                    // Height = Full height + gap to next row
                    height: "calc(100% + 6rem)",
                    top: "50%",

                    // Left/Right logic
                    right: isReverse ? "auto" : "-2.5rem",
                    left: isReverse ? "-2.5rem" : "auto",

                    // Border logic
                    // If Even Row (!isReverse): Curve is on RIGHT. Border Right, Top, Bottom.
                    // If Odd Row (isReverse): Curve is on LEFT. Border Left, Top, Bottom.

                    borderRightWidth: !isReverse ? "4px" : "0",
                    borderLeftWidth: isReverse ? "4px" : "0",
                    borderTopWidth: "4px",
                    borderBottomWidth: "4px",
                  }}
                />
              )}

              {/* Row Container */}
              <div
                className={cn(
                  "flex flex-col md:flex-row gap-8 md:gap-16 justify-center md:justify-between items-center w-full relative",
                  isReverse ? "md:flex-row-reverse" : ""
                )}
              >
                {/* Horizontal Connecting Line (Behind cards) */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 hidden md:block -translate-y-1/2 rounded-full" />

                {rowModules.map((module) => {
                  return (
                    <div
                      key={module.id}
                      className="relative group w-full md:w-auto flex justify-center z-10"
                    >
                      <RoadmapNode
                        module={module}
                        locked={module.isLocked}
                        active={module.status === "in_progress"}
                        completed={module.status === "completed"}
                        index={module.order}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Progress Bar */}
      <div className="w-full mt-12 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm max-w-4xl mx-auto">
        <div className="flex justify-between text-sm font-semibold mb-3">
          <span className="text-slate-300 uppercase tracking-wider">
            Overall Progress: {roadmap.modules.filter((m) => m.status === "completed").length}/
            {roadmap.modules.length} Modules ({totalProgress}%)
          </span>
          <span className="text-[#D4AF37]">{totalProgress}%</span>
        </div>
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F2D06B] to-[#D4AF37] relative"
          >
            {/* Shimmer Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function calculateTotalProgress(modules: any[]) {
  if (!modules?.length) return 0;
  const totalProg = modules.reduce((acc, m) => acc + (m.progress || 0), 0);
  return Math.round(totalProg / modules.length);
}

// Node Component
interface RoadmapNodeProps {
  module: any;
  locked?: boolean;
  active?: boolean;
  completed?: boolean;
  index: number;
}

function RoadmapNode({ module, locked, active, completed, index }: RoadmapNodeProps) {
  if (!module) return <div className="w-72 h-32 opacity-0" />;

  const Icon = getModuleIcon(module.order, module.title);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "relative w-full max-w-xs md:w-[18rem] lg:w-[20rem] transition-all duration-300",
        active ? "z-20 scale-105" : "z-10 hover:scale-[1.02]"
      )}
    >
      <div
        className={cn(
          "rounded-[2rem] p-[2px] relative overflow-hidden h-full",
          active
            ? "bg-gradient-to-b from-[#D4AF37] via-[#F2D06B] to-[#AA8C2C] shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)]"
            : locked
              ? "bg-slate-700/50 border border-slate-700"
              : "bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-slate-500"
        )}
      >
        {/* Inner Content */}
        <div
          className={cn(
            "bg-[#0F172A] rounded-[1.9rem] p-5 h-28 md:h-32 flex items-center gap-4 relative overflow-hidden",
            active ? "bg-gradient-to-br from-[#1e293b] to-[#0f172a]" : ""
          )}
        >
          {/* Active Glow */}
          {active && (
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 bg-[#D4AF37]/20 rounded-full blur-2xl animate-pulse -z-0" />
          )}

          {/* Icon Circle */}
          <div
            className={cn(
              "shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl shadow-lg border relative z-10",
              active
                ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] text-[#0F172A] border-[#F2D06B]"
                : locked
                  ? "bg-slate-800/80 text-slate-600 border-slate-700"
                  : "bg-slate-700/80 text-slate-300 border-slate-600"
            )}
          >
            {locked ? <Lock className="w-5 h-5 opacity-50" /> : <Icon className="w-6 h-6" />}

            {/* Completed Badge */}
            {completed && !locked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0F172A] shadow-sm z-20">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 z-10 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-0.5">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  active ? "text-[#D4AF37]" : "text-slate-500"
                )}
              >
                Module {module.order}
              </span>
              {active && (
                <span className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded-full border border-[#D4AF37]/20">
                  {module.progress}%
                </span>
              )}
            </div>

            <h3
              className={cn(
                "text-sm md:text-base font-bold leading-tight mb-1 line-clamp-2",
                locked ? "text-slate-600" : "text-white"
              )}
            >
              {module.title}
            </h3>

            {/* Description only if active */}
            {active && module.description && (
              <p className="text-[10px] text-slate-400 line-clamp-1 hidden md:block">
                {module.description}
              </p>
            )}

            <p
              className={cn(
                "text-[10px] font-medium mt-auto",
                locked ? "text-slate-600" : active ? "text-[#F2D06B]" : "text-slate-400"
              )}
            >
              {locked
                ? "Locked"
                : active
                  ? "In progress"
                  : completed
                    ? "Completed"
                    : "Available"}
            </p>
          </div>

          {/* Progress Line for Active */}
          {active && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${module.progress}%` }}
                className="h-full bg-[#D4AF37]"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
