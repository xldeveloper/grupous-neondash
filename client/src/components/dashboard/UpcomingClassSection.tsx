/**
 * Upcoming Class Section
 * Displays up to 2 upcoming mentor sessions from the public calendar.
 * Shows events side by side for better visibility.
 */

import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
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

interface SessionData {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  url?: string | null;
  description?: string | null;
}

function EventCard({
  session,
  isLive,
  isPrimary = false,
}: {
  session: SessionData;
  isLive: boolean;
  isPrimary?: boolean;
}) {
  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(session.date), {
    addSuffix: true,
    locale: enUS,
  });

  // Format date and time
  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const formattedTime = new Date(session.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all",
        isPrimary
          ? "bg-muted/40 dark:bg-slate-800/40 border-border/60 dark:border-slate-700/60"
          : "bg-muted/20 dark:bg-slate-800/20 border-border/30 dark:border-slate-700/30",
        isLive && "ring-2 ring-red-500/50"
      )}
    >
      {/* Video Icon / Live Indicator */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border relative",
          isLive
            ? "bg-red-500/10 border-red-500/30"
            : isPrimary
              ? "bg-primary/10 border-primary/30"
              : "bg-muted/50 border-border/50"
        )}
      >
        <Video className={cn("w-5 h-5", isLive ? "text-red-500" : "text-primary")} />
        {isLive && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        )}
      </div>

      {/* Session Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground text-sm truncate">{session.title}</h4>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formattedTime}
          </span>
        </div>
        <span
          className={cn(
            "inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
            isLive ? "bg-red-500/20 text-red-400" : "bg-primary/10 text-primary"
          )}
        >
          {isLive ? "LIVE" : relativeTime}
        </span>
      </div>

      {/* Action Button */}
      {session.url && (
        <Button
          asChild
          size="sm"
          className={cn(
            "flex-shrink-0 h-8 px-3 font-semibold shadow transition-all hover:scale-105",
            isLive
              ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-none"
              : "bg-[#D4AF37] hover:bg-[#F2D06B] text-slate-900 border-none"
          )}
        >
          <a href={session.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            {isLive ? "Join" : "Access"}
          </a>
        </Button>
      )}
    </div>
  );
}

export function UpcomingClassSection({ isAdmin = false }: UpcomingClassSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch public calendar sessions with 5-minute polling
  const { data: sessions, isLoading } = trpc.classes.getPublicLiveSessions.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });

  const firstSession = sessions?.[0];
  const secondSession = sessions?.[1];

  // Check if sessions are live
  const isSessionLive = (session: SessionData | undefined) => {
    if (!session?.date) return false;
    const start = new Date(session.date);
    const end = session.endDate
      ? new Date(session.endDate)
      : new Date(start.getTime() + 90 * 60 * 1000);
    const now = new Date();
    return now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
        <div className="h-20 bg-muted/30 rounded-xl" />
        <div className="h-20 bg-muted/20 rounded-xl" />
      </div>
    );
  }

  if (!firstSession && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Upcoming Classes
        </h3>
        {isAdmin && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Public Calendar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Classes are automatically synced from the public Google Calendar. To
                  edit, access the calendar directly.
                </p>
                <Button asChild className="w-full">
                  <a
                    href="https://calendar.google.com/calendar/u/0/r"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Google Calendar
                  </a>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {firstSession ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <EventCard session={firstSession} isLive={isSessionLive(firstSession)} isPrimary />
          {secondSession ? (
            <EventCard session={secondSession} isLive={isSessionLive(secondSession)} />
          ) : (
            <div className="flex items-center justify-center p-3 rounded-xl border border-dashed border-border/30 text-sm text-muted-foreground">
              No other scheduled events
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-border/40 text-center">
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Set up upcoming classes in the calendar" : "No classes scheduled"}
          </p>
        </div>
      )}
    </div>
  );
}
