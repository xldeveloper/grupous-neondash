import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function PrimeiroAcesso() {
  const { user } = useAuth();

  // Fetch diagnostic data
  const {
    data: diagnostic,
    isLoading: loadingDiag,
    refetch: refetchDiag,
  } = trpc.auth.diagnostic.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Sync mutation
  const { mutate: syncUser, isPending: syncing } = trpc.auth.syncUser.useMutation({
    onSuccess: (result) => {
      if (result.linked) {
        toast.success("Perfil vinculado com sucesso! Recarregue a página.");
        refetchDiag();
      } else {
        toast.info(result.message);
      }
    },
    onError: (err) => {
      toast.error(`Erro ao sincronizar: ${err.message}`);
    },
  });

  const handleSync = () => {
    syncUser();
  };

  const handleRefresh = () => {
    refetchDiag();
    toast.info("Verificando status...");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center mx-auto">
            <UserCircle className="w-12 h-12 text-neon-blue" />
          </div>
          <h1 className="text-3xl font-bold text-neon-blue-dark">Bem-vindo ao Neon Dashboard!</h1>
          <p className="text-muted-foreground">Estamos felizes em ter você aqui</p>
        </div>

        {/* Diagnostic Card */}
        <Card className="border-neon-blue/30 bg-gradient-to-br from-neon-blue/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-blue-dark">
              <Database className="w-5 h-5" />
              Diagnóstico de Sincronização
            </CardTitle>
            <CardDescription>Status detalhado da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingDiag ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-neon-blue" />
                <span className="ml-2 text-muted-foreground">Verificando...</span>
              </div>
            ) : diagnostic ? (
              <div className="space-y-4">
                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    className={`p-4 rounded-lg border ${diagnostic.status.isFullyLinked ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      {diagnostic.status.isFullyLinked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className="font-medium text-sm">
                        {diagnostic.status.isFullyLinked ? "Vinculado" : "Pendente"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mentorado</p>
                  </div>

                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-sm">
                        {diagnostic.clerk.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Nível de Acesso</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${diagnostic.status.multipleMatches ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      {diagnostic.status.multipleMatches ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Database className="w-5 h-5 text-slate-600" />
                      )}
                      <span className="font-medium text-sm">
                        {diagnostic.status.multipleMatches ? "Duplicatas" : "OK"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Registros</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-white rounded-lg p-4 border space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{diagnostic.clerk.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Nome:</span>
                    <span className="text-muted-foreground">
                      {diagnostic.clerk.name || "Não definido"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">ID no Banco:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {diagnostic.database.userId}
                    </Badge>
                  </div>
                  {diagnostic.mentorado && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Mentorado:</span>
                      <span className="text-muted-foreground">
                        {diagnostic.mentorado.nomeCompleto} ({diagnostic.mentorado.turma})
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {diagnostic.recommendations.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-2 text-sm">Recomendações:</h4>
                    <ul className="space-y-1">
                      {diagnostic.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loadingDiag}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                  {!diagnostic.status.isFullyLinked && diagnostic.status.hasUnlinkedMatch && (
                    <Button
                      size="sm"
                      onClick={handleSync}
                      disabled={syncing}
                      className="bg-neon-blue hover:bg-neon-blue-dark"
                    >
                      {syncing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Vincular Agora
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Erro ao carregar diagnóstico
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card - Only show if NOT linked */}
        {diagnostic && !diagnostic.status.isFullyLinked && (
          <Card className="border-amber-500/30 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Perfil Pendente de Vinculação
              </CardTitle>
              <CardDescription className="text-amber-800">
                Seu perfil de mentorado ainda não foi vinculado ao seu email de login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-amber-900">Seu email de login</div>
                    <div className="text-sm text-amber-700 mt-1">
                      {user?.email || "Email não disponível"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-amber-800 space-y-2">
                <p>
                  Para acessar seu dashboard personalizado com suas métricas e feedbacks, é
                  necessário que o administrador vincule seu email ao seu perfil de mentorado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Card - Show if linked */}
        {diagnostic?.status.isFullyLinked && (
          <Card className="border-green-500/30 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="w-5 h-5" />
                Perfil Vinculado com Sucesso!
              </CardTitle>
              <CardDescription className="text-green-800">
                Seu perfil está pronto para uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => (window.location.href = "/meu-dashboard")}
              >
                Ir para Meu Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Próximos Passos - Only if not linked */}
        {diagnostic && !diagnostic.status.isFullyLinked && (
          <Card className="border-neon-blue/20">
            <CardHeader>
              <CardTitle className="text-neon-blue-dark">Próximos Passos</CardTitle>
              <CardDescription>O que fazer agora?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-neon-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Entre em contato com o administrador</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Informe que você fez login com o email: <strong>{user?.email}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-neon-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Aguarde a vinculação</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      O administrador irá vincular seu email ao seu perfil de mentorado no sistema
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-neon-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Faça login novamente</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Após a vinculação, faça logout e login novamente para acessar seu dashboard
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Recarregar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* O que você terá acesso */}
        <Card className="border-neon-gold/30 bg-neon-gold/5">
          <CardHeader>
            <CardTitle className="text-neon-blue-dark flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-gold" />O que você terá acesso após a
              vinculação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">
                  Dashboard personalizado com suas métricas
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Gráficos de evolução mensal</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Feedbacks personalizados do mentor</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">
                  Formulário de envio de métricas mensais
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Comparativo com metas propostas</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Histórico completo de performance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card className="border-neon-blue/20">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>Precisa de ajuda? Entre em contato com o administrador do sistema.</p>
              <Badge variant="outline" className="mt-3">
                Neon - Mentoria Black
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
