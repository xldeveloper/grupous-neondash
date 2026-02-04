/**
 * Upcoming Class Section
 * Displays the next scheduled mentor session from the public calendar.
 * Integrates into the mentorado profile header.
 */

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Edit2, ExternalLink, Video } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface UpcomingClassSectionProps {
  isAdmin?: boolean;
}

export function UpcomingClassSection({ isAdmin = false }: UpcomingClassSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch public calendar sessions with 5-minute polling
  const { data: sessions, isLoading } = trpc.classes.getPublicLiveSessions.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });

  const nextSession = sessions?.[0];

  // Check if session is live now (within session duration)
  const isLiveNow = (() => {
    if (!nextSession?.date) return false;
    const start = new Date(nextSession.date);
    const end = nextSession.endDate
      ? new Date(nextSession.endDate)
      : new Date(start.getTime() + 90 * 60 * 1000);
    const now = new Date();
    return now >= start && now <= end;
  })();

  // Format relative time
  const relativeTime = nextSession?.date
    ? formatDistanceToNow(new Date(nextSession.date), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;

  // Format date and time
  const formattedDate = nextSession?.date
    ? new Date(nextSession.date).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      })
    : null;

  const formattedTime = nextSession?.date
    ? new Date(nextSession.date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (isLoading) {
    return (
      <div className="border-t border-border/50 pt-4 mt-4 animate-pulse">
        <div className="h-12 bg-muted/50 rounded-lg" />
      </div>
    );
  }

  if (!nextSession && !isAdmin) {
    return null;
  }

  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 dark:bg-slate-800/30 border border-border/50 dark:border-slate-700/50">
        {/* Video Icon / Live Indicator */}
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border",
            isLiveNow
              ? "bg-red-500/10 border-red-500/30 animate-pulse"
              : "bg-primary/10 border-primary/30"
          )}
        >
          <Video className={cn("w-6 h-6", isLiveNow ? "text-red-500" : "text-primary")} />
          {isLiveNow && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </div>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          {nextSession ? (
            <>
              <h4 className="font-semibold text-foreground truncate">{nextSession.title}</h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedTime}
                </span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium",
                    isLiveNow ? "bg-red-500/20 text-red-400" : "bg-primary/10 text-primary"
                  )}
                >
                  {isLiveNow ? "AO VIVO" : relativeTime}
                </span>
              </div>
              {nextSession.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {nextSession.description}
                </p>
              )}
            </>
          ) : (
            <>
              <h4 className="font-semibold text-muted-foreground">Nenhuma aula agendada</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {isAdmin ? "Configure a próxima aula no calendário" : "Aguarde novidades!"}
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {nextSession?.url && (
            <Button
              asChild
              size="sm"
              className={cn(
                "font-semibold shadow-lg transition-all hover:scale-105",
                isLiveNow
                  ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-none"
                  : "bg-[#D4AF37] hover:bg-[#F2D06B] text-slate-900 border-none"
              )}
            >
              <a href={nextSession.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1.5" />
                {isLiveNow ? "Entrar" : "Acessar"}
              </a>
            </Button>
          )}

          {isAdmin && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Calendário Público</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    As aulas são sincronizadas automaticamente do Google Calendar público. Para
                    editar, acesse o calendário diretamente.
                  </p>
                  <Button asChild className="w-full">
                    <a
                      href="https://calendar.google.com/calendar/u/0/r"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Google Calendar
                    </a>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
