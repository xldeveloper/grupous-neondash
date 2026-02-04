"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Save,
  StickyNote,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function getWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayOfWeek = firstDay.getDay();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

function parseContentForPreview(content: string) {
  const lines = content.split("\n");
  const steps: { type: "header" | "step"; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if it's a day header (DIA X)
    const dayMatch = trimmed.match(/^DIA\s*(\d+)/i);
    if (dayMatch) {
      steps.push({ type: "header", text: trimmed });
      continue;
    }

    // Check if it's an actionable item
    const itemMatch = trimmed.match(/^[-•☐[\]]\s*(.+)$/);
    if (itemMatch) {
      steps.push({ type: "step", text: itemMatch[1] });
      continue;
    }

    // Check for lines starting with category markers like (G), (R), (V), (M)
    const categoryMatch = trimmed.match(/^\([GRVM]\)\s*(.+)$/i);
    if (categoryMatch) {
      steps.push({ type: "step", text: categoryMatch[1] });
      continue;
    }

    // Check for lines starting with emoji
    const emojiMatch = trimmed.match(/^[\u{1F300}-\u{1F9FF}]/u);
    if (emojiMatch) {
      steps.push({ type: "step", text: trimmed });
    }
  }

  return steps;
}

export function WeeklyPlanningAdmin() {
  const now = new Date();
  const [selectedMentoradoId, setSelectedMentoradoId] = useState<number | null>(null);
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [semana, setSemana] = useState(getWeekOfMonth(now));
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  const { data: mentorados, isLoading: isLoadingMentorados } = trpc.mentorados.list.useQuery();

  const { data: existingPlan, isLoading: isLoadingPlan } = trpc.planejamento.list.useQuery(
    { mentoradoId: selectedMentoradoId ?? undefined, limit: 50 },
    { enabled: !!selectedMentoradoId }
  );

  const upsertMutation = trpc.planejamento.upsert.useMutation();

  // Auto-load existing plan when mentorado/week changes
  const currentPlan = useMemo(() => {
    if (!existingPlan) return null;
    return existingPlan.find((p) => p.ano === ano && p.mes === mes && p.semana === semana);
  }, [existingPlan, ano, mes, semana]);

  // Load existing plan data into form
  useMemo(() => {
    if (currentPlan) {
      setTitulo(currentPlan.titulo);
      setConteudo(currentPlan.conteudo);
    } else {
      setTitulo(`Planejamento Semana ${semana} - ${MONTHS[mes - 1]} ${ano}`);
      setConteudo("");
    }
  }, [currentPlan, semana, mes, ano]);

  const handleSave = async () => {
    if (!selectedMentoradoId || !titulo.trim() || !conteudo.trim()) return;

    await upsertMutation.mutateAsync({
      mentoradoId: selectedMentoradoId,
      semana,
      ano,
      mes,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
    });
  };

  const previewSteps = useMemo(() => parseContentForPreview(conteudo), [conteudo]);

  const selectedMentorado = mentorados?.find((m) => m.id === selectedMentoradoId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Left Column: Editor */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b border-border/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Planejamento Semanal</CardTitle>
              <CardDescription>Crie ou edite o planejamento para um mentorado</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Mentorado Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              Selecionar Mentorado
            </Label>
            {isLoadingMentorados ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedMentoradoId?.toString() ?? ""}
                onValueChange={(v) => setSelectedMentoradoId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um mentorado..." />
                </SelectTrigger>
                <SelectContent>
                  {mentorados?.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nomeCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Week Selection */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Semana</Label>
              <Select value={semana.toString()} onValueChange={(v) => setSemana(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((w) => (
                    <SelectItem key={w} value={w.toString()}>
                      Semana {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Mês</Label>
              <Select value={mes.toString()} onValueChange={(v) => setMes(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Ano</Label>
              <Select value={ano.toString()} onValueChange={(v) => setAno(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <StickyNote className="w-4 h-4" />
              Título
            </Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Planejamento Semana 1 - Janeiro 2024"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              Conteúdo do Planejamento
            </Label>
            <Textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder={`Cole aqui o planejamento no formato:

DIA 1
- (G) Verificar métricas do CRM
- (R) Responder mensagens pendentes
- (V) Fazer 3 stories de vendas

DIA 2
...`}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={
              !selectedMentoradoId || !titulo.trim() || !conteudo.trim() || upsertMutation.isPending
            }
            className="w-full"
            size="lg"
          >
            {upsertMutation.isPending ? (
              "Salvando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Planejamento
              </>
            )}
          </Button>

          {upsertMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-500 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Planejamento salvo com sucesso!
            </motion.div>
          )}

          {upsertMutation.isError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              Erro ao salvar. Tente novamente.
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Right Column: Preview */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="border-b border-border/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <ClipboardList className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>Como o mentorado verá o planejamento</CardDescription>
              </div>
            </div>
            {selectedMentorado && (
              <Badge variant="outline" className="bg-primary/5">
                {selectedMentorado.nomeCompleto}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {isLoadingPlan && selectedMentoradoId && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {!selectedMentoradoId && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-30" />
              <p>Selecione um mentorado para visualizar o preview</p>
            </div>
          )}

          {selectedMentoradoId && !isLoadingPlan && (
            <AnimatePresence mode="wait">
              {previewSteps.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
                >
                  <ClipboardList className="w-12 h-12 mb-4 opacity-30" />
                  <p>Cole o conteúdo do planejamento para ver o preview</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
                >
                  {previewSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={
                        step.type === "header" ? "pt-4 first:pt-0" : "flex items-start gap-3 py-1"
                      }
                    >
                      {step.type === "header" ? (
                        <h4 className="font-semibold text-primary border-b border-primary/20 pb-1">
                          {step.text}
                        </h4>
                      ) : (
                        <>
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
                          </div>
                          <span className="text-sm text-foreground/80">{step.text}</span>
                        </>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {currentPlan && (
            <div className="mt-6 pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground">
                Planejamento existente • Última atualização:{" "}
                {new Date(currentPlan.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
