/**
 * Instagram Connection Card
 * Uses official Facebook Login Button for OAuth flow.
 * Implements checkLoginState() callback pattern per Meta documentation.
 */

import { CheckCircle, Instagram, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import type {
  FacebookLoginStatusResponse,
  FacebookPagesResponse,
  FacebookPageWithInstagram,
  InstagramBusinessAccount,
} from "@/types/facebook-sdk.d";

interface InstagramConnectionCardProps {
  mentoradoId: number;
}

export function InstagramConnectionCard({ mentoradoId }: InstagramConnectionCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const loginButtonRef = useRef<HTMLDivElement>(null);

  // tRPC mutations
  const saveToken = trpc.instagram.saveToken.useMutation({
    onSuccess: () => {
      toast.success("Instagram conectado com sucesso!");
      connectionStatus.refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(`Erro ao salvar conexão: ${error.message}`);
    },
  });

  const disconnect = trpc.instagram.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Instagram desconectado");
      connectionStatus.refetch();
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

  // Initialize FB SDK and checkLoginState callback
  useEffect(() => {
    // Get Instagram Business Account from Facebook Pages
    const getInstagramAccount = (): Promise<InstagramBusinessAccount | null> => {
      return new Promise((resolve) => {
        if (!window.FB) {
          resolve(null);
          return;
        }

        window.FB.api<FacebookPagesResponse>("/me/accounts", (pagesResponse) => {
          if (pagesResponse.error || !pagesResponse.data?.length) {
            resolve(null);
            return;
          }

          const pageId = pagesResponse.data[0].id;
          window.FB.api<FacebookPageWithInstagram>(
            `/${pageId}?fields=instagram_business_account{id,username,name}`,
            (igResponse) => {
              if (igResponse.error || !igResponse.instagram_business_account) {
                resolve(null);
                return;
              }

              resolve(igResponse.instagram_business_account);
            }
          );
        });
      });
    };

    // Handle login status change - this is called by checkLoginState()
    const handleStatusChange = async (response: FacebookLoginStatusResponse) => {
      if (response.status === "connected" && response.authResponse) {
        setIsProcessing(true);

        try {
          // Get Instagram Business Account
          const igAccount = await getInstagramAccount();

          if (!igAccount) {
            toast.error(
              "Conta Instagram Business não encontrada. Vincule sua conta Instagram a uma Página do Facebook."
            );
            return;
          }

          // Save token to backend
          await saveToken.mutateAsync({
            mentoradoId,
            accessToken: response.authResponse.accessToken,
            instagramAccountId: igAccount.id,
            instagramUsername: igAccount.username,
          });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao conectar Instagram");
        } finally {
          setIsProcessing(false);
        }
      } else if (response.status === "not_authorized") {
        toast.error("Você precisa autorizar o acesso ao Instagram.");
      }
    };

    const checkSDKLoaded = () => {
      if (window.FB) {
        setSdkLoaded(true);

        // Register global callback for fb:login-button onlogin
        window.checkLoginState = () => {
          window.FB.getLoginStatus((response) => {
            handleStatusChange(response);
          });
        };

        // Parse XFBML to render the login button
        if (loginButtonRef.current) {
          window.FB.XFBML.parse(loginButtonRef.current);
        }

        return true;
      }
      return false;
    };

    if (checkSDKLoaded()) return;

    // Poll for SDK load
    const interval = setInterval(() => {
      if (checkSDKLoaded()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mentoradoId, saveToken]);

  // Re-parse XFBML when SDK becomes available
  useEffect(() => {
    if (sdkLoaded && loginButtonRef.current && window.FB?.XFBML) {
      window.FB.XFBML.parse(loginButtonRef.current);
    }
  }, [sdkLoaded]);

  const handleDisconnect = async () => {
    try {
      // Logout from Facebook SDK
      if (window.FB) {
        window.FB.logout(() => {
          // SDK logout complete
        });
      }

      // Remove from backend
      await disconnect.mutateAsync({ mentoradoId });
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
        {!sdkLoaded && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Carregando Facebook SDK...</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Conectando Instagram...</AlertDescription>
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
            <div ref={loginButtonRef} className="w-full flex justify-center">
              {/* Official Facebook Login Button */}
              {/* The onlogin callback calls checkLoginState() which is registered globally */}
              <div
                className="fb-login-button"
                data-width="100%"
                data-size="large"
                data-button-type="login_with"
                data-layout="default"
                data-auto-logout-link="false"
                data-use-continue-as="true"
                data-scope="instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement"
                data-onlogin="checkLoginState();"
              />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Ao conectar, você autoriza a sincronização de métricas de posts e stories. Seus dados são
          usados apenas para análise de desempenho.
          <a href="/account-deletion" className="ml-1 underline hover:text-foreground">
            Solicitar exclusão de dados
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
