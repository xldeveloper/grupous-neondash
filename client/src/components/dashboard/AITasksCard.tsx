import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Loader2, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CelebrationEffect } from "@/components/ui/celebration-effect";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

interface AITasksCardProps {
  mentoradoId?: number;
  isAdmin?: boolean;
}

export function AITasksCard({ mentoradoId, isAdmin }: AITasksCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    data: tasksData,
    isLoading,
    refetch,
  } = trpc.tasks.list.useQuery(
    {
      mentoradoId,
      search: "",
      category: "atividade", // We filter by this category as applied in backend
    },
    {
      // Only fetch if we have an ID (if admin) or always if user (handled by router)
      enabled: !!mentoradoId || !isAdmin,
    }
  );

  const generateMutation = trpc.tasks.generateFromAI.useMutation({
    onSuccess: (data) => {
      toast.success("Plano Tático Gerado!", {
        description: `${data.count} novas missões foram adicionadas ao seu painel.`,
      });
      refetch();
    },
    onError: (err) => {
      toast.error("Erro ao gerar plano", {
        description: err.message,
      });
    },
  });

  const toggleMutation = trpc.tasks.toggle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Calculate progress
  const aiTasks =
    tasksData?.filter((t) => t.source === "atividade" || t.category === "atividade") || [];
  const completedTasks = aiTasks.filter((t) => t.status === "done").length;
  const totalTasks = aiTasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Trigger confetti on 100% completion
  useEffect(() => {
    if (progress === 100 && totalTasks > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [progress, totalTasks]);

  const handleGenerate = () => {
    generateMutation.mutate({ mentoradoId });
  };

  const handleToggle = (id: number) => {
    toggleMutation.mutate({ id });
  };

  if (isLoading) return <AITasksSkeleton />;

  return (
    <Card className="relative overflow-hidden border-primary/20 dark:border-primary/20 shadow-lg bg-gradient-to-br from-card to-primary/5 dark:from-slate-950 dark:to-slate-900/50">
      <CelebrationEffect trigger={showConfetti} />

      {/* Decorative Background Elements */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent z-10 relative">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
            <BrainCircuit className="w-6 h-6 text-[#D4AF37]" />
            N.E.O.N. AI Coach
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">
            Seu plano tático personalizado para a semana
          </p>
        </div>

        {generateMutation.isPending ? (
          <Button disabled variant="outline" className="border-primary/20 bg-primary/5">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando Estratégia...
          </Button>
        ) : (
          (isAdmin || totalTasks === 0) && (
            <Button
              onClick={handleGenerate}
              variant="default"
              className="bg-gradient-to-r from-primary to-[#D4AF37] hover:from-primary/90 hover:to-[#D4AF37]/90 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {totalTasks === 0 ? "Gerar Missões" : "Regerar Plano"}
            </Button>
          )
        )}
      </CardHeader>

      <CardContent className="z-10 relative space-y-6">
        {/* Progress Section */}
        {totalTasks > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className={progress === 100 ? "text-[#D4AF37]" : "text-muted-foreground"}>
                {progress === 100 ? "Missão Cumprida! 🚀" : "Progresso da Missão"}
              </span>
              <span className="text-primary">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-muted/50"
              indicatorClassName="bg-gradient-to-r from-primary to-[#D4AF37]"
            />
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3 min-h-[100px]">
          {totalTasks === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 bg-muted/20 rounded-xl border border-dashed border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-primary/60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">Aguardando Ordens</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                  A IA ainda não analisou seus dados. Gere um novo plano para começar.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {aiTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  layout
                  className={`group flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                    task.status === "done"
                      ? "bg-primary/5 border-primary/10"
                      : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                  }`}
                >
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => handleToggle(task.id)}
                    className="mt-1 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                  />
                  <div
                    className="flex-1 space-y-1 cursor-pointer"
                    onClick={() => handleToggle(task.id)}
                  >
                    <p
                      className={`text-sm font-medium leading-normal transition-colors ${
                        task.status === "done"
                          ? "text-muted-foreground line-through decoration-primary/50 decoration-2"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.status === "done" && (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold text-[#D4AF37]">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completado
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AITasksSkeleton() {
  return (
    <div className="w-full h-[300px] border border-border rounded-xl bg-card animate-pulse p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-10 bg-muted rounded w-32" />
      </div>
      <div className="h-2 bg-muted rounded w-full" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg w-full" />
        ))}
      </div>
    </div>
  );
}
