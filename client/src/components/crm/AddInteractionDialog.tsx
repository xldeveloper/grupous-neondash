import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { InteractionTemplatesDialog } from "./InteractionTemplatesDialog";
import { BookTemplate, Plus } from "lucide-react";

// Input schema for form - keeps duracao as string
const interactionFormSchema = z.object({
  tipo: z.enum(["ligacao", "email", "whatsapp", "reuniao", "nota"]),
  notas: z.string().min(1, "Notas são obrigatórias"),
  duracao: z.string().optional(),
});

type InteractionFormValues = z.infer<typeof interactionFormSchema>;

interface AddInteractionDialogProps {
  leadId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
  onSuccess?: () => void;
}

export function AddInteractionDialog({ 
  leadId, 
  isOpen, 
  onClose, 
  defaultType = "nota", 
  onSuccess 
}: AddInteractionDialogProps) {
  const trpcUtils = trpc.useUtils();
  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: {
      tipo: defaultType as InteractionFormValues["tipo"],
      notas: "",
      duracao: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        tipo: defaultType as InteractionFormValues["tipo"],
        notas: "",
        duracao: "",
      });
    }
  }, [isOpen, defaultType, form]);

  const mutation = trpc.leads.addInteraction.useMutation({
    onSuccess: () => {
      toast.success("Interação registrada!");
      trpcUtils.leads.list.invalidate();
      trpcUtils.leads.getById.invalidate({ id: leadId });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: () => {
      toast.error("Erro ao registrar interação");
    },
  });

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { data: templates } = trpc.interactionTemplates.list.useQuery(undefined, { enabled: isOpen });

  const onSubmit = (values: InteractionFormValues) => {
    mutation.mutate({
      leadId,
      tipo: values.tipo,
      notas: values.notas,
      duracao: values.duracao ? parseInt(values.duracao) : undefined,
    });
  };

  const watchTipo = form.watch("tipo");

  const handleTemplateSelect = (template: any) => {
      form.setValue("notas", template.content);
      // Optional: change type if template dictates?
      if (template.type) {
          form.setValue("tipo", template.type);
      }
      setTemplatesOpen(false);
  }

  return (
    <>
    <InteractionTemplatesDialog 
        isOpen={templatesOpen} 
        onClose={() => setTemplatesOpen(false)} 
        onSelectTemplate={handleTemplateSelect}
    />
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Interação</DialogTitle>
        </DialogHeader>
        
        {/* Template Quick Select */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => setTemplatesOpen(true)}>
                <BookTemplate className="h-4 w-4" /> Gerenciar Templates
            </Button>
            {templates?.templates.slice(0, 3).map((t: any) => (
                <Button key={t.id} variant="secondary" size="sm" className="shrink-0 text-xs" onClick={() => handleTemplateSelect(t)}>
                    {t.title}
                </Button>
            ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nota">Nota</SelectItem>
                      <SelectItem value="ligacao">Ligação</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva a interação..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchTipo === "ligacao" && (
              <FormField
                control={form.control}
                name="duracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}
