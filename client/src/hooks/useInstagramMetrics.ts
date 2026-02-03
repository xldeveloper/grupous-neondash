import { trpc } from "@/lib/trpc";

interface UseInstagramMetricsOptions {
  ano: number;
  mes: number;
  enabled?: boolean;
}

/**
 * Hook to fetch Instagram sync data for a specific month
 * Uses 24h stale time for caching
 */
export function useInstagramMetrics({ ano, mes, enabled = true }: UseInstagramMetricsOptions) {
  const { data, isLoading, refetch } = trpc.mentorados.getInstagramMetrics.useQuery(
    { ano, mes },
    {
      enabled,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours cache
    }
  );

  return {
    data,
    isLoading,
    refetch,
  };
}
