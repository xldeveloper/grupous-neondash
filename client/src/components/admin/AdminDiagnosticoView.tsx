import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export function AdminDiagnosticoView({ mentoradoId }: { mentoradoId: number }) {
  const { data: diagnostico, isLoading } = trpc.diagnostico.get.useQuery(
    { mentoradoId },
    { enabled: !!mentoradoId }
  );

  if (!mentoradoId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 rounded-xl border border-white/10">
        <AlertCircle className="w-12 h-12 text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">Select a mentee</h3>
        <p className="text-gray-500 mt-2">
          Select a mentee above to view their diagnosis.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!diagnostico) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 rounded-xl border border-white/10">
        <AlertCircle className="w-12 h-12 text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">Diagnosis not completed</h3>
        <p className="text-gray-500 mt-2">The mentee has not completed the initial diagnosis yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            About Your Current Professional Moment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-white text-sm">Healthcare Area of Practice</h4>
            <p className="text-gray-400">{diagnostico.atuacaoSaude || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Free Time</h4>
            <p className="text-gray-400">{diagnostico.tempoLivre || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Already working in Aesthetics?</h4>
            <p className="text-gray-400">{diagnostico.jaAtuaEstetica || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Has a Clinic/Office?</h4>
            <p className="text-gray-400">{diagnostico.temClinica || "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-400">Current Results (Financial)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-white text-sm">Current Monthly Income</h4>
            <p className="text-gray-400">{diagnostico.rendaMensal || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">How much revenue from Aesthetics?</h4>
            <p className="text-gray-400">{diagnostico.faturaEstetica || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Bills Amount (fixed+variable)</h4>
            <p className="text-gray-400">{diagnostico.contas || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Ideal Cost of Living</h4>
            <p className="text-gray-400">{diagnostico.custoVida || "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-400">Pain Points and Challenges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-white text-sm">What bothers you most in your routine?</h4>
            <p className="text-gray-400">{diagnostico.incomodaRotina || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Biggest difficulty to grow</h4>
            <p className="text-gray-400">{diagnostico.dificuldadeCrescer || "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon-gold/20 bg-neon-gold/5">
        <CardHeader>
          <CardTitle className="text-neon-gold">Goals and Dreams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-white text-sm">6-Month Goal</h4>
            <p className="text-gray-400">{diagnostico.objetivo6Meses || "Not provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Transformative Result</h4>
            <p className="text-gray-400">{diagnostico.resultadoTransformador || "Not provided"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon-pink/20 bg-neon-pink/5">
        <CardHeader>
          <CardTitle className="text-neon-pink">First Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-white text-sm">Organization</h4>
            <div className="text-gray-400 whitespace-pre-wrap">
              {diagnostico.organizacao || "Not provided"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
