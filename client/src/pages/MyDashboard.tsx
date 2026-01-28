
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { NeonCRM } from "@/components/dashboard/NeonCRM";
import { TaskBoard } from "@/components/dashboard/TaskBoard";
import { ClassList } from "@/components/dashboard/ClassList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyDashboard() {
  const { data: mentorado, isLoading, error } = trpc.mentorados.me.useQuery(undefined, {
    retry: false,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !mentorado) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="bg-red-950/20 border-red-900/50 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Restrito</AlertTitle>
          <AlertDescription>
            Este dashboard é exclusivo para mentorados oficiais. Se você é um mentorado e está vendo esta mensagem, entre em contato com o suporte.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt pointer-events-none blur-sm"></div>
            <Avatar className="h-24 w-24 border-2 border-slate-950 relative">
              <AvatarImage src={mentorado.fotoUrl || undefined} alt={mentorado.nomeCompleto} />
              <AvatarFallback className="bg-slate-900 text-neon-gold font-mono text-2xl">
                {mentorado.nomeCompleto.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
              Olá, <span className="bg-gradient-to-r from-neon-blue via-purple-400 to-neon-gold bg-clip-text text-transparent">{mentorado.nomeCompleto.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-0.5 rounded-full bg-neon-gold/10 text-neon-gold text-xs font-mono uppercase tracking-wider border border-neon-gold/20">
                Time Black
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono uppercase tracking-wider">
                {mentorado.turma.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-lg mt-2 font-mono">
              "O sucesso deixa rastros. Siga o processo, confie na estrutura e escale seus resultados."
            </p>
          </div>
        </div>

        {/* CRM Summary Section */}
        <section>
          <NeonCRM />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          {/* Left Column: Tasks - Takes up 7/12 on large screens */}
          <section className="lg:col-span-7 h-full">
             <TaskBoard />
          </section>

          {/* Right Column: Classes & Meetings - Takes up 5/12 on large screens */}
          <section className="lg:col-span-5 h-full">
            <ClassList />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
