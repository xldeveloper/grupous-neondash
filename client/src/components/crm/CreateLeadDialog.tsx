import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

// Form schema - keeps valorEstimado as string for input
const createLeadFormSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  origem: z.enum(["instagram", "whatsapp", "google", "indicacao", "site", "outro"]),
  valorEstimado: z.string().optional(),

  // Novos campos
  indicadoPor: z.string().optional(),
  profissao: z.string().optional(),
  produtoInteresse: z.string().optional(),
  possuiClinica: z.enum(["sim", "nao"]).optional(),
  anosEstetica: z.string().optional(),
  faturamentoMensal: z.string().optional(),
  dorPrincipal: z.string().optional(),
  desejoPrincipal: z.string().optional(),
  temperatura: z.enum(["frio", "morno", "quente"]).optional(),
});

type CreateLeadFormValues = z.infer<typeof createLeadFormSchema>;

interface CreateLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateLeadDialog({ isOpen, onClose, onSuccess }: CreateLeadDialogProps) {
  const trpcUtils = trpc.useUtils();
  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      empresa: "",
      valorEstimado: "",
      indicadoPor: "",
      profissao: "",
      produtoInteresse: "",
      possuiClinica: undefined,
      anosEstetica: "",
      faturamentoMensal: "",
      dorPrincipal: "",
      desejoPrincipal: "",
      temperatura: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const mutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      trpcUtils.leads.list.invalidate();
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao criar lead: ${err.message}`);
    },
  });

  const onSubmit = (values: CreateLeadFormValues) => {
    // Convert valorEstimado from string to cents (number)
    const valorEstimadoCents = values.valorEstimado
      ? Math.round(
          parseFloat(values.valorEstimado.replace("R$", "").replace(".", "").replace(",", ".")) *
            100
        )
      : undefined;

    const anosEsteticaNumber = values.anosEstetica ? parseInt(values.anosEstetica, 10) : undefined;

    mutation.mutate({
      nome: values.nome,
      email: values.email,
      telefone: values.telefone,
      empresa: values.empresa,
      origem: values.origem,
      valorEstimado: valorEstimadoCents,
      indicadoPor: values.indicadoPor,
      profissao: values.profissao,
      produtoInteresse: values.produtoInteresse,
      possuiClinica: values.possuiClinica,
      anosEstetica: anosEsteticaNumber,
      faturamentoMensal: values.faturamentoMensal,
      dorPrincipal: values.dorPrincipal,
      desejoPrincipal: values.desejoPrincipal,
      temperatura: values.temperatura,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do lead" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp / Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profissao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Biomédica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Qualificação */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                Qualificação
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="possuiClinica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possui Clínica?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anosEstetica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anos na Estética</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faturamentoMensal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faturamento Mensal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 10k - 20k" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatura do Lead</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="frio">Frio ❄️</SelectItem>
                          <SelectItem value="morno">Morno 🌤️</SelectItem>
                          <SelectItem value="quente">Quente 🔥</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contexto e Origem */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                Contexto da Venda
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem do Lead*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="indicacao">Indicação</SelectItem>
                          <SelectItem value="site">Site</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="indicadoPor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicado Por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome de quem indicou" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="produtoInteresse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto de Interesse</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mentoria" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorEstimado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Proposta (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="dorPrincipal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Dor/Dificuldade</FormLabel>
                      <FormControl>
                        {/* Using Input for now, could be Textarea */}
                        <Input placeholder="O que mais incomoda hoje?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desejoPrincipal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Desejo/Sonho</FormLabel>
                      <FormControl>
                        <Input placeholder="Onde quer chegar?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t mt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Criando..." : "Criar Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
