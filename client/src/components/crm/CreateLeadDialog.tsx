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
  nome: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  origem: z.enum(["instagram", "whatsapp", "google", "indicacao", "site", "outro"]),
  valorEstimado: z.string().optional(),

  // B2B / Qualification Fields
  indicadoPor: z.string().optional(),
  profissao: z.string().optional(),
  produtoInteresse: z.string().optional(),
  possuiClinica: z.enum(["sim", "nao"]).optional(),
  anosEstetica: z.string().optional(),
  faturamentoMensal: z.string().optional(),
  dorPrincipal: z.string().optional(),
  desejoPrincipal: z.string().optional(),
  temperatura: z.enum(["frio", "morno", "quente"]).optional(),

  // Aesthetic Fields (B2C)
  dataNascimento: z.string().optional(),
  genero: z.string().optional(),
  procedimentosInteresse: z.string().optional(), // Input as string, convert to array
  historicoEstetico: z.string().optional(),
  alergias: z.string().optional(),
  tipoPele: z.string().optional(),
  disponibilidade: z.string().optional(),
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
      // Aesthetic defaults
      dataNascimento: "",
      genero: "",
      procedimentosInteresse: "",
      historicoEstetico: "",
      alergias: "",
      tipoPele: "",
      disponibilidade: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const mutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead created successfully!");
      trpcUtils.leads.list.invalidate();
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Error creating lead: ${err.message}`);
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

    // Convert comma-separated string to array
    const procedimentosArray = values.procedimentosInteresse
      ? values.procedimentosInteresse
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

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
      // Aesthetic Fields
      dataNascimento: values.dataNascimento || undefined,
      genero: values.genero,
      procedimentosInteresse: procedimentosArray,
      historicoEstetico: values.historicoEstetico,
      alergias: values.alergias,
      tipoPele: values.tipoPele,
      disponibilidade: values.disponibilidade,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Personal Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                Personal Data
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Lead name" {...field} />
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
                        <Input placeholder="email@example.com" {...field} />
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
                      <FormLabel>WhatsApp / Phone</FormLabel>
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
                      <FormLabel>Profession</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g.: Biomedical" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Feminino">Female</SelectItem>
                          <SelectItem value="Masculino">Male</SelectItem>
                          <SelectItem value="Outro">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 2. Commercial Anamnesis */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                Commercial Anamnesis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoPele"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skin Type</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g.: Oily, Dry..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alergias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Input placeholder="Any allergies?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="historicoEstetico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aesthetic History</FormLabel>
                    <FormControl>
                      <Input placeholder="Any previous procedures? Which ones?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 3. Interest */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">Interest</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="procedimentosInteresse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedures of Interest</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g.: Botox, Fillers (separate with commas)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disponibilidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g.: Mornings, Tuesdays..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dorPrincipal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Complaint (Pain)</FormLabel>
                      <FormControl>
                        <Input placeholder="What bothers you the most?" {...field} />
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
                      <FormLabel>Desire/Dream</FormLabel>
                      <FormControl>
                        <Input placeholder="Expected outcome?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 4. Other (B2B / Qualification) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
                Qualification / B2B
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead Source*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="indicacao">Referral</SelectItem>
                          <SelectItem value="site">Website</SelectItem>
                          <SelectItem value="outro">Other</SelectItem>
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
                      <FormLabel>Referred By</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of referrer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="temperatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="frio">Cold</SelectItem>
                          <SelectItem value="morno">Warm</SelectItem>
                          <SelectItem value="quente">Hot</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valorEstimado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal Value (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t mt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
