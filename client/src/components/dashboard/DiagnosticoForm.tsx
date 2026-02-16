import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  DollarSign,
  Flame,
  Loader2,
  Rocket,
  Save,
  Star,
  Target,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA - 20 fields organized by discovery call methodology (field names are database identifiers)
// ═══════════════════════════════════════════════════════════════════════════

const formSchema = z.object({
  // Section 1: Starting Point (Context)
  atuacaoSaude: z.string().optional(),
  tempoLivre: z.string().optional(),
  jaAtuaEstetica: z.string().optional(),
  temClinica: z.string().optional(),
  // Section 2: Financial Reality
  rendaMensal: z.string().optional(),
  faturaEstetica: z.string().optional(),
  contas: z.string().optional(),
  custoVida: z.string().optional(),
  capacidadeInvestimento: z.string().optional(),
  // Section 3: Current Challenges
  incomodaRotina: z.string().optional(),
  dificuldadeCrescer: z.string().optional(),
  tentativasAnteriores: z.string().optional(),
  // Section 4: Success Vision
  objetivo6Meses: z.string().optional(),
  resultadoTransformador: z.string().optional(),
  visaoUmAno: z.string().optional(),
  porqueAgora: z.string().optional(),
  // Section 5: Commitment
  horasDisponiveis: z.string().optional(),
  nivelPrioridade: z.string().optional(),
  redeApoio: z.string().optional(),
  organizacao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CONFIG - Aligned with discovery call methodology
// ═══════════════════════════════════════════════════════════════════════════

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: "context",
    title: "Starting Point",
    icon: Target,
    colorClass: "text-primary",
    bgClass: "bg-primary/5 dark:bg-primary/10",
    borderClass: "border-primary/20",
  },
  {
    id: "financial",
    title: "Financial Reality",
    icon: DollarSign,
    colorClass: "text-amber-500 dark:text-amber-400",
    bgClass: "bg-amber-500/5 dark:bg-amber-500/10",
    borderClass: "border-amber-500/20",
  },
  {
    id: "challenges",
    title: "Current Challenges",
    icon: Flame,
    colorClass: "text-destructive dark:text-red-400",
    bgClass: "bg-destructive/5 dark:bg-destructive/10",
    borderClass: "border-destructive/20",
  },
  {
    id: "vision",
    title: "Success Vision",
    icon: Star,
    colorClass: "text-yellow-500 dark:text-yellow-400",
    bgClass: "bg-yellow-500/5 dark:bg-yellow-500/10",
    borderClass: "border-yellow-500/20",
  },
  {
    id: "commitment",
    title: "Commitment",
    icon: Rocket,
    colorClass: "text-primary",
    bgClass: "bg-primary/5 dark:bg-primary/10",
    borderClass: "border-primary/20",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function DiagnosticoForm({ mentoradoId }: { mentoradoId?: number }) {
  const utils = trpc.useUtils();

  const { data: diagnostico, isLoading } = trpc.diagnostico.get.useQuery(
    { mentoradoId },
    { refetchOnWindowFocus: false }
  );

  const upsertMutation = trpc.diagnostico.upsert.useMutation({
    onSuccess: () => {
      toast.success("Diagnosis saved successfully!");
      // Invalidate diagnosis query to update form
      utils.diagnostico.get.invalidate();
      // Invalidate overview stats so dashboard can unlock tabs
      utils.mentorados.getOverviewStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      atuacaoSaude: "",
      tempoLivre: "",
      jaAtuaEstetica: "",
      temClinica: "",
      rendaMensal: "",
      faturaEstetica: "",
      contas: "",
      custoVida: "",
      capacidadeInvestimento: "",
      incomodaRotina: "",
      dificuldadeCrescer: "",
      tentativasAnteriores: "",
      objetivo6Meses: "",
      resultadoTransformador: "",
      visaoUmAno: "",
      porqueAgora: "",
      horasDisponiveis: "",
      nivelPrioridade: "",
      redeApoio: "",
      organizacao: "",
    },
  });

  useEffect(() => {
    if (diagnostico) {
      form.reset({
        atuacaoSaude: diagnostico.atuacaoSaude || "",
        tempoLivre: diagnostico.tempoLivre || "",
        jaAtuaEstetica: diagnostico.jaAtuaEstetica || "",
        temClinica: diagnostico.temClinica || "",
        rendaMensal: diagnostico.rendaMensal || "",
        faturaEstetica: diagnostico.faturaEstetica || "",
        contas: diagnostico.contas || "",
        custoVida: diagnostico.custoVida || "",
        capacidadeInvestimento: diagnostico.capacidadeInvestimento || "",
        incomodaRotina: diagnostico.incomodaRotina || "",
        dificuldadeCrescer: diagnostico.dificuldadeCrescer || "",
        tentativasAnteriores: diagnostico.tentativasAnteriores || "",
        objetivo6Meses: diagnostico.objetivo6Meses || "",
        resultadoTransformador: diagnostico.resultadoTransformador || "",
        visaoUmAno: diagnostico.visaoUmAno || "",
        porqueAgora: diagnostico.porqueAgora || "",
        horasDisponiveis: diagnostico.horasDisponiveis || "",
        nivelPrioridade: diagnostico.nivelPrioridade || "",
        redeApoio: diagnostico.redeApoio || "",
        organizacao: diagnostico.organizacao || "",
      });
    }
  }, [diagnostico, form]);

  // Calculate progress - use watch() to trigger re-render on form changes
  const watchedFields = form.watch();
  const progress = useMemo(() => {
    const fields = Object.keys(formSchema.shape);
    const filled = fields.filter((key) => {
      const value = watchedFields[key as keyof FormValues];
      return value && value.trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [watchedFields]);

  function onSubmit(values: FormValues) {
    upsertMutation.mutate({ ...values, mentoradoId });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border"
        >
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Initial Diagnosis</h3>
            <p className="text-sm text-muted-foreground">
              Fill in to help us understand your current situation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="w-24 h-2" />
            <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
          </div>
        </motion.div>

        {/* Form Sections - Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-6 transition-all duration-300 ease-in-out">
          {/* Section 1: Starting Point */}
          <div className="h-full">
            <SectionCard section={SECTIONS[0]} delay={0.1}>
              <FormField
                control={form.control}
                name="atuacaoSaude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your background or field of work?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: Biomedical, Nurse, Aesthetician..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tempoLivre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How much free time do you have per week?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: 10 hours, Weekends only..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jaAtuaEstetica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you already working in aesthetics?</FormLabel>
                    <FormControl>
                      <Input placeholder="Yes/No/Starting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temClinica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you own a clinic or office?</FormLabel>
                    <FormControl>
                      <Input placeholder="Yes, Own / Rented / Home service" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCard>
          </div>

          {/* Section 2: Financial Reality */}
          <div className="h-full">
            <SectionCard section={SECTIONS[1]} delay={0.15}>
              <FormField
                control={form.control}
                name="rendaMensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your current monthly income (approx)?</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faturaEstetica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How much do you already earn from aesthetics?</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly bills amount (fixed + variable)?</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="custoVida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What would be your ideal cost of living?</FormLabel>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacidadeInvestimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly investment capacity?</FormLabel>
                    <FormDescription>How much can you invest in your business</FormDescription>
                    <FormControl>
                      <Input placeholder="R$ 0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCard>
          </div>

          {/* Section 3: Current Challenges */}
          <div className="h-full">
            <SectionCard section={SECTIONS[2]} delay={0.2}>
              <FormField
                control={form.control}
                name="incomodaRotina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your biggest challenge right now?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what bothers you most about your routine today..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dificuldadeCrescer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your biggest difficulty in growing?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g.: Lack of clients, Management, Sales..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tentativasAnteriores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What have you already tried that didn't work?</FormLabel>
                    <FormDescription>Courses, mentoring programs, previous strategies</FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your previous attempts..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCard>
          </div>

          {/* Section 4: Success Vision */}
          <div className="h-full">
            <SectionCard section={SECTIONS[3]} delay={0.25}>
              <FormField
                control={form.control}
                name="objetivo6Meses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your main goal for the next 6 months?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What do you want to achieve?"
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resultadoTransformador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      If the mentoring were a total success, what would your life look like?
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your ideal scenario..."
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visaoUmAno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where do you see yourself 1 year from now?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your 1-year vision..."
                        className="min-h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="porqueAgora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why is now the right time?</FormLabel>
                    <FormDescription>What made you decide to seek help now?</FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="What changed for you to take action now..."
                        className="min-h-20 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCard>
          </div>

          {/* Section 5: Commitment */}
          <div className="h-full">
            <SectionCard section={SECTIONS[4]} delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="horasDisponiveis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        How many hours per week can you dedicate?
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="E.g.: 5-10 hours, 20+ hours..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nivelPrioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From 1 to 10, what is your priority for this project?</FormLabel>
                      <FormDescription>10 = highest priority</FormDescription>
                      <FormControl>
                        <Input placeholder="1 a 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redeApoio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have a support network?</FormLabel>
                      <FormDescription>
                        Family, partner, business associate who supports you
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Who supports you on this journey?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How do you plan to organize yourself?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Put the fundamentals into practice, without rushing strategies..."
                          className="min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex justify-end pt-4"
        >
          <Button
            type="submit"
            disabled={upsertMutation.isPending}
            size="lg"
            className="min-w-48 shadow-lg hover:shadow-primary/20 transition-all"
          >
            {upsertMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Diagnosis
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SectionCardProps {
  section: SectionConfig;
  delay?: number;
  children: React.ReactNode;
}

function SectionCard({ section, delay = 0, children }: SectionCardProps) {
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full transition-all duration-300 ease-in-out hover:shadow-md",
          section.bgClass,
          section.borderClass
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle className={cn("flex items-center gap-3", section.colorClass)}>
            <div className={cn("p-2 rounded-lg", section.bgClass)}>
              <Icon className="w-5 h-5" />
            </div>
            {section.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}
