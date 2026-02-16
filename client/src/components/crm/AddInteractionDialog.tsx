import { zodResolver } from "@hookform/resolvers/zod";
import { BookTemplate } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { InteractionTemplatesDialog } from "./InteractionTemplatesDialog";

// Input schema for form - keeps duracao as string
const interactionFormSchema = z.object({
  tipo: z.enum(["ligacao", "email", "whatsapp", "reuniao", "nota"]),
  notas: z.string().min(1, "Notes are required"),
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
  onSuccess,
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
      toast.success("Interaction recorded!");
      trpcUtils.leads.list.invalidate();
      trpcUtils.leads.getById.invalidate({ id: leadId });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: () => {
      toast.error("Error recording interaction");
    },
  });

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { data: templates } = trpc.interactionTemplates.list.useQuery(undefined, {
    enabled: isOpen,
  });

  const onSubmit = (values: InteractionFormValues) => {
    mutation.mutate({
      leadId,
      tipo: values.tipo,
      notas: values.notas,
      duracao: values.duracao ? parseInt(values.duracao, 10) : undefined,
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
  };

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
            <DialogTitle>New Interaction</DialogTitle>
          </DialogHeader>

          {/* Template Quick Select */}
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setTemplatesOpen(true)}
            >
              <BookTemplate className="h-4 w-4" /> Manage Templates
            </Button>
            {templates?.templates.slice(0, 3).map((t: any) => (
              <Button
                key={t.id}
                variant="secondary"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => handleTemplateSelect(t)}
              >
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
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nota">Note</SelectItem>
                        <SelectItem value="ligacao">Phone Call</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="reuniao">Meeting</SelectItem>
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the interaction..."
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
                      <FormLabel>Duration (minutes)</FormLabel>
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
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
