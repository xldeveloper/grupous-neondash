/**
 * Account Deletion Page
 * Allows users to request deletion of their Instagram data.
 * Required by Facebook/Meta for apps using Instagram API.
 *
 * URL: https://neondash.gpus.com.br/account-deletion
 */

import { useAuth, useUser } from "@clerk/clerk-react";
import { AlertTriangle, CheckCircle2, Instagram, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

type DeletionStatus = "idle" | "loading" | "success" | "error";

export function AccountDeletion() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<DeletionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // tRPC mutation for deleting Instagram data
  const deleteInstagramData = trpc.instagram.deleteMyData.useMutation({
    onSuccess: () => {
      setStatus("success");
    },
    onError: (error: { message: string }) => {
      setStatus("error");
      setErrorMessage(error.message);
    },
  });

  const handleDeleteRequest = async () => {
    setStatus("loading");
    setErrorMessage(null);
    deleteInstagramData.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center mb-4">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Exclusão de Dados do Instagram</CardTitle>
          <CardDescription>
            Solicite a remoção dos seus dados do Instagram armazenados em nossa plataforma
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Esta ação irá remover permanentemente todos os dados do Instagram associados à sua
              conta, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Token de acesso e autorização</li>
                <li>Histórico de sincronização de métricas</li>
                <li>Dados de posts e stories sincronizados</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Success State */}
          {status === "success" && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700 dark:text-green-400">
                Dados Removidos com Sucesso
              </AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-300">
                Todos os seus dados do Instagram foram permanentemente removidos de nossa
                plataforma. Você pode reconectar sua conta a qualquer momento.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {status === "error" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao Remover Dados</AlertTitle>
              <AlertDescription>
                {errorMessage || "Ocorreu um erro ao processar sua solicitação. Tente novamente."}
              </AlertDescription>
            </Alert>
          )}

          {/* Not Signed In */}
          {!isSignedIn && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Necessário</AlertTitle>
              <AlertDescription>
                Para solicitar a exclusão dos seus dados, você precisa estar logado em sua conta.
              </AlertDescription>
            </Alert>
          )}

          {/* User Info */}
          {isSignedIn && user && status !== "success" && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">Conta conectada:</p>
              <p className="font-medium">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {isSignedIn && status !== "success" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={status === "loading"}
                  size="lg"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Meus Dados do Instagram
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão de Dados</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir permanentemente todos os seus dados do Instagram?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRequest}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, Excluir Dados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isSignedIn && (
            <Button asChild className="w-full" size="lg">
              <a href="/">Fazer Login</a>
            </Button>
          )}

          {status === "success" && (
            <Button asChild variant="outline" className="w-full" size="lg">
              <a href="/meu-dashboard">Voltar ao Dashboard</a>
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Conforme exigido pela Política de Dados da Meta/Facebook.
            <br />
            Dúvidas? Entre em contato:{" "}
            <a href="mailto:suporte@grupous.com.br" className="underline hover:text-foreground">
              suporte@grupous.com.br
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AccountDeletion;
