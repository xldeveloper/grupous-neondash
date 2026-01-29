import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { 
  Phone, MessageSquare, Plus, MessageCircle, 
  CheckSquare, RefreshCw, Trash2, X, MoreHorizontal 
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PipelineKanbanProps {
  filters: any;
  onLeadClick: (leadId: number) => void;
  onCreateOpen: () => void;
  mentoradoId?: number;
  isReadOnly?: boolean;
}

// Updated columns with subtle modern colors
const COLUMNS = [
  { id: "novo", title: "Novo", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "primeiro_contato", title: "Primeiro Contato", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  { id: "qualificado", title: "Qualificado", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "proposta", title: "Proposta", color: "text-orange-600", bg: "bg-orange-600/10", border: "border-orange-600/20" },
  { id: "negociacao", title: "Negociação", color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { id: "fechado", title: "Fechado", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  { id: "perdido", title: "Perdido", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
];

export function PipelineKanban({ filters, onLeadClick, onCreateOpen, mentoradoId, isReadOnly = false }: PipelineKanbanProps) {
  const { data, isLoading, refetch } = trpc.leads.list.useQuery({
    ...filters,
    status: undefined, // Kanban shows all statuses
    limit: 100,
    mentoradoId,
  });

  const updateStatus = trpc.leads.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const [activeId, setActiveId] = useState<number | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const bulkUpdateStatus = trpc.leads.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
      setSelectedIds([]);
      setSelectMode(false);
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar status: ${err.message}`);
    }
  });

  const bulkDelete = trpc.leads.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success("Leads deletados com sucesso!");
      refetch();
      setSelectedIds([]);
      setSelectMode(false);
    },
    onError: (err) => {
      toast.error(`Erro ao deletar leads: ${err.message}`);
    }
  });

  const handleSelectOne = (checked: boolean, id: number) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const executeBulkStatus = (status: string) => {
     if (selectedIds.length === 0) return;
     bulkUpdateStatus.mutate({ ids: selectedIds, status: status as any });
  };

  const executeBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Tem certeza que deseja deletar ${selectedIds.length} leads?`)) {
      bulkDelete.mutate({ ids: selectedIds });
    }
  };

  const leadsByStatus = useMemo(() => {
    const groups: Record<string, any[]> = {};
    COLUMNS.forEach(col => groups[col.id] = []);

    if (data?.leads) {
      data.leads.forEach(lead => {
        if (groups[lead.status]) {
          groups[lead.status].push(lead);
        } else if ((lead.status as string) === "em_contato" && groups["primeiro_contato"]) {
          groups["primeiro_contato"].push(lead);
        } else if ((lead.status as string) === "proposta_enviada" && groups["proposta"]) {
          groups["proposta"].push(lead);
        } else if ((lead.status as string) === "fechado_ganho" && groups["fechado"]) {
          groups["fechado"].push(lead);
        } else if ((lead.status as string) === "fechado_perdido" && groups["perdido"]) {
            if (groups["perdido"]) groups["perdido"].push(lead);
        }
      });
    }
    return groups;
  }, [data]);

  const activeLead = useMemo(() => {
    return data?.leads.find(l => l.id === activeId);
  }, [data, activeId]);

  const handleDragStart = (event: DragStartEvent) => {
    if (isReadOnly) return;
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (isReadOnly) return;

    const { active, over } = event;

    if (!over) return;

    const leadId = active.id as number;
    let newStatus = over.id as string;
    const lead = data?.leads.find(l => l.id === leadId);

    if (lead && lead.status !== newStatus) {
      updateStatus.mutate({
        id: leadId,
        // @ts-expect-error Validated by UI columns
        status: newStatus
      });
      
      // Optimistic update logic could go here
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="min-w-[300px] w-[300px]">
            <Skeleton className="h-[600px] w-full rounded-xl bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
      {/* Selection Toolbar */}
      {!isReadOnly && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-border/50">
           <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
             Pipe de Vendas
             <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted/50">{data?.leads.length || 0} Leads</Badge>
           </h2>
           <Button 
              variant={selectMode ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedIds([]);
              }}
              className="gap-2 h-8 text-xs font-medium"
           >
              <CheckSquare className="h-3.5 w-3.5" />
              {selectMode ? "Cancelar" : "Selecionar"}
           </Button>
        </div>
      )}

    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <ScrollArea className="flex-1 w-full bg-muted/5">
        <div className="flex gap-4 p-4 min-w-max h-full items-stretch">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={leadsByStatus[col.id] || []}
              onLeadClick={onLeadClick}
              onCreateOpen={onCreateOpen}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onSelect={handleSelectOne}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {createPortal(
        <DragOverlay>
          {activeLead && (
            <LeadCard lead={activeLead} onClick={() => {}} isOverlay />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
    
    {/* Bulk Actions Floating Bar */}
    {selectedIds.length > 0 && !isReadOnly && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-popover/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-2 flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in z-50 ring-1 ring-black/5">
            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold mr-2 border border-primary/20">
                {selectedIds.length} selecionados
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Mudar Status
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                    <DropdownMenuLabel>Mover para...</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {COLUMNS.map(col => (
                        <DropdownMenuItem key={col.id} onClick={() => executeBulkStatus(col.id)}>
                            <div className={`w-2 h-2 rounded-full ${col.color.replace('text-', 'bg-')} mr-2`} />
                            {col.title}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <Button variant="destructive" size="sm" className="h-8 gap-2 shadow-sm" onClick={executeBulkDelete}>
                <Trash2 className="h-3.5 w-3.5" />
                Deletar
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setSelectedIds([])} className="h-8 w-8 ml-1 rounded-full hover:bg-muted">
                <X className="h-4 w-4" />
            </Button>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ column, leads, onLeadClick, onCreateOpen, selectMode, selectedIds, onSelect, isReadOnly }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[300px] w-[300px] flex flex-col h-full rounded-2xl transition-all duration-300 ${
        isOver ? "bg-accent/30 ring-2 ring-primary/20 ring-inset" : "bg-transparent"
      }`}
    >
      {/* Column Header */}
      <div className="mb-3 px-1 sticky top-0 z-10">
        <div className={`flex items-center justify-between p-3 rounded-xl border backdrop-blur-sm bg-background/40 ${column.border} border-t-4`}>
            <div className="flex items-center gap-2.5">
                <div className={`text-xs font-bold uppercase tracking-wider ${column.color}`}>
                    {column.title}
                </div>
            </div>
            <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center bg-background/80 font-bold border-border/50">
                {leads.length}
            </Badge>
        </div>

        {/* Novo Column Quick Add */}
        {column.id === "novo" && !isReadOnly && (
           <Button 
            variant="ghost" 
            className="w-full mt-2 border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary h-9 text-xs uppercase tracking-wide font-medium" 
            onClick={onCreateOpen}
           >
             <Plus className="h-3.5 w-3.5 mr-1.5" /> Novo Lead
           </Button>
        )}
      </div>

      <ScrollArea className="flex-1 -mr-2 pr-2">
        <div className="flex flex-col gap-3 px-1 pb-4">
          {leads.length === 0 && column.id !== "novo" ? (
             <div className="h-32 border-2 border-dashed border-muted-foreground/5 rounded-xl flex flex-col items-center justify-center text-center p-4 gap-2 opacity-50">
               <div className="p-3 bg-muted/20 rounded-full">
                  <Plus className="h-4 w-4 text-muted-foreground/50" />
               </div>
               <span className="text-xs text-muted-foreground/70">Arraste leads para cá</span>
             </div>
          ) : (
            leads.map((lead: any) => (
              <DraggableLeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onLeadClick(lead.id)}
                selectMode={selectMode}
                selected={selectedIds.includes(lead.id)}
                onSelect={(checked: boolean) => onSelect(checked, lead.id)}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function DraggableLeadCard({ lead, onClick, selectMode, selected, onSelect, isReadOnly }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    disabled: selectMode || isReadOnly,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...listeners} 
        {...attributes} 
        className={`${isDragging ? "shadow-2xl rotate-2 scale-105 z-50 cursor-grabbing" : "cursor-grab hover:scale-[1.02]"} transition-all duration-200 ease-out`}
    >
      <LeadCard 
        lead={lead} 
        onClick={onClick} 
        selectMode={selectMode} 
        selected={selected} 
        onSelect={onSelect}
        isDragging={isDragging}
      />
    </div>
  );
}

function LeadCard({ lead, onClick, isOverlay, selectMode, selected, onSelect, isDragging }: any) {
  return (
    <Card
      onClick={onClick}
      className={`
        relative overflow-hidden group border
        ${isOverlay 
            ? "shadow-2xl ring-2 ring-primary/30 bg-background" 
            : "shadow-sm hover:shadow-lg bg-card/60 hover:bg-card hover:border-sidebar-accent/50"
        }
        ${selected ? "ring-2 ring-primary border-primary bg-primary/5" : "border-transparent"}
        transition-all duration-300 backdrop-blur-sm
      `}
    >
      {/* Left colored border stripe based on status (optional, using hardcoded primary for now) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent group-hover:via-primary/50 transition-all opacity-0 group-hover:opacity-100" />

      <CardContent className="p-3.5 space-y-3">
        {/* Header: Avatar + Name */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
             {selectMode && (
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <Checkbox checked={selected} onCheckedChange={onSelect} />
                </div>
             )}
             
             <Avatar className="h-9 w-9 border-2 border-background shadow-sm shrink-0">
               <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                 {lead.nome.substring(0, 2).toUpperCase()}
               </AvatarFallback>
             </Avatar>
             
             <div className="min-w-0">
               <h4 className="font-semibold text-sm leading-tight text-foreground/90 truncate pr-2 group-hover:text-primary transition-colors">
                  {lead.nome}
               </h4>
               {lead.empresa && (
                   <p className="text-[11px] text-muted-foreground truncate opacity-80 mt-0.5">
                       {lead.empresa}
                   </p>
               )}
             </div>
          </div>

          {!isOverlay && !selectMode && (
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 text-muted-foreground/30 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
              </Button>
          )}
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
            {lead.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md border border-border/50">
                {tag}
                </span>
            ))}
            {lead.tags.length > 3 && <span className="text-[10px] text-muted-foreground pl-1">+{lead.tags.length - 3}</span>}
            </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground/70 bg-secondary/30 px-1.5 py-0.5 rounded">
                 {lead.valorEstimado 
                    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(lead.valorEstimado / 100)
                    : "R$ -"}
              </span>
           </div>

           <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
             <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-green-500/10 hover:text-green-600" onClick={(e) => { e.stopPropagation(); /* WhatsApp */ }}>
               <MessageCircle className="h-3.5 w-3.5" />
             </Button>
           </div>
        </div>

      </CardContent>
    </Card>
  );
}
