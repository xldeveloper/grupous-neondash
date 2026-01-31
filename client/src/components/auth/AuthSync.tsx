import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function AuthSync() {
  const { isSignedIn, isLoaded } = useAuth();
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
    if (isLoaded && isSignedIn && !hasSynced.current) {
      hasSynced.current = true;
      syncUser();
    }
  }, [isLoaded, isSignedIn, syncUser]);

  return null;
}
