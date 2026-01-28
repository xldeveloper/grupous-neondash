import DashboardLayout from "@/components/DashboardLayout";
import { SubmitMetricsForm } from "@/components/dashboard/SubmitMetricsForm";
import { NeonCard } from "@/components/ui/neon-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Enviar Métricas
          </h1>
          <p className="text-gray-400 mt-1">
            Mantenha seus dados atualizados para acompanhar sua evolução.
          </p>
        </div>

        <NeonCard>
          <CardHeader>
            <CardTitle>Métricas Mensais</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo com os dados do mês de referência.
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <SubmitMetricsForm />
          </div>
        </NeonCard>
      </div>
    </DashboardLayout>
  );
}
