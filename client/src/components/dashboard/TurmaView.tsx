import MentoradoCard from "@/components/MentoradoCard";
import { analiseData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

interface TurmaViewProps {
  type: "estrutura" | "escala";
}

export function TurmaView({ type }: TurmaViewProps) {
  const data =
    type === "estrutura" ? analiseData.neon_estrutura : analiseData.neon_escala;

  const benchmarks = data.benchmarks;
  const metrics = data.analise;

  const totalFaturamento = Object.values(metrics).reduce(
    (acc, curr) => acc + curr.dados.faturamento,
    0
  );

  const mediaFaturamento = totalFaturamento / Object.keys(metrics).length;

  const title = type === "estrutura" ? "Neon Estrutura" : "Neon Escala";
  const subtitle =
    type === "estrutura"
      ? "Análise detalhada da turma de estruturação"
      : "Análise detalhada da turma de escala";

  const themeColor =
    type === "estrutura"
      ? "text-neon-purple border-neon-purple/20 bg-neon-purple/5"
      : "text-neon-green-dark border-neon-green/20 bg-neon-green/5";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Benchmarks Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={themeColor}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" /> Meta de Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(benchmarks.meta_faturamento)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Por mentorado / mês</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Média Realizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(mediaFaturamento)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {((mediaFaturamento / benchmarks.meta_faturamento) * 100).toFixed(
                1
              )}
              % da meta
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Ações Esperadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Posts Feed:</span>
                <span className="font-bold">{benchmarks.posts_feed_min}</span>
              </div>
              <div className="flex justify-between">
                <span>Stories:</span>
                <span className="font-bold">{benchmarks.stories_min}</span>
              </div>
              {type === "estrutura" ? (
                <div className="flex justify-between">
                  <span>Procedimentos:</span>
                  <span className="font-bold">
                    {(benchmarks as any).procedimentos_min}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>Leads:</span>
                  <span className="font-bold">
                    {(benchmarks as any).leads_min}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentorados Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Ranking de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.ranking.map(([nome, score], index) => (
            <MentoradoCard
              key={nome}
              nome={nome}
              data={metrics[nome]}
              rank={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
