import { Calendar as CalendarIcon, Link, RefreshCw, Unlink } from "lucide-react";
import moment from "moment";
import "moment/locale/pt-br";
import { Calendar, type Event, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NeonCard } from "@/components/ui/neon-card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

// Set moment locale
moment.locale("pt-br");
const localizer = momentLocalizer(moment);

interface CalendarEvent extends Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  htmlLink?: string;
}

// Custom styling for dark theme
const calendarStyles = {
  style: { height: 600 },
  className: "neon-calendar",
};

export function Agenda() {
  const statusQuery = trpc.calendar.getStatus.useQuery();
  const authUrlQuery = trpc.calendar.getAuthUrl.useQuery(undefined, {
    enabled: statusQuery.data?.configured && !statusQuery.data?.connected,
  });
  const eventsQuery = trpc.calendar.getEvents.useQuery(undefined, {
    enabled: statusQuery.data?.connected,
  });
  const disconnectMutation = trpc.calendar.disconnect.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
    },
  });

  // Convert events to Calendar format
  const events: CalendarEvent[] =
    eventsQuery.data?.events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay,
      location: event.location,
      htmlLink: event.htmlLink,
    })) || [];

  const handleConnect = () => {
    if (authUrlQuery.data?.url) {
      window.location.href = authUrlQuery.data.url;
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  if (statusQuery.isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // Not configured state
  if (!statusQuery.data?.configured) {
    return (
      <div className="p-6">
        <NeonCard className="p-8 text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h2 className="text-xl font-bold font-mono text-slate-300 mb-2">
            Google Calendar não configurado
          </h2>
          <p className="text-sm text-slate-500 font-mono max-w-md mx-auto">
            O administrador precisa configurar as credenciais do Google Cloud para habilitar a
            integração com o Google Calendar.
          </p>
        </NeonCard>
      </div>
    );
  }

  // Not connected state
  if (!statusQuery.data?.connected) {
    return (
      <div className="p-6">
        <NeonCard className="p-8 text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-neon-gold" />
          <h2 className="text-xl font-bold font-mono text-slate-300 mb-2">
            Conecte seu Google Calendar
          </h2>
          <p className="text-sm text-slate-500 font-mono max-w-md mx-auto mb-6">
            Visualize seus compromissos diretamente no dashboard. Seus dados permanecem seguros e
            privados.
          </p>
          <Button
            onClick={handleConnect}
            disabled={!authUrlQuery.data?.url}
            className="bg-neon-blue hover:bg-neon-blue/80 text-black font-mono"
          >
            <Link className="w-4 h-4 mr-2" />
            Conectar Google Calendar
          </Button>
        </NeonCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-mono text-neon-gold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          AGENDA
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/50 text-green-400 font-mono">
            Conectado
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => eventsQuery.refetch()}
            disabled={eventsQuery.isFetching}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${eventsQuery.isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 font-mono"
          >
            <Unlink className="w-4 h-4 mr-1" />
            Desconectar
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <NeonCard className="p-4 overflow-hidden">
        {eventsQuery.isLoading ? (
          <Skeleton className="h-[600px] w-full" />
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            {...calendarStyles}
            messages={{
              today: "Hoje",
              previous: "Anterior",
              next: "Próximo",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Nenhum evento neste período.",
              showMore: (total) => `+${total} mais`,
            }}
            onSelectEvent={(event) => {
              if (event.htmlLink) {
                window.open(event.htmlLink, "_blank");
              }
            }}
          />
        )}
      </NeonCard>

      {/* Custom styles for dark theme */}
      <style>
        {`
          .neon-calendar {
            --rbc-today-highlight: rgba(59, 130, 246, 0.1);
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          }

          .neon-calendar .rbc-toolbar {
            margin-bottom: 1rem;
          }

          .neon-calendar .rbc-toolbar button {
            color: hsl(var(--foreground));
            border-color: hsl(var(--border));
            background: transparent;
          }

          .neon-calendar .rbc-toolbar button:hover {
            background: hsl(var(--accent));
          }

          .neon-calendar .rbc-toolbar button.rbc-active {
            background: hsl(var(--primary) / 0.2);
            color: hsl(var(--primary));
            border-color: hsl(var(--primary) / 0.5);
          }

          .neon-calendar .rbc-header {
            padding: 0.5rem;
            font-weight: 600;
            color: hsl(var(--muted-foreground));
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-month-view,
          .neon-calendar .rbc-time-view,
          .neon-calendar .rbc-agenda-view {
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-day-bg {
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-off-range-bg {
            background: hsl(var(--muted) / 0.3);
          }

          .neon-calendar .rbc-today {
            background: var(--rbc-today-highlight);
          }

          .neon-calendar .rbc-event {
            background: hsl(var(--primary));
            border: none;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.75rem;
          }

          .neon-calendar .rbc-event:hover {
            background: hsl(var(--primary) / 0.8);
          }

          .neon-calendar .rbc-show-more {
            color: hsl(var(--primary));
          }

          .neon-calendar .rbc-date-cell {
            padding: 0.25rem 0.5rem;
            color: hsl(var(--foreground));
          }

          .neon-calendar .rbc-date-cell.rbc-off-range {
            color: hsl(var(--muted-foreground));
          }

          .neon-calendar .rbc-agenda-date-cell,
          .neon-calendar .rbc-agenda-time-cell {
            padding: 0.5rem;
            color: hsl(var(--foreground));
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-agenda-event-cell {
            padding: 0.5rem;
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-time-header-content,
          .neon-calendar .rbc-time-content {
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-timeslot-group {
            border-color: hsl(var(--border));
          }

          .neon-calendar .rbc-time-slot {
            color: hsl(var(--muted-foreground));
          }
        `}
      </style>
    </div>
  );
}
