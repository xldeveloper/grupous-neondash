import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { LeadDetailModal } from "./LeadDetailModal";
import { Button } from "../ui/button";
import { trpc } from "@/lib/trpc";
import { Plus, ListFilter, CheckSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definindo as colunas do Kanban com IDs alinhados ao banco (enum status_lead)
const COLUMNS = [
  { id: "novo", title: "Novo", color: "bg-blue-500", border: "border-blue-500/20" },
  { id: "primeiro_contato", title: "Primeiro Contato", color: "bg-indigo-500", border: "border-indigo-500/20" },
  { id: "qualificado", title: "Qualificado", color: "bg-purple-500", border: "border-purple-500/20" },
  { id: "proposta", title: "Proposta", color: "bg-orange-500", border: "border-orange-500/20" },
  { id: "negociacao", title: "Negociação", color: "bg-amber-500", border: "border-amber-500/20" },
  { id: "fechado", title: "Fechado", color: "bg-emerald-500", border: "border-emerald-500/20" },
];

export function PipelineKanban() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const utils = trpc.useUtils();
  const { data: leadsData, isLoading } = trpc.leads.list.useQuery({});

  const updateStatusMutation = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      toast.success("Status atualizado");
    },
  });

  const bulkUpdateMutation = trpc.leads.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      setSelectedLeads([]);
      setIsSelectMode(false);
      toast.success("Leads atualizados com sucesso");
    },
  });

  const bulkDeleteMutation = trpc.leads.bulkDelete.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      setSelectedLeads([]);
      setIsSelectMode(false);
      toast.success("Leads removidos com sucesso");
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const leadId = parseInt(activeId.toString().replace("lead-", ""));
    // Se soltou sobre uma coluna
    const newStatus = COLUMNS.find((col) => col.id === overId)?.id;

    if (newStatus) {
      updateStatusMutation.mutate({
        id: leadId,
        status: newStatus as any,
      });
    }

    setActiveId(null);
  };

  const handleLeadClick = (id: number) => {
    if (isSelectMode) {
        toggleSelectLead(id);
    } else {
        setSelectedLeadId(id);
        setIsDetailOpen(true);
    }
  };

  const toggleSelectLead = (id: number) => {
    setSelectedLeads(prev => 
        prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: string) => {
    if (selectedLeads.length === 0) return;
    bulkUpdateMutation.mutate({
        ids: selectedLeads,
        status: status as any
    });
  };

  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir ${selectedLeads.length} leads?`)) {
        bulkDeleteMutation.mutate({ ids: selectedLeads });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-[calc(100vh-12rem)]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-muted/10 rounded-xl h-full animate-pulse border border-border/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/40 p-4 rounded-xl border border-border backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pipeline de Vendas
        </h1>
        
        <div className="flex items-center gap-2">
            <Button 
                variant={isSelectMode ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    setSelectedLeads([]);
                }}
            >
                <CheckSquare className="mr-2 h-4 w-4" />
                {isSelectMode ? "Cancelar" : "Selecionar"}
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button variant="outline" size="sm">
                <ListFilter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Novo Lead
            </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px] h-full">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                leads={leadsData?.leads?.filter((lead) => lead.status === column.id) || []}
                activeId={activeId}
                onLeadClick={handleLeadClick}
                accentColor={column.color}
                isSelectMode={isSelectMode}
                selectedLeads={selectedLeads}
                onToggleSelect={toggleSelectLead}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="rotate-2 scale-105 cursor-grabbing opacity-90 shadow-2xl">
                <LeadCard
                lead={leadsData?.leads?.find((l) => `lead-${l.id}` === activeId)!}
                onClick={() => {}}
                />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Bulk Action Bar */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover/90 border border-border shadow-2xl shadow-primary/10 rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in backdrop-blur-md z-50">
            <span className="text-sm font-medium text-foreground pr-4 border-r border-border">
                {selectedLeads.length} selecionado(s)
            </span>
            
            <div className="flex items-center gap-2">
                <Select onValueChange={handleBulkStatusChange}>
                    <SelectTrigger className="h-8 w-[140px] border-none bg-muted/50 hover:bg-muted focus:ring-0">
                        <SelectValue placeholder="Mover para..." />
                    </SelectTrigger>
                    <SelectContent>
                        {COLUMNS.map(col => (
                            <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleBulkDelete}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </Button>
            </div>
        </div>
      )}

      {selectedLeadId && (
        <LeadDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          leadId={selectedLeadId}
        />
      )}
    </div>
  );
}
