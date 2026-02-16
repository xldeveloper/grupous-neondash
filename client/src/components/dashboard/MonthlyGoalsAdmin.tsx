import { Loader2, Save, Target, Users } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

const MONTHS = [
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

interface GoalsFormState {
  metaFaturamento: string;
  metaLeads: string;
  metaProcedimentos: string;
  metaPosts: string;
  metaStories: string;
}

const emptyGoals: GoalsFormState = {
  metaFaturamento: "",
  metaLeads: "",
  metaProcedimentos: "",
  metaPosts: "",
  metaStories: "",
};

export function MonthlyGoalsAdmin() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${now.getMonth() + 1}`
  );
  const [globalGoals, setGlobalGoals] = useState<GoalsFormState>(emptyGoals);
  const [individualGoals, setIndividualGoals] = useState<GoalsFormState>(emptyGoals);
  const [selectedMentoradoId, setSelectedMentoradoId] = useState<string>("");

  const [ano, mes] = selectedMonth.split("-").map(Number);
  const utils = trpc.useContext();

  // Get mentees list
  const { data: mentorados } = trpc.mentorados.list.useQuery();

  // Mutations
  const updateGlobalMutation = trpc.mentorados.updateGlobalMonthlyGoals.useMutation({
    onSuccess: (data) => {
      toast.success("Global goals applied", {
        description: `Goals for ${mes}/${ano} updated for ${data.count} mentees.`,
      });
      utils.mentorados.invalidate();
    },
    onError: (error) => {
      toast.error("Error saving global goals", {
        description: error.message,
      });
    },
  });

  const updateIndividualMutation = trpc.mentorados.updateMonthlyGoals.useMutation({
    onSuccess: () => {
      toast.success("Individual goal saved", {
        description: `Custom goal for ${mes}/${ano} applied.`,
      });
      utils.mentorados.invalidate();
    },
    onError: (error) => {
      toast.error("Error saving individual goal", {
        description: error.message,
      });
    },
  });

  // Reset forms when the month changes
  useEffect(() => {
    setGlobalGoals(emptyGoals);
    setIndividualGoals(emptyGoals);
  }, [ano, mes]);

  const handleSaveGlobal = () => {
    updateGlobalMutation.mutate({
      ano,
      mes,
      metaFaturamento: globalGoals.metaFaturamento
        ? Number(globalGoals.metaFaturamento)
        : undefined,
      metaLeads: globalGoals.metaLeads ? Number(globalGoals.metaLeads) : undefined,
      metaProcedimentos: globalGoals.metaProcedimentos
        ? Number(globalGoals.metaProcedimentos)
        : undefined,
      metaPosts: globalGoals.metaPosts ? Number(globalGoals.metaPosts) : undefined,
      metaStories: globalGoals.metaStories ? Number(globalGoals.metaStories) : undefined,
    });
  };

  const handleSaveIndividual = () => {
    if (!selectedMentoradoId) {
      toast.error("Select a mentee");
      return;
    }
    updateIndividualMutation.mutate({
      mentoradoId: Number(selectedMentoradoId),
      ano,
      mes,
      metaFaturamento: individualGoals.metaFaturamento
        ? Number(individualGoals.metaFaturamento)
        : undefined,
      metaLeads: individualGoals.metaLeads ? Number(individualGoals.metaLeads) : undefined,
      metaProcedimentos: individualGoals.metaProcedimentos
        ? Number(individualGoals.metaProcedimentos)
        : undefined,
      metaPosts: individualGoals.metaPosts ? Number(individualGoals.metaPosts) : undefined,
      metaStories: individualGoals.metaStories ? Number(individualGoals.metaStories) : undefined,
    });
  };

  // Generate month selection options
  const monthOptions = MONTHS.map((m) => ({
    value: `${currentYear}-${m.value}`,
    label: `${m.label} ${currentYear}`,
  }));

  const GoalsForm = ({
    goals,
    setGoals,
  }: {
    goals: GoalsFormState;
    setGoals: React.Dispatch<React.SetStateAction<GoalsFormState>>;
  }) => (
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
  );

  return (
    <Card className="bg-card dark:bg-slate-900/50 border-border dark:border-slate-700/50 hover:border-primary/30 transition-all shadow-sm mb-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Monthly Goals</CardTitle>
              <CardDescription>
                Set objectives for all or specific mentees
              </CardDescription>
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
      <CardContent>
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Global Goal
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Individual Goal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              These goals will be applied to <strong>all</strong> active mentees.
            </p>
            <GoalsForm goals={globalGoals} setGoals={setGlobalGoals} />
            <Button
              className="w-full mt-4"
              onClick={handleSaveGlobal}
              disabled={updateGlobalMutation.isPending}
            >
              {updateGlobalMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying to all...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Apply to All ({mentorados?.length ?? 0} mentees)
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set custom goals for a specific mentee (overrides the global goal).
            </p>
            <div className="space-y-2">
              <Label>Mentee</Label>
              <Select value={selectedMentoradoId} onValueChange={setSelectedMentoradoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a mentee" />
                </SelectTrigger>
                <SelectContent>
                  {mentorados?.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nomeCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <GoalsForm goals={individualGoals} setGoals={setIndividualGoals} />
            <Button
              className="w-full mt-4"
              onClick={handleSaveIndividual}
              disabled={updateIndividualMutation.isPending || !selectedMentoradoId}
            >
              {updateIndividualMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Individual Goal
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
