import { CheckCircle2, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NeonCard } from "@/components/ui/neon-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { EmptyFilterResult } from "./EmptyFilterResult";
import { TaskFilterToolbar } from "./TaskFilterToolbar";

interface TaskFilters {
  search: string;
  category: string;
  priority: string;
}

// Priority badge styling
const PRIORITY_STYLES = {
  alta: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  media: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  baixa: "bg-slate-500/20 text-slate-400 border-slate-500/50",
} as const;

const PRIORITY_LABELS = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
} as const;

export function TaskBoard({ mentoradoId }: { mentoradoId?: number }) {
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"alta" | "media" | "baixa">("media");
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    category: "",
    priority: "",
  });
  const utils = trpc.useContext();

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({
    mentoradoId,
    search: filters.search || undefined,
    category: filters.category || undefined,
    priority: (filters.priority as "alta" | "media" | "baixa") || undefined,
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      setNewTask("");
      setNewTaskPriority("media");
    },
  });

  const toggleTask = trpc.tasks.toggle.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    createTask.mutate({
      title: newTask,
      category: "geral",
      priority: newTaskPriority,
      mentoradoId,
    });
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "", priority: "" });
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-800 rounded-xl" />;
  }

  const todoTasks = tasks?.filter((t) => t.status === "todo") || [];
  const doneTasks = tasks?.filter((t) => t.status === "done") || [];
  const hasActiveFilters = filters.search || filters.category || filters.priority;
  const noResults = hasActiveFilters && todoTasks.length === 0 && doneTasks.length === 0;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono text-neon-gold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          TAREFAS [DBE]
        </h2>
      </div>

      {/* Filter Toolbar */}
      <TaskFilterToolbar filters={filters} onFiltersChange={setFilters} className="mb-2" />

      <NeonCard className="flex-1 flex flex-col overflow-hidden bg-card border-border">
        <Tabs defaultValue="todo" className="flex-1 flex flex-col p-4 w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted border border-border">
            <TabsTrigger
              value="todo"
              className="data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue font-mono"
            >
              A Fazer ({todoTasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="done"
              className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold font-mono"
            >
              Concluídas ({doneTasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Create Task Form */}
          <form onSubmit={handleCreate} className="flex gap-2 mb-4">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nova tarefa..."
              className="bg-background border-input focus:border-neon-blue font-mono text-sm flex-1"
            />
            <Select
              value={newTaskPriority}
              onValueChange={(v) => setNewTaskPriority(v as "alta" | "media" | "baixa")}
            >
              <SelectTrigger className="w-[100px] bg-background border-input font-mono text-sm">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta" className="font-mono text-amber-400">
                  Alta
                </SelectItem>
                <SelectItem value="media" className="font-mono text-blue-400">
                  Média
                </SelectItem>
                <SelectItem value="baixa" className="font-mono text-slate-400">
                  Baixa
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              size="icon"
              disabled={createTask.isPending}
              className="bg-neon-blue hover:bg-neon-blue/80 text-black"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          {/* Empty State for Filters */}
          {noResults && <EmptyFilterResult onClearFilters={clearFilters} />}

          {/* Todo Tasks */}
          <TabsContent value="todo" className="flex-1 mt-0">
            <ScrollArea className="h-[300px] w-full pr-4">
              <div className="space-y-2">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      "bg-slate-900/80 border border-primary/20",
                      "group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]",
                      "transition-all duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => toggleTask.mutate({ id: task.id })}
                        className="border-slate-600 data-[state=checked]:bg-neon-gold data-[state=checked]:text-black"
                      />
                      <span className="text-sm text-slate-300 font-mono">{task.title}</span>

                      {/* Priority Badge */}
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-5 font-mono border",
                          PRIORITY_STYLES[task.priority]
                        )}
                      >
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>

                      {/* Source Badge */}
                      {task.source === "atividade" && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-400 text-[10px] px-1.5 py-0 h-5 font-mono"
                        >
                          <Play className="w-2.5 h-2.5 mr-0.5" />
                          PLAY
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {todoTasks.length === 0 && !noResults && (
                  <div className="text-center py-8 text-slate-500 font-mono text-sm">
                    Nenhuma tarefa pendente
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Done Tasks */}
          <TabsContent value="done" className="flex-1 mt-0">
            <ScrollArea className="h-[300px] w-full pr-4">
              <div className="space-y-2">
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50"
                  >
                    <div className="flex items-center gap-3 opacity-60">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => toggleTask.mutate({ id: task.id })}
                        className="border-slate-600"
                      />
                      <span className="text-sm text-slate-400 font-mono line-through">
                        {task.title}
                      </span>

                      {/* Priority Badge (muted) */}
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5 font-mono border border-slate-600/50 text-slate-500"
                      >
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>

                      {task.source === "atividade" && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500/30 text-yellow-500/50 text-[10px] px-1.5 py-0 h-5 font-mono"
                        >
                          <Play className="w-2.5 h-2.5 mr-0.5" />
                          PLAY
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask.mutate({ id: task.id })}
                      className="h-8 w-8 text-slate-600 hover:text-red-500 hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </NeonCard>
    </div>
  );
}
