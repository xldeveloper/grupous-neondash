import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SubmitMetricsForm } from "./SubmitMetricsForm";

export function SubmitMetricsSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-neon-gold hover:bg-neon-gold/90 text-neon-blue-dark font-semibold">
          <PlusCircle className="mr-2 h-4 w-4" />
          Enviar Métricas
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Enviar Métricas Mensais</SheetTitle>
          <SheetDescription>
            Preencha seus resultados do mês para acompanhamento de performance.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <SubmitMetricsForm onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
