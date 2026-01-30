import { useState } from "react";
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
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";

// Schema for template
const templateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  type: z.enum(["whatsapp", "email", "ligacao", "reuniao", "nota"]),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface InteractionTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: any) => void; // Optional: if used for selection
}

export function InteractionTemplatesDialog({
  isOpen,
  onClose,
  onSelectTemplate,
}: InteractionTemplatesDialogProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">(
    "list"
  );
  const [editingId, setEditingId] = useState<number | null>(null);

  const trpcUtils = trpc.useUtils();
  const { data: templatesData, isLoading } =
    trpc.interactionTemplates.list.useQuery(undefined, {
      enabled: isOpen,
    });

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: "",
      type: "whatsapp",
      content: "",
    },
  });

  const createMutation = trpc.interactionTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template criado!");
      trpcUtils.interactionTemplates.list.invalidate();
      setActiveTab("list");
      form.reset();
    },
    onError: err => toast.error(`Erro ao criar: ${err.message}`),
  });

  const updateMutation = trpc.interactionTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("Template atualizado!");
      trpcUtils.interactionTemplates.list.invalidate();
      setActiveTab("list");
      setEditingId(null);
      form.reset();
    },
    onError: err => toast.error(`Erro ao atualizar: ${err.message}`),
  });

  const deleteMutation = trpc.interactionTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template excluído!");
      trpcUtils.interactionTemplates.list.invalidate();
    },
    onError: err => toast.error(`Erro ao excluir: ${err.message}`),
  });

  const onSubmit = (values: TemplateFormValues) => {
    if (activeTab === "create") {
      createMutation.mutate(values);
    } else if (activeTab === "edit" && editingId) {
      updateMutation.mutate({ id: editingId, ...values });
    }
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    form.reset({
      title: template.title,
      type: template.type,
      content: template.content,
    });
    setActiveTab("edit");
  };

  const handleCreate = () => {
    form.reset({
      title: "",
      type: "whatsapp",
      content: "",
    });
    setActiveTab("create");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          setActiveTab("list");
          setEditingId(null);
        }
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Templates de Interação</DialogTitle>
          <DialogDescription>
            Gerencie seus templates de mensagens para uso rápido.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as any)}
          className="flex-1 flex flex-col min-h-0"
        >
          {activeTab === "list" && (
            <div className="flex justify-between items-center mb-4">
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" /> Novo Template
              </Button>
            </div>
          )}

          <TabsContent value="list" className="flex-1 overflow-y-auto mt-0">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : templatesData?.templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum template encontrado.
              </div>
            ) : (
              <div className="space-y-3 p-1">
                {templatesData?.templates.map((template: any) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div
                          className="flex-1"
                          onClick={() => onSelectTemplate?.(template)}
                        >
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            {template.title}
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">
                              {template.type}
                            </span>
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.content}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEdit(template)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-destructive"
                            onClick={() => {
                              if (confirm("Excluir template?"))
                                deleteMutation.mutate({ id: template.id });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="flex-1 mt-0">
            <TemplateForm
              form={form}
              onSubmit={onSubmit}
              isPending={createMutation.isPending}
              onCancel={() => setActiveTab("list")}
              mode="create"
            />
          </TabsContent>

          <TabsContent value="edit" className="flex-1 mt-0">
            <TemplateForm
              form={form}
              onSubmit={onSubmit}
              isPending={updateMutation.isPending}
              onCancel={() => setActiveTab("list")}
              mode="edit"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function TemplateForm({ form, onSubmit, isPending, onCancel, mode }: any) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Boas vindas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ligacao">Ligação</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="nota">Nota</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Olá, gostaria de saber..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {mode === "create" ? "Criar Template" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
