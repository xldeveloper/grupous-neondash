import { Loader2, Save, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

interface MonthlyGoalsCardProps {
  mentoradoId: number;
  initialData?: any[]; // Pass available metrics to pre-fill
}

export function MonthlyGoalsCard({ mentoradoId, initialData = [] }: MonthlyGoalsCardProps) {
  // Default to current month/year
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${now.getFullYear()}-${now.getMonth() + 1}`
  );

  const [goals, setGoals] = useState({
    metaFaturamento: "",
    metaLeads: "",
    metaProcedimentos: "",
    metaPosts: "",
    metaStories: "",
  });

  const [ano, mes] = selectedMonth.split("-").map(Number);
  const utils = trpc.useContext();

  // Find existing data for selected month to pre-fill
  useEffect(() => {
    const existingMetric = initialData.find((m) => m.ano === ano && m.mes === mes);
    if (existingMetric) {
      setGoals({
        metaFaturamento: existingMetric.metaFaturamento?.toString() || "",
        metaLeads: existingMetric.metaLeads?.toString() || "",
        metaProcedimentos: existingMetric.metaProcedimentos?.toString() || "",
        metaPosts: existingMetric.metaPosts?.toString() || "",
        metaStories: existingMetric.metaStories?.toString() || "",
      });
    } else {
      // Reset if no data for this month;
      // ideally we might want to keep global defaults or clear
      setGoals({
        metaFaturamento: "",
        metaLeads: "",
        metaProcedimentos: "",
        metaPosts: "",
        metaStories: "",
      });
    }
  }, [initialData, ano, mes]);

  const updateMutation = trpc.mentorados.updateMonthlyGoals.useMutation({
    onSuccess: () => {
      toast.success("Goals updated", {
        description: `Goals for ${mes}/${ano} were saved successfully.`,
      });
      utils.mentorados.getOverviewStats.invalidate();
    },
    onError: (error) => {
      toast.error("Error saving", {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      mentoradoId,
      ano,
      mes,
      metaFaturamento: goals.metaFaturamento ? Number(goals.metaFaturamento) : undefined,
      metaLeads: goals.metaLeads ? Number(goals.metaLeads) : undefined,
      metaProcedimentos: goals.metaProcedimentos ? Number(goals.metaProcedimentos) : undefined,
      metaPosts: goals.metaPosts ? Number(goals.metaPosts) : undefined,
      metaStories: goals.metaStories ? Number(goals.metaStories) : undefined,
    });
  };

  // Generate month options (current year and next)
  const currentYear = new Date().getFullYear();
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const monthOptions = [
    ...months.map((m) => ({
      value: `${currentYear}-${m.value}`,
      label: `${m.label} ${currentYear}`,
    })),
    // Add next year options if needed
    // ...months.map((m) => ({ value: `${currentYear + 1}-${m.value}`, label: `${m.label} ${currentYear + 1}` })),
  ];

  return (
    <Card className="bg-card dark:bg-slate-900/50 border-border dark:border-slate-700/50 hover:border-primary/30 transition-all shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Monthly Goals</CardTitle>
              <CardDescription>Set specific objectives for this month</CardDescription>
            </div>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="metaFaturamento">Revenue Goal (R$)</Label>
            <Input
              id="metaFaturamento"
              type="number"
              placeholder="e.g.: 20000"
              value={goals.metaFaturamento}
              onChange={(e) => setGoals({ ...goals, metaFaturamento: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaLeads">Leads Goal</Label>
            <Input
              id="metaLeads"
              type="number"
              placeholder="e.g.: 50"
              value={goals.metaLeads}
              onChange={(e) => setGoals({ ...goals, metaLeads: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaProcedimentos">Procedures Goal</Label>
            <Input
              id="metaProcedimentos"
              type="number"
              placeholder="e.g.: 10"
              value={goals.metaProcedimentos}
              onChange={(e) => setGoals({ ...goals, metaProcedimentos: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaPosts">Feed Posts Goal</Label>
            <Input
              id="metaPosts"
              type="number"
              placeholder="e.g.: 12"
              value={goals.metaPosts}
              onChange={(e) => setGoals({ ...goals, metaPosts: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaStories">Stories Goal</Label>
            <Input
              id="metaStories"
              type="number"
              placeholder="e.g.: 60"
              value={goals.metaStories}
              onChange={(e) => setGoals({ ...goals, metaStories: e.target.value })}
            />
          </div>
        </div>
        <Button className="w-full mt-4" onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Goals
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
