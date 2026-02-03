import { trpc } from "@/lib/trpc";

interface UsePreviousMonthMetricsOptions {
  ano: number;
  mes: number;
  enabled?: boolean;
}

/**
 * Hook to fetch previous month's metrics for comparison
 * Calculates percentage changes for each metric
 */
export function usePreviousMonthMetrics({
  ano,
  mes,
  enabled = true,
}: UsePreviousMonthMetricsOptions) {
  const { data: previousMetrics, isLoading } = trpc.mentorados.getPreviousMonthMetrics.useQuery(
    { ano, mes },
    { enabled }
  );

  // Calculate percentage changes
  const calculateChange = (current: number | undefined, previous: number | undefined) => {
    if (!previous || previous === 0 || current === undefined) return null;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    previousMetrics,
    isLoading,
    getPercentChange: calculateChange,
  };
}
