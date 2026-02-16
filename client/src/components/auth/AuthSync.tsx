import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

/**
 * AuthSync - Syncs user data with backend on authentication
 *
 * Uses ensureMentorado with exponential retry for robust profile creation.
 */
export function AuthSync() {
  const { isAuthenticated, user } = useAuth();
  const hasSynced = useRef(false);
  const [isCreating, setIsCreating] = useState(false);
  const utils = trpc.useUtils();

  // DEBUG: Log authentication state
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
    console.log("[AUTHSYNC] Auth state:", {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.role,
      hasSynced: hasSynced.current,
    });
  }, [isAuthenticated, user]);

  const { mutate: ensureMentorado, isPending } = trpc.auth.ensureMentorado.useMutation({
    // AT-004: Exponential retry (1s, 2s, 4s)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onMutate: () => {
      // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
      console.log("[AUTHSYNC] ensureMentorado onMutate - calling mutation");
      setIsCreating(true);
      // AT-009: Show progress toast
      toast.loading("Preparing your profile...", {
        id: "ensure-mentorado",
        duration: Infinity,
      });
    },
    onSuccess: (data) => {
      // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
      console.log("[AUTHSYNC] ensureMentorado onSuccess:", {
        success: data.success,
        created: data.created,
        hasMentorado: !!data.mentorado,
        mentoradoId: data.mentorado?.id,
      });
      setIsCreating(false);
      if (data.created) {
        toast.success("Profile created successfully!", {
          id: "ensure-mentorado",
          duration: 3000,
        });
      } else {
        toast.dismiss("ensure-mentorado");
      }
      // AT-005: Invalidate queries to force refetch
      // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
      console.log("[AUTHSYNC] Invalidating queries mentorados.me and auth.me");
      utils.mentorados.me.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
      console.error("[AUTHSYNC] ensureMentorado onError:", error);
      setIsCreating(false);
      // AT-009: Show error toast (retry is handled automatically by TanStack Query)
      toast.error("Error preparing your profile. Trying again...", {
        id: "ensure-mentorado",
        duration: 3000,
      });
    },
  });

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
    console.log("[AUTHSYNC] useEffect verification:", {
      isAuthenticated,
      hasSynced: hasSynced.current,
      willTrigger: isAuthenticated && !hasSynced.current,
    });
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      // biome-ignore lint/suspicious/noConsole: debug logging for auth flow
      console.log("[AUTHSYNC] Calling ensureMentorado()");
      ensureMentorado();
    }
  }, [isAuthenticated, ensureMentorado]);

  // AT-009: Optional loading indicator (returns null to not block UI)
  // The toast provides sufficient feedback
  void isPending;
  void isCreating;

  return null;
}
