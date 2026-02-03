import { useCallback, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type MetricField = "faturamento" | "lucro" | "leads" | "procedimentos" | "postsFeed" | "stories";

interface UseAutoSaveOptions {
  fieldName: MetricField;
  ano: number;
  mes: number;
  onSuccess?: () => void;
}

/**
 * Pessimistic auto-save hook for metric fields
 * Saves on blur, shows "Saved" only after server confirmation
 */
export function useAutoSave({ fieldName, ano, mes, onSuccess }: UseAutoSaveOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const mutation = trpc.mentorados.updateMetricaField.useMutation({
    onMutate: () => {
      setIsLoading(true);
      setIsSaved(false);
    },
    onSuccess: () => {
      setIsLoading(false);
      setIsSaved(true);
      toast.success("Salvo ✓", { duration: 1500 });
      onSuccess?.();
      // Reset saved indicator after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error("Erro ao salvar", {
        description: error.message,
        action: {
          label: "Tentar novamente",
          onClick: () => {
            // Will be called with last value from closure
          },
        },
      });
    },
  });

  const handleBlur = useCallback(
    (value: number) => {
      if (value < 0) return;
      mutation.mutate({ ano, mes, field: fieldName, value });
    },
    [mutation, ano, mes, fieldName]
  );

  return { handleBlur, isLoading, isSaved };
}
