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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <PlusCircle className="mr-2 h-4 w-4" />
          Submit Metrics
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Submit Monthly Metrics</SheetTitle>
          <SheetDescription>
            Fill in your monthly results for performance tracking.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <SubmitMetricsForm onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
