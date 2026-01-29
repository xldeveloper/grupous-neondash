import { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Circle,
  Play,
  Loader2,
  StickyNote,
  Plus,
  ListTodo,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface NoteDialogState {
  open: boolean;
  atividadeCodigo: string;
  stepCodigo: string;
  stepLabel: string;
  currentNote: string;
}

interface TaskDialogState {
  open: boolean;
  atividadeCodigo: string;
  atividadeTitulo: string;
  taskTitle: string;
}

/**
 * Componente interativo para atividades do PLAY NEON
 * - Lista atividades expansíveis (Accordion)
 * - Checkboxes para marcar passos como concluídos
 * - Notas pessoais para cada passo
 * - Criação de tarefas a partir de atividades
 * - Barra de progresso geral
 */
export function AtividadesContent({ mentoradoId }: AtividadesContentProps) {
  // Dialog states
  const [noteDialog, setNoteDialog] = useState<NoteDialogState>({
    open: false,
    atividadeCodigo: "",
    stepCodigo: "",
    stepLabel: "",
    currentNote: "",
  });

  const [taskDialog, setTaskDialog] = useState<TaskDialogState>({
    open: false,
    atividadeCodigo: "",
    atividadeTitulo: "",
    taskTitle: "",
  });

  // Fetch progress from server
  const progressQuery = mentoradoId
    ? trpc.atividades.getProgressById.useQuery({ mentoradoId })
    : trpc.atividades.getProgress.useQuery();

  const toggleMutation = trpc.atividades.toggleStep.useMutation({
    onSuccess: () => progressQuery.refetch(),
  });

  const updateNoteMutation = trpc.atividades.updateNote.useMutation({
    onSuccess: () => {
      progressQuery.refetch();
      setNoteDialog((prev) => ({ ...prev, open: false }));
    },
  });

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      setTaskDialog((prev) => ({ ...prev, open: false, taskTitle: "" }));
    },
  });

  const progressMap = progressQuery.data ?? {};
  const { total, completed, percentage } = calcularProgresso(
    Object.fromEntries(
      Object.entries(progressMap).map(([k, v]) => [k, v.completed])
    )
  );
  const atividadesByEtapa = getAtividadesByEtapa();

  const handleToggle = (atividadeCodigo: string, stepCodigo: string) => {
    if (mentoradoId) return; // Admin can't toggle for mentorado

    const key = `${atividadeCodigo}:${stepCodigo}`;
    const currentlyCompleted = progressMap[key]?.completed ?? false;

    toggleMutation.mutate({
      atividadeCodigo,
      stepCodigo,
      completed: !currentlyCompleted,
    });
  };

  const openNoteDialog = (
    atividadeCodigo: string,
    stepCodigo: string,
    stepLabel: string
  ) => {
    const key = `${atividadeCodigo}:${stepCodigo}`;
    const currentNote = progressMap[key]?.notes ?? "";
    setNoteDialog({
      open: true,
      atividadeCodigo,
      stepCodigo,
      stepLabel,
      currentNote,
    });
  };

  const saveNote = () => {
    updateNoteMutation.mutate({
      atividadeCodigo: noteDialog.atividadeCodigo,
      stepCodigo: noteDialog.stepCodigo,
      notes: noteDialog.currentNote,
    });
  };

  const openTaskDialog = (atividadeCodigo: string, atividadeTitulo: string) => {
    setTaskDialog({
      open: true,
      atividadeCodigo,
      atividadeTitulo,
      taskTitle: "",
    });
  };

  const createTask = () => {
    if (!taskDialog.taskTitle.trim()) return;
    createTaskMutation.mutate({
      title: taskDialog.taskTitle,
      category: "atividade",
      source: "atividade",
      atividadeCodigo: taskDialog.atividadeCodigo,
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
                  return progressMap[key]?.completed;
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

                      {/* Botão para criar tarefa */}
                      {!isReadOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mb-3 border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                          onClick={() =>
                            openTaskDialog(atividade.codigo, atividade.titulo)
                          }
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Criar Tarefa
                        </Button>
                      )}

                      <div className="space-y-2">
                        {atividade.steps.map((step) => {
                          const key = `${atividade.codigo}:${step.codigo}`;
                          const stepData = progressMap[key] ?? {
                            completed: false,
                            notes: null,
                          };
                          const isCompleted = stepData.completed;
                          const hasNote = !!stepData.notes;
                          const isPending =
                            toggleMutation.isPending &&
                            toggleMutation.variables?.atividadeCodigo ===
                              atividade.codigo &&
                            toggleMutation.variables?.stepCodigo ===
                              step.codigo;

                          return (
                            <div
                              key={step.codigo}
                              className="flex items-center gap-3 py-1 group"
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
                                className={`text-sm cursor-pointer select-none flex-1 ${
                                  isCompleted
                                    ? "text-zinc-500 line-through"
                                    : "text-zinc-200"
                                }`}
                              >
                                {step.label}
                              </label>

                              {/* Ícone de nota */}
                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openNoteDialog(
                                      atividade.codigo,
                                      step.codigo,
                                      step.label
                                    )
                                  }
                                  className={`p-1 rounded hover:bg-zinc-700 transition-opacity ${
                                    hasNote
                                      ? "text-yellow-400"
                                      : "text-zinc-500 opacity-0 group-hover:opacity-100"
                                  }`}
                                  title={hasNote ? "Editar nota" : "Adicionar nota"}
                                >
                                  <StickyNote className="w-4 h-4" />
                                </button>
                              )}

                              {/* Indicador de nota (readonly) */}
                              {isReadOnly && hasNote && (
                                <span
                                  className="text-yellow-400"
                                  title={stepData.notes ?? ""}
                                >
                                  <StickyNote className="w-4 h-4" />
                                </span>
                              )}

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

      {/* Dialog para Notas */}
      <Dialog
        open={noteDialog.open}
        onOpenChange={(open) => setNoteDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-yellow-400" />
              Nota Pessoal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{noteDialog.stepLabel}</p>
            <Textarea
              value={noteDialog.currentNote}
              onChange={(e) =>
                setNoteDialog((prev) => ({
                  ...prev,
                  currentNote: e.target.value,
                }))
              }
              placeholder="Escreva suas anotações aqui..."
              className="bg-zinc-800 border-zinc-600 text-white min-h-[120px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-600 text-zinc-300"
              onClick={() => setNoteDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveNote}
              disabled={updateNoteMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {updateNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Criar Tarefa */}
      <Dialog
        open={taskDialog.open}
        onOpenChange={(open) => setTaskDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-yellow-400" />
              Criar Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">
              Vinculada à: <span className="text-zinc-300">{taskDialog.atividadeTitulo}</span>
            </p>
            <Input
              value={taskDialog.taskTitle}
              onChange={(e) =>
                setTaskDialog((prev) => ({
                  ...prev,
                  taskTitle: e.target.value,
                }))
              }
              placeholder="Título da tarefa..."
              className="bg-zinc-800 border-zinc-600 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-600 text-zinc-300"
              onClick={() => setTaskDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancelar
            </Button>
            <Button
              onClick={createTask}
              disabled={
                createTaskMutation.isPending || !taskDialog.taskTitle.trim()
              }
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {createTaskMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
