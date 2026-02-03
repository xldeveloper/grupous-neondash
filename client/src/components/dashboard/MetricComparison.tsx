import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricComparisonProps {
  currentValue: number | undefined;
  previousValue: number | undefined;
  label?: string;
  type?: "currency" | "number";
}

/**
 * Visual badge showing percentage change from previous month
 */
export function MetricComparison({
  currentValue,
  previousValue,
  label = "Mês passado",
  type = "number",
}: MetricComparisonProps) {
  if (previousValue === undefined || previousValue === 0) {
    return null;
  }

  const formatValue = (val: number) => {
    if (type === "currency") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
      }).format(val);
    }
    return val.toLocaleString("pt-BR");
  };

  const percentChange =
    currentValue !== undefined
      ? Math.round(((currentValue - previousValue) / previousValue) * 100)
      : null;

  const isPositive = percentChange !== null && percentChange > 0;
  const isNegative = percentChange !== null && percentChange < 0;
  const isNeutral = percentChange === null || percentChange === 0;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
      <span>
        {label}: {formatValue(previousValue)}
      </span>
      {percentChange !== null && (
        <span
          className={cn(
            "flex items-center gap-0.5 font-medium",
            isPositive && "text-green-600 dark:text-green-400",
            isNegative && "text-red-600 dark:text-red-400",
            isNeutral && "text-muted-foreground"
          )}
        >
          {isPositive && <ArrowUp className="h-3 w-3" />}
          {isNegative && <ArrowDown className="h-3 w-3" />}
          {isNeutral && <Minus className="h-3 w-3" />}
          {isPositive && "+"}
          {percentChange}%
        </span>
      )}
    </div>
  );
}
