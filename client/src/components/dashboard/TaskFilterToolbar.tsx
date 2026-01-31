import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TaskFilters {
  search: string;
  category: string;
  priority: string;
}

interface TaskFilterToolbarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  className?: string;
}

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "geral", label: "Geral" },
  { value: "aula", label: "Aula" },
  { value: "crm", label: "CRM" },
  { value: "financeiro", label: "Financeiro" },
  { value: "atividade", label: "Atividade" },
] as const;

const PRIORITIES = [
  { value: "", label: "Todas", color: "" },
  { value: "alta", label: "Alta", color: "text-amber-400" },
  { value: "media", label: "Média", color: "text-blue-400" },
  { value: "baixa", label: "Baixa", color: "text-slate-400" },
] as const;

export function TaskFilterToolbar({ filters, onFiltersChange, className }: TaskFilterToolbarProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  const hasActiveFilters = filters.search || filters.category || filters.priority;

  const clearFilters = () => {
    setSearchValue("");
    onFiltersChange({ search: "", category: "", priority: "" });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar tarefas..."
            className="pl-9 bg-background border-input focus:border-primary font-mono text-sm"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-background border-input font-mono text-sm">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value || "all"} value={cat.value || "all"} className="font-mono">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, priority: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-background border-input font-mono text-sm">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((pri) => (
              <SelectItem key={pri.value || "all"} value={pri.value || "all"} className="font-mono">
                <span className={pri.color}>{pri.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">Filtros:</span>

          {filters.search && (
            <Badge variant="outline" className="border-primary/50 text-primary text-xs font-mono">
              Busca: "{filters.search}"
            </Badge>
          )}

          {filters.category && (
            <Badge
              variant="outline"
              className="border-neon-gold/50 text-neon-gold text-xs font-mono"
            >
              {CATEGORIES.find((c) => c.value === filters.category)?.label}
            </Badge>
          )}

          {filters.priority && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-mono",
                filters.priority === "alta" && "border-amber-500/50 text-amber-400",
                filters.priority === "media" && "border-blue-500/50 text-blue-400",
                filters.priority === "baixa" && "border-slate-500/50 text-slate-400"
              )}
            >
              {PRIORITIES.find((p) => p.value === filters.priority)?.label}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground font-mono"
          >
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
