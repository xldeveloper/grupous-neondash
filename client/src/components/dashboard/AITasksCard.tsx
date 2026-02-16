import { AnimatePresence, motion } from "framer-motion";
import { Archive, BrainCircuit, CheckCircle2, ListTodo, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti"; // Using Confetti again as requested in AT-004 logic
import { useWindowSize } from "react-use"; // Ensure react-use is installed or remove if unused (kept from original intent)
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CelebrationEffect } from "@/components/ui/celebration-effect";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

interface AITasksCardProps {
  mentoradoId?: number;
  isAdmin?: boolean;
}

export function AITasksCard({ mentoradoId, isAdmin }: AITasksCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef<number | null>(null);
  const [activeTab, setActiveTab] = useState("ai");
  const { width, height } = useWindowSize();

  // Cleanup confetti timeout on unmount to avoid stale setState
  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        window.clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  const {
    data: tasksData,
    isLoading,
    refetch,
  } = trpc.tasks.list.useQuery(
    {
      mentoradoId,
      search: "",
    },
    {
      enabled: !!mentoradoId || !isAdmin,
    }
  );

  const archiveMutation = trpc.tasks.archivePlanTasks.useMutation({
    onSuccess: (data) => {
      toast.success("Tasks Archived! 📦", {
        description: `${data.count} tasks were moved to Completed.`,
        duration: 3000,
      });
      refetch();
    },
  });

  const generateMutation = trpc.tasks.generateFromAI.useMutation({
    onSuccess: (data) => {
      toast.success("Tactical Plan Generated! ✨", {
        description: `${data.count} new missions were added to your dashboard.`,
        duration: 5000,
      });
      refetch();
      setActiveTab("ai");
    },
    onError: (err) => {
      // Map error codes to user-friendly messages
      let title = "Error generating plan";
      let description = err.message;

      // Check for specific error patterns
      const errorMessage = err.message?.toLowerCase() || "";

      if (errorMessage.includes("timeout") || errorMessage.includes("too long")) {
        title = "⏱️ Time Exceeded";
        description = "The AI took too long to respond. Please try again in a few seconds.";
      } else if (errorMessage.includes("configuration") || errorMessage.includes("administrator")) {
        title = "⚙️ Pending Configuration";
        description = "The AI integration has not been configured yet. Contact the administrator.";
      } else if (errorMessage.includes("rate limit") || errorMessage.includes("limit reached")) {
        title = "🚦 Request Limit";
        description = "Too many requests sent. Please wait a moment and try again.";
      } else if (errorMessage.includes("connection") || errorMessage.includes("network")) {
        title = "📡 Connection Error";
        description = "Check your internet connection and try again.";
      } else if (errorMessage.includes("unavailable")) {
        title = "🔧 Service Temporarily Unavailable";
        description = "The AI service is under maintenance. Please try again in a few minutes.";
      } else if (errorMessage.includes("model") || errorMessage.includes("not found")) {
        title = "🤖 AI Model Unavailable";
        description = "The AI model was not found. Contact the administrator.";
      }

      toast.error(title, {
        description,
        duration: 6000,
      });
    },
  });

  const toggleMutation = trpc.tasks.toggle.useMutation({
    onSuccess: (data) => {
      if (data.status === "done") {
        const isAiTask = data.source === "ai_coach" || data.category === "atividade";
        if (isAiTask) {
          setShowConfetti(true);
          if (confettiTimeoutRef.current) {
            window.clearTimeout(confettiTimeoutRef.current);
          }
          confettiTimeoutRef.current = window.setTimeout(() => {
            setShowConfetti(false);
            confettiTimeoutRef.current = null;
          }, 5000);
          toast.success("Mission Accomplished! 🚀");
        } else {
          toast.success("Task completed!");
        }
      }
      refetch();
    },
  });

  // Filter Tasks
  const aiTasks =
    tasksData?.filter(
      (t) => (t.source === "ai_coach" || t.category === "atividade") && t.status !== "archived"
    ) || [];
  const manualTasks =
    tasksData?.filter(
      (t) => t.source !== "ai_coach" && t.category !== "atividade" && t.status !== "archived"
    ) || [];
  const archivedTasks = tasksData?.filter((t) => t.status === "archived") || [];

  const completedAiTasks = aiTasks.filter((t) => t.status === "done").length;
  const totalAiTasks = aiTasks.length;
  const progress = totalAiTasks === 0 ? 0 : Math.round((completedAiTasks / totalAiTasks) * 100);

  const handleGenerateNewPlan = () => {
    // Archive current done tasks first, then generate new plan
    archiveMutation.mutate(
      { mentoradoId },
      {
        onSuccess: () => {
          generateMutation.mutate({ mentoradoId });
        },
      }
    );
  };

  const handleGenerate = () => {
    generateMutation.mutate({ mentoradoId });
  };

  const handleToggle = (id: number) => {
    toggleMutation.mutate({ id });
  };

  if (isLoading) return <AITasksSkeleton />;

  return (
    <Card className="relative overflow-hidden border-primary/20 dark:border-primary/20 shadow-lg bg-gradient-to-br from-card to-primary/5 dark:from-slate-950 dark:to-slate-900/50">
      {/* Confetti for standard celebration */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
        />
      )}

      {/* Celebration Effect Component Trigger */}
      <CelebrationEffect trigger={showConfetti} />

      {/* Decorative Background Elements */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent z-10 relative">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
            <BrainCircuit className="w-6 h-6 text-[#D4AF37]" />
            N.E.O.N. Coach
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span
              className={`inline-block h-2 w-2 rounded-full ${progress === 100 ? "bg-green-500 shadow-[0_0_8px_theme(colors.green.500)]" : "bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"}`}
            />
            {progress}% of AI Plan Complete
          </div>
        </div>

        {generateMutation.isPending || archiveMutation.isPending ? (
          <Button disabled variant="outline" className="border-primary/20 bg-primary/5">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {archiveMutation.isPending ? "Archiving..." : "Generating..."}
          </Button>
        ) : totalAiTasks === 0 ? (
          <Button
            onClick={handleGenerate}
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-primary to-[#D4AF37] hover:from-primary/90 hover:to-[#D4AF37]/90 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Plan
          </Button>
        ) : progress === 100 ? (
          <Button
            onClick={handleGenerateNewPlan}
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        ) : isAdmin ? (
          <Button
            onClick={handleGenerate}
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="z-10 relative space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50">
            <TabsTrigger
              value="ai"
              className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <BrainCircuit className="w-4 h-4 mr-2" />
              AI Plan
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="data-[state=active]:bg-background data-[state=active]:text-blue-500 data-[state=active]:shadow-sm"
            >
              <ListTodo className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="data-[state=active]:bg-background data-[state=active]:text-muted-foreground data-[state=active]:shadow-sm"
            >
              <Archive className="w-4 h-4 mr-2" />
              Completed
              {archivedTasks.length > 0 && (
                <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                  {archivedTasks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 min-h-[150px]">
            {totalAiTasks > 0 && (
              <Progress
                value={progress}
                className="h-1.5 bg-muted/50 mb-4"
                indicatorClassName="bg-gradient-to-r from-primary to-[#D4AF37]"
              />
            )}

            {totalAiTasks === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-muted/10 rounded-xl border border-dashed border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No active plan</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Ask the Neon Coach for a new tactical plan for this week.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {aiTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-3 min-h-[150px]">
            {manualTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <ListTodo className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No manual tasks found.</p>
              </div>
            ) : (
              manualTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={handleToggle} variant="manual" />
              ))
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-3 min-h-[150px]">
            {archivedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Archive className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No archived tasks yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Complete an AI plan to see your achievements here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 border border-transparent opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500/60" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                        {task.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground/50">
                        {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString("en-US") : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TaskItem({
  task,
  onToggle,
  variant = "ai",
}: {
  task: any;
  onToggle: (id: number) => void;
  variant?: "ai" | "manual";
}) {
  const isDone = task.status === "done";
  const doneClass = isDone
    ? "bg-muted/30 border-transparent opacity-60"
    : variant === "ai"
      ? "bg-card border-border hover:border-primary/30 hover:shadow-sm"
      : "bg-card border-border hover:border-blue-500/30 hover:shadow-sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      layout
      className={`group flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${doneClass}`}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={() => onToggle(task.id)}
        className={`mt-1 ${variant === "ai" ? "data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]" : "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"}`}
      />
      <div className="flex-1 space-y-1 cursor-pointer" onClick={() => onToggle(task.id)}>
        <p
          className={`text-sm font-medium leading-normal transition-colors ${
            isDone
              ? "text-muted-foreground line-through decoration-muted-foreground/50"
              : variant === "ai"
                ? "text-foreground group-hover:text-primary"
                : "text-foreground group-hover:text-blue-500"
          }`}
        >
          {task.title}
        </p>

        {/* Priority Badge */}
        {!isDone && variant === "ai" && (
          <span className="inline-flex items-center text-[10px] uppercase font-bold text-[#D4AF37]/80 bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">
            {task.priority || "Normal"}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function AITasksSkeleton() {
  return (
    <div className="w-full h-[300px] border border-border rounded-xl bg-card animate-pulse p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-10 bg-muted rounded w-32" />
      </div>
      <div className="h-10 bg-muted rounded w-full" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg w-full" />
        ))}
      </div>
    </div>
  );
}
