"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  StickyNote,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type ParsedStep = {
  type: "header" | "step";
  text: string;
  originalIndex: number;
  category?: "G" | "R" | "V" | "M";
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  G: { bg: "bg-blue-500/10", text: "text-blue-500", icon: "📊" },
  R: { bg: "bg-pink-500/10", text: "text-pink-500", icon: "💬" },
  V: { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: "💰" },
  M: { bg: "bg-teal-500/10", text: "text-teal-500", icon: "🧠" },
};

function parseContent(content: string): ParsedStep[] {
  const lines = content.split("\n");
  const steps: ParsedStep[] = [];
  let stepCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Check if it's a day header (DIA X)
    const dayMatch = trimmed.match(/^DIA\s*(\d+)/i);
    if (dayMatch) {
      steps.push({ type: "header", text: trimmed, originalIndex: i });
      continue;
    }

    // Check if it's an actionable item
    const itemMatch = trimmed.match(/^[-•☐[\]]\s*(.+)$/);
    if (itemMatch) {
      const categoryMatch = itemMatch[1].match(/^\(([GRVM])\)\s*(.+)$/i);
      if (categoryMatch) {
        steps.push({
          type: "step",
          text: categoryMatch[2],
          originalIndex: stepCount++,
          category: categoryMatch[1].toUpperCase() as "G" | "R" | "V" | "M",
        });
      } else {
        steps.push({ type: "step", text: itemMatch[1], originalIndex: stepCount++ });
      }
      continue;
    }

    // Check for lines starting with category markers like (G), (R), (V), (M)
    const categoryMatch = trimmed.match(/^\(([GRVM])\)\s*(.+)$/i);
    if (categoryMatch) {
      steps.push({
        type: "step",
        text: categoryMatch[2],
        originalIndex: stepCount++,
        category: categoryMatch[1].toUpperCase() as "G" | "R" | "V" | "M",
      });
      continue;
    }

    // Check for lines starting with emoji
    const emojiMatch = trimmed.match(/^[\u{1F300}-\u{1F9FF}]/u);
    if (emojiMatch) {
      steps.push({ type: "step", text: trimmed, originalIndex: stepCount++ });
    }
  }

  return steps;
}

export function WeeklyPlanningView() {
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});
  const [noteTexts, setNoteTexts] = useState<Record<number, string>>({});

  const { data: plan, isLoading, refetch } = trpc.planejamento.getActive.useQuery();

  const toggleMutation = trpc.planejamento.toggleStep.useMutation({
    onSuccess: () => refetch(),
  });

  const notesMutation = trpc.planejamento.updateStepNotes.useMutation({
    onSuccess: () => refetch(),
  });

  const parsedSteps = useMemo(() => {
    if (!plan?.conteudo) return [];
    return parseContent(plan.conteudo);
  }, [plan?.conteudo]);

  const actionableSteps = parsedSteps.filter((s) => s.type === "step");

  const progressMap = useMemo(() => {
    if (!plan?.progress) return {};
    return plan.progress.reduce(
      (acc, p) => {
        acc[p.stepIndex] = p;
        return acc;
      },
      {} as Record<number, (typeof plan.progress)[number]>
    );
  }, [plan?.progress]);

  const completedCount = Object.values(progressMap).filter((p) => p.completed === "sim").length;

  const progressPercent =
    actionableSteps.length > 0 ? Math.round((completedCount / actionableSteps.length) * 100) : 0;

  const handleToggle = (stepIndex: number) => {
    if (!plan) return;
    toggleMutation.mutate({ planId: plan.id, stepIndex });
  };

  const handleSaveNote = (stepIndex: number) => {
    if (!plan || !noteTexts[stepIndex]) return;
    notesMutation.mutate({
      planId: plan.id,
      stepIndex,
      notes: noteTexts[stepIndex],
    });
    setExpandedNotes((prev) => ({ ...prev, [stepIndex]: false }));
  };

  if (isLoading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No active planning
          </h3>
          <p className="text-sm text-muted-foreground/70 max-w-sm">
            Your mentor has not created a weekly planning for you yet. Get in touch to
            request one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{plan.titulo}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Week {plan.semana} •{" "}
                  {new Date(0, plan.mes - 1).toLocaleString("en-US", { month: "long" })} {plan.ano}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={progressPercent === 100 ? "default" : "outline"}
              className={cn(
                "text-sm",
                progressPercent === 100 &&
                  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              )}
            >
              {progressPercent === 100 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Complete!
                </>
              ) : (
                `${progressPercent}% Completed`
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {completedCount} of {actionableSteps.length} items
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps List */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Your Weekly Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <AnimatePresence mode="popLayout">
              <div className="space-y-1">
                {parsedSteps.map((step, index) => {
                  if (step.type === "header") {
                    return (
                      <motion.div
                        key={`header-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="pt-4 first:pt-0"
                      >
                        <h4 className="font-semibold text-primary border-b border-primary/20 pb-2 mb-2">
                          {step.text}
                        </h4>
                      </motion.div>
                    );
                  }

                  const progress = progressMap[step.originalIndex];
                  const isCompleted = progress?.completed === "sim";
                  const hasNotes = !!progress?.notes;
                  const isExpanded = expandedNotes[step.originalIndex];
                  const category = step.category;
                  const categoryStyle = category ? CATEGORY_COLORS[category] : null;

                  return (
                    <motion.div
                      key={`step-${step.originalIndex}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={cn(
                        "group flex items-start gap-3 py-3 px-3 -mx-3 rounded-lg transition-colors",
                        "hover:bg-muted/30",
                        isCompleted && "bg-emerald-500/5"
                      )}
                    >
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggle(step.originalIndex)}
                        className={cn(
                          "mt-0.5 transition-all",
                          isCompleted &&
                            "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        )}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {categoryStyle && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded font-medium",
                                    categoryStyle.bg,
                                    categoryStyle.text
                                  )}
                                >
                                  {categoryStyle.icon} {category}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {category === "G" && "Management"}
                                {category === "R" && "Relationship"}
                                {category === "V" && "Sales"}
                                {category === "M" && "Mindset"}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <span
                            className={cn(
                              "text-sm transition-colors",
                              isCompleted
                                ? "line-through text-muted-foreground/60"
                                : "text-foreground"
                            )}
                          >
                            {step.text}
                          </span>
                        </div>

                        {/* Notes section */}
                        {hasNotes && !isExpanded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md"
                          >
                            <MessageSquare className="w-3 h-3 inline mr-1.5" />
                            {progress?.notes}
                          </motion.div>
                        )}

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2"
                          >
                            <Textarea
                              placeholder="Add your notes..."
                              value={noteTexts[step.originalIndex] || progress?.notes || ""}
                              onChange={(e) =>
                                setNoteTexts((prev) => ({
                                  ...prev,
                                  [step.originalIndex]: e.target.value,
                                }))
                              }
                              className="text-sm min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNote(step.originalIndex)}
                                disabled={notesMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setExpandedNotes((prev) => ({
                                    ...prev,
                                    [step.originalIndex]: false,
                                  }))
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Notes button */}
                      {!isExpanded && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                                hasNotes && "opacity-100 text-primary"
                              )}
                              onClick={() =>
                                setExpandedNotes((prev) => ({
                                  ...prev,
                                  [step.originalIndex]: true,
                                }))
                              }
                            >
                              <StickyNote className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {hasNotes ? "View/Edit notes" : "Add note"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </TooltipProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
