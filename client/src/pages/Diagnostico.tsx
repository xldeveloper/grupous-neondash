import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists, otherwise Input
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  // 1
  atuacaoSaude: z.string().optional(),
  tempoLivre: z.string().optional(),
  jaAtuaEstetica: z.string().optional(),
  temClinica: z.string().optional(),
  // 2
  rendaMensal: z.string().optional(),
  faturaEstetica: z.string().optional(),
  contas: z.string().optional(),
  custoVida: z.string().optional(),
  // 3
  incomodaRotina: z.string().optional(),
  dificuldadeCrescer: z.string().optional(),
  // 4
  objetivo6Meses: z.string().optional(),
  resultadoTransformador: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiagnosticoPage() {
  const [, navigate] = useLocation();
  const { data: diagnostico, isLoading, refetch } = trpc.diagnostico.get.useQuery();

  // Onboarding completion mutation
  const { mutate: completeOnboarding } = trpc.mentorados.completeOnboarding.useMutation();

  const { mutate: saveDiagnostico, isPending: isSaving } = trpc.diagnostico.upsert.useMutation({
    onSuccess: () => {
      // Mark onboarding as complete and redirect to dashboard
      completeOnboarding(undefined, {
        onSuccess: () => {
          toast.success("Diagnosis saved! Welcome to NEON Mentorship.");
          navigate("/meu-dashboard");
        },
        onError: () => {
          // Even if completeOnboarding fails, still show success for diagnostico
          toast.success("Diagnosis saved successfully!");
          refetch();
        },
      });
    },
    onError: (err) => {
      toast.error(`Error saving: ${err.message}`);
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
      incomodaRotina: "",
      dificuldadeCrescer: "",
      objetivo6Meses: "",
      resultadoTransformador: "",
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (diagnostico) {
      // Cast nulls to empty strings if needed, though zod handles optionals
      form.reset({
        atuacaoSaude: diagnostico.atuacaoSaude || "",
        tempoLivre: diagnostico.tempoLivre || "",
        jaAtuaEstetica: diagnostico.jaAtuaEstetica || "",
        temClinica: diagnostico.temClinica || "",
        rendaMensal: diagnostico.rendaMensal || "",
        faturaEstetica: diagnostico.faturaEstetica || "",
        contas: diagnostico.contas || "",
        custoVida: diagnostico.custoVida || "",
        incomodaRotina: diagnostico.incomodaRotina || "",
        dificuldadeCrescer: diagnostico.dificuldadeCrescer || "",
        objetivo6Meses: diagnostico.objetivo6Meses || "",
        resultadoTransformador: diagnostico.resultadoTransformador || "",
      });
    }
  }, [diagnostico, form]);

  function onSubmit(values: FormValues) {
    saveDiagnostico(values);
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
          Initial Diagnosis
        </h1>
        <p className="text-muted-foreground">
          Fill in the information so we can personalize your journey in the NEON Black Mentorship.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1 */}
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">1. About Your Current Professional Situation</CardTitle>
              <CardDescription>Understanding your routine and infrastructure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="atuacaoSaude"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>What is your current role in healthcare? Working hours?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: Nurse, esthetician, 10am to 7pm..." {...field} />
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
                    <FormLabel>How much free time do you have for the business?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: None..." {...field} />
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
                    <FormLabel>Do you already work in aesthetic healthcare?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: About 1 year..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temClinica"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Do you have your own clinic or work in another space?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g.: 3 months, inside a beauty salon..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 2 */}
          <Card className="border-l-4 border-l-green-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">2. Current Results</CardTitle>
              <CardDescription>Financial and performance mapping.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="rendaMensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your average monthly income today?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: R$ 5,000.00..." {...field} />
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
                    <FormLabel>Do you already earn in Aesthetics or mix with another area?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: Does not work elsewhere..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contas"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Do you have a business account? Personal? Investments?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: Has business and personal accounts, no investments..." {...field} />
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
                    <FormLabel>What is your average monthly cost of living?</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g.: 5 thousand..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 3 */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">3. Pain Points and Challenges</CardTitle>
              <CardDescription>What prevents you from growing today.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="incomodaRotina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What bothers you most about your routine today?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g.: Lack of patients, sales..."
                        className="min-h-[100px]"
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
                        placeholder="E.g.: Doesn't know how to sell, positioning..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SECTION 4 */}
          <Card className="border-l-4 border-l-teal-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">4. Goals and Dreams</CardTitle>
              <CardDescription>Where we want to get to.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="objetivo6Meses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where would you like to be in 6 months?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g.: Full schedule, independence..."
                        className="min-h-[100px]"
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
                    <FormLabel>What would be a transformative result for you?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g.: Entrepreneur mindset..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isSaving} className="w-full md:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Answers
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
