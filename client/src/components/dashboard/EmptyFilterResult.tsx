import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyFilterResultProps {
  onClearFilters: () => void;
}

export function EmptyFilterResult({ onClearFilters }: EmptyFilterResultProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 font-mono mb-2">
        Nenhuma tarefa encontrada
      </h3>
      <p className="text-sm text-slate-500 font-mono mb-4 max-w-xs">
        Não encontramos tarefas com os filtros aplicados. Tente ajustar seus critérios de busca.
      </p>
      <Button
        variant="outline"
        onClick={onClearFilters}
        className="font-mono border-primary/50 text-primary hover:bg-primary/10"
      >
        Limpar filtros
      </Button>
    </div>
  );
}
