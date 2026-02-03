import { Instagram } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InstagramBadgeProps {
  count: number;
  syncedAt?: Date | string | null;
  type: "posts" | "stories";
  className?: string;
}

/**
 * Badge showing Instagram data with sync info tooltip
 */
export function InstagramBadge({ count, syncedAt, type, className }: InstagramBadgeProps) {
  const label = type === "posts" ? "posts" : "stories";

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md",
              "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
              "border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400",
              "animate-in fade-in duration-300",
              className
            )}
          >
            <Instagram className="h-3 w-3" />
            <span>
              {count} {label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{syncedAt ? `Sincronizado em ${formatDate(syncedAt)}` : "Dados do Instagram"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
