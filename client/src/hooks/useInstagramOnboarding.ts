import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface UseInstagramOnboardingOptions {
  mentoradoId: number | undefined;
}

/**
 * Hook to manage Instagram connection onboarding modal
 */
export function useInstagramOnboarding({ mentoradoId }: UseInstagramOnboardingOptions) {
  const [isOpen, setIsOpen] = useState(false);

  const connectMutation = trpc.mentorados.connectInstagram.useMutation({
    onSuccess: (data) => {
      // Redirect to Instagram OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
  });

  const startOAuth = () => {
    if (!mentoradoId) return;
    connectMutation.mutate({ mentoradoId });
  };

  return {
    isOpen,
    setIsOpen,
    startOAuth,
    isConnecting: connectMutation.isPending,
    error: connectMutation.error,
  };
}
