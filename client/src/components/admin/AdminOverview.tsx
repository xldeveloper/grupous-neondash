import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminOverview() {
  const { data: mentorados, isLoading } = trpc.mentorados.list.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const totalMentorados = mentorados?.length || 0;
  const estruturaCount =
    mentorados?.filter((m: any) => m.turma === "neon_estrutura").length || 0;
  const escalaCount =
    mentorados?.filter((m: any) => m.turma === "neon_escala").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-neon-purple" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Total de Mentorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {totalMentorados}
            </div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="bg-neon-purple/10 text-neon-purple px-2 py-0.5 rounded-full font-medium">
                {estruturaCount} Estrutura
              </span>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {escalaCount} Escala
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-16 h-16 text-neon-green" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Último Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">Dez/2025</div>
            <p className="text-xs text-slate-400 mt-1">
              Dados migrados com sucesso
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-neon-pink" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Operacional
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Todos os serviços ativos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
