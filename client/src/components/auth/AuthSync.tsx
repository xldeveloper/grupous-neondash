import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

/**
 * AuthSync - Syncs user data with backend on authentication
 *
 * No longer depends on Clerk - uses local useAuth hook.
 */
export function AuthSync() {
  const { isAuthenticated } = useAuth();
  const hasSynced = useRef(false);

  const { mutate: syncUser } = trpc.auth.syncUser.useMutation({
    onSuccess: (data) => {
      if (data.linked) {
        toast.success("Perfil de mentorado vinculado com sucesso!");
      }
    },
    onError: (_err) => {},
  });

  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      syncUser();
    }
  }, [isAuthenticated, syncUser]);

  return null;
}
