import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

interface EvolutionChartProps {
  mentoradoId?: number;
}

export function EvolutionChart({ mentoradoId }: EvolutionChartProps) {
  const { data: evolutionData, isLoading } = trpc.mentorados.evolution.useQuery({ mentoradoId });

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Financial Evolution</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!evolutionData || evolutionData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Financial Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No data available for the period.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const validData = evolutionData.map((item) => ({
    name: `${item.mes}/${item.ano}`,
    Revenue: item.faturamento,
    Profit: item.lucro,
    Leads: item.leads,
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Performance Evolution</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={validData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke="var(--color-neon-blue)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="Profit"
              stroke="var(--color-neon-gold)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
