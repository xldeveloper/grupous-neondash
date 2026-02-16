import { Activity, DollarSign, TrendingUp, Users } from "lucide-react";
import { NeonCard } from "@/components/ui/neon-card";
import { trpc } from "@/lib/trpc";

export function NeonCRM({ mentoradoId }: { mentoradoId?: number }) {
  const { data: stats, isLoading } = trpc.leads.stats.useQuery(
    { mentoradoId },
    { enabled: !!mentoradoId }
  );

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-slate-800 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono text-primary flex items-center gap-2">
          <Activity className="w-5 h-5" />
          CRM [DBE]
        </h2>
        <span className="text-xs text-slate-400 font-mono">Real-time</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NeonCard className="p-4 border-primary/20 bg-card hover:border-primary/50 transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-mono uppercase">Active Leads</span>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stats?.totalAtivos || 0}</span>
            </div>
          </div>
        </NeonCard>

        <NeonCard className="p-4 border-primary/20 bg-card hover:border-primary/50 transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-mono uppercase">Pipeline (R$)</span>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {stats?.valorPipeline?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }) || "R$ 0,00"}
              </span>
            </div>
          </div>
        </NeonCard>

        <NeonCard className="p-4 border-teal-500/20 bg-card hover:border-teal-500/50 transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-mono uppercase">Conversion</span>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span className="text-2xl font-bold text-foreground">
                {stats?.taxaConversao?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </NeonCard>

        <NeonCard className="p-4 border-emerald-500/20 bg-card hover:border-emerald-500/50 transition-colors">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-mono uppercase">Avg. Time</span>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-2xl font-bold text-foreground">
                {stats?.tempoMedioFechamento || 0}d
              </span>
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  );
}
