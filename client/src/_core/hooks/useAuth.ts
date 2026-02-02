import { useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";

/**
 * useAuth - Authentication hook without Clerk dependency
 *
 * Uses tRPC auth.me query for user data.
 * Works with the backend session/JWT authentication.
 */
export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
      clerkUser: null, // Deprecated - kept for compatibility
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading]);

  const logout = useCallback(() => {
    // Clear cookies by hitting logout endpoint and redirect
    window.location.href = "/api/auth/logout";
  }, []);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
