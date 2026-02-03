/**
 * Instagram Connection Card
 * Allows mentorados to connect/disconnect their Instagram Business account.
 * Uses Facebook SDK for OAuth and syncs with backend.
 */

import { CheckCircle, Instagram, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFacebookSDK } from "@/hooks/use-facebook-sdk";
import { trpc } from "@/lib/trpc";

interface InstagramConnectionCardProps {
  mentoradoId: number;
}

export function InstagramConnectionCard({ mentoradoId }: InstagramConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { isLoaded, login, logout, getInstagramAccount } = useFacebookSDK();

  // tRPC mutations
  const saveToken = trpc.instagram.saveToken.useMutation({
    onSuccess: () => {
      toast.success("Instagram conectado com sucesso!");
    },
    onError: (error: { message: string }) => {
      toast.error(`Erro ao salvar conexão: ${error.message}`);
    },
  });

  const disconnect = trpc.instagram.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Instagram desconectado");
    },
    onError: (error: { message: string }) => {
      toast.error(`Erro ao desconectar: ${error.message}`);
    },
  });

  const syncMetrics = trpc.instagram.syncMetrics.useMutation({
    onSuccess: (data) => {
      toast.success(`Métricas sincronizadas: ${data.posts} posts, ${data.stories} stories`);
    },
    onError: (error: { message: string }) => {
      toast.error(`Erro ao sincronizar: ${error.message}`);
    },
  });

  // Get connection status from backend
  const connectionStatus = trpc.instagram.getConnectionStatus.useQuery(
    { mentoradoId },
    { enabled: !!mentoradoId }
  );

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Step 1: Login with Facebook
      const loginResponse = await login();

      if (loginResponse.status !== "connected") {
        throw new Error("Login não autorizado. Por favor, tente novamente.");
      }

      // Step 2: Get Instagram Business Account
      const igAccount = await getInstagramAccount();

      if (!igAccount) {
        throw new Error(
          "Conta Instagram Business não encontrada. Certifique-se de que sua conta Instagram está vinculada a uma Página do Facebook."
        );
      }

      // Step 3: Get access token from auth response
      const token = loginResponse.authResponse?.accessToken;
      if (!token) {
        throw new Error("Token de acesso não disponível.");
      }

      // Step 4: Save token to backend
      await saveToken.mutateAsync({
        mentoradoId,
        accessToken: token,
        instagramAccountId: igAccount.id,
        instagramUsername: igAccount.username,
      });

      // Refetch connection status
      connectionStatus.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao conectar Instagram");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Logout from Facebook SDK
      await logout();

      // Remove from backend
      await disconnect.mutateAsync({ mentoradoId });

      // Refetch connection status
      connectionStatus.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao desconectar");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const now = new Date();
      await syncMetrics.mutateAsync({
        mentoradoId,
        ano: now.getFullYear(),
        mes: now.getMonth() + 1,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const isConnected = connectionStatus.data?.isConnected;
  const lastSync = connectionStatus.data?.lastSyncAt;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Instagram Business</CardTitle>
              <CardDescription>
                Sincronize métricas de posts e stories automaticamente
              </CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Desconectado
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isLoaded && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Carregando Facebook SDK...</AlertDescription>
          </Alert>
        )}

        {isConnected && connectionStatus.data && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Conta:</span>
              <span className="font-medium">@{connectionStatus.data.instagramUsername}</span>
            </div>
            {lastSync && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Última sincronização:</span>
                <span className="text-sm">{new Date(lastSync).toLocaleString("pt-BR")}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1"
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sincronizar Agora
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={disconnect.isPending}
              >
                {disconnect.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Desconectar
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={!isLoaded || isConnecting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Instagram className="mr-2 h-4 w-4" />
              )}
              Conectar Instagram
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Ao conectar, você autoriza a sincronização de métricas de posts e stories. Seus dados são
          usados apenas para análise de desempenho.
        </p>
      </CardContent>
    </Card>
  );
}
