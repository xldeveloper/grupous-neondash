import { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Circle,
  Play,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import {
  ATIVIDADES,
  getAtividadesByEtapa,
  calcularProgresso,
  type Atividade,
  type AtividadeStep,
} from "@/data/atividades-data";

interface AtividadesContentProps {
  mentoradoId?: number; // For admin viewing specific mentorado
}

/**
 * Componente interativo para atividades do PLAY NEON
 * - Lista atividades expansíveis (Accordion)
 * - Checkboxes para marcar passos como concluídos
 * - Barra de progresso geral
 */
export function AtividadesContent({ mentoradoId }: AtividadesContentProps) {
  // Fetch progress from server
  const progressQuery = mentoradoId
    ? trpc.atividades.getProgressById.useQuery({ mentoradoId })
    : trpc.atividades.getProgress.useQuery();

  const toggleMutation = trpc.atividades.toggleStep.useMutation({
    onSuccess: () => {
      progressQuery.refetch();
    },
  });

  const progressMap = progressQuery.data ?? {};
  const { total, completed, percentage } = calcularProgresso(progressMap);
  const atividadesByEtapa = getAtividadesByEtapa();

  const handleToggle = (atividadeCodigo: string, stepCodigo: string) => {
    if (mentoradoId) return; // Admin can't toggle for mentorado

    const key = `${atividadeCodigo}:${stepCodigo}`;
    const currentlyCompleted = progressMap[key] ?? false;

    toggleMutation.mutate({
      atividadeCodigo,
      stepCodigo,
      completed: !currentlyCompleted,
    });
  };

  const isReadOnly = !!mentoradoId;

  if (progressQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com ícone */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Play className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">PLAY NEON</h2>
          <p className="text-zinc-400 text-sm">
            Sua jornada de crescimento começa aqui
          </p>
        </div>
      </div>

      {/* Callout principal */}
      <Card className="bg-zinc-800/50 border-yellow-500/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Bookmark className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold">
              Aqui nossa jornada DE FATO começará a acontecer.
            </p>
            <p className="text-zinc-300 mt-1">
              Nessa página você encontrará todas as ferramentas e etapas para
              implementar na sua jornada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Barra de Progresso Geral */}
      <Card className="bg-zinc-900/70 border-zinc-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-300">
              Progresso Geral
            </span>
            <span className="text-sm font-bold text-yellow-400">
              {completed}/{total} passos ({percentage}%)
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Atividades agrupadas por etapa */}
      <div className="space-y-4">
        {Object.entries(atividadesByEtapa).map(([etapa, atividades]) => (
          <div key={etapa}>
            <h3 className="text-lg font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              {etapa}
            </h3>

            <Accordion type="multiple" className="space-y-2">
              {atividades.map((atividade) => {
                const atividadeCompleted = atividade.steps.filter((step) => {
                  const key = `${atividade.codigo}:${step.codigo}`;
                  return progressMap[key];
                }).length;
                const atividadeTotal = atividade.steps.length;
                const atividadePercentage =
                  atividadeTotal > 0
                    ? Math.round((atividadeCompleted / atividadeTotal) * 100)
                    : 0;

                return (
                  <AccordionItem
                    key={atividade.codigo}
                    value={atividade.codigo}
                    className="bg-zinc-900/50 border border-zinc-700 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:bg-zinc-800/50 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className="text-xl">{atividade.icone}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {atividade.titulo}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={atividadePercentage}
                              className="h-1.5 flex-1 max-w-32"
                            />
                            <span className="text-xs text-zinc-500">
                              {atividadeCompleted}/{atividadeTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {atividade.descricao && (
                        <p className="text-sm text-zinc-400 mb-3">
                          {atividade.descricao}
                        </p>
                      )}
                      <div className="space-y-2">
                        {atividade.steps.map((step) => {
                          const key = `${atividade.codigo}:${step.codigo}`;
                          const isCompleted = progressMap[key] ?? false;
                          const isPending =
                            toggleMutation.isPending &&
                            toggleMutation.variables?.atividadeCodigo ===
                              atividade.codigo &&
                            toggleMutation.variables?.stepCodigo ===
                              step.codigo;

                          return (
                            <div
                              key={step.codigo}
                              className="flex items-center gap-3 py-1"
                            >
                              <Checkbox
                                id={key}
                                checked={isCompleted}
                                disabled={isReadOnly || isPending}
                                onCheckedChange={() =>
                                  handleToggle(atividade.codigo, step.codigo)
                                }
                                className="border-zinc-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                              <label
                                htmlFor={key}
                                className={`text-sm cursor-pointer select-none ${
                                  isCompleted
                                    ? "text-zinc-500 line-through"
                                    : "text-zinc-200"
                                }`}
                              >
                                {step.label}
                              </label>
                              {isPending && (
                                <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Nota de rodapé */}
      <p className="text-zinc-500 text-sm text-center pt-4 border-t border-zinc-700">
        {isReadOnly
          ? "Visualização do progresso do mentorado"
          : "Marque os passos concluídos para acompanhar seu progresso"}
      </p>
    </div>
  );
}
