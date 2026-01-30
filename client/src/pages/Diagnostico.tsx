
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  const { data: diagnostico, isLoading, refetch } = trpc.diagnostico.get.useQuery();
  const { mutate: saveDiagnostico, isPending: isSaving } = trpc.diagnostico.upsert.useMutation({
    onSuccess: () => {
      toast.success("Diagnóstico salvo com sucesso!");
      refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err.message}`);
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
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Diagnóstico Inicial
        </h1>
        <p className="text-muted-foreground">
          Preencha as informações para personalizarmos sua jornada na Mentoria Black NEON.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* SEÇÃO 1 */}
          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">1. Sobre o Momento Atual Profissional</CardTitle>
              <CardDescription>Entendendo sua rotina e infraestrutura.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="atuacaoSaude"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Qual sua atuação na saúde hoje? Carga horária?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Enfermeira, esteta, 10h às 19h..." {...field} />
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
                    <FormLabel>Quanto tempo livre tem para o negócio?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Não tem..." {...field} />
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
                    <FormLabel>Você já atua na saúde estética?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1 ano aproximadamente..." {...field} />
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
                    <FormLabel>Tem clínica própria ou atende em outro espaço?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: 3 meses, dentro de espaço de beleza..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEÇÃO 2 */}
          <Card className="border-l-4 border-l-green-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">2. Resultados Atuais</CardTitle>
              <CardDescription>Mapeamento financeiro e de performance.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="rendaMensal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Como está sua renda média mensal hoje?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: R$ 5.000,00..." {...field} />
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
                    <FormLabel>Já fatura na Estética ou mistura com outra área?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Não atua em outro local..." {...field} />
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
                    <FormLabel>Tem conta PJ? PF? Investimentos?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tem PJ e PF, não investe..." {...field} />
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
                    <FormLabel>Qual seu custo médio de vida mensal?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 5 mil..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEÇÃO 3 */}
          <Card className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">3. Dores e Desafios</CardTitle>
              <CardDescription>O que te impede de crescer hoje.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="incomodaRotina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O que mais te incomoda na sua rotina hoje?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Falta de pacientes, vendas..." className="min-h-[100px]" {...field} />
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
                    <FormLabel>Qual sua maior dificuldade em crescer?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Não sabe vender, posicionamento..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SEÇÃO 4 */}
          <Card className="border-l-4 border-l-purple-500 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">4. Objetivos e Sonhos</CardTitle>
              <CardDescription>Onde queremos chegar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="objetivo6Meses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onde você gostaria de estar daqui a 6 meses?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Agenda cheia, independência..." className="min-h-[100px]" {...field} />
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
                    <FormLabel>O que seria um resultado transformador para você?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Visão de empresária..." className="min-h-[100px]" {...field} />
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
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Respostas
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
