import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { MenteeManagementView } from "@/components/admin/MenteeManagementView";
import { LinkEmailsView } from "@/components/admin/LinkEmailsView";

export default function GestaoMentorados() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Área Administrativa
            </h1>
            <p className="text-slate-500 mt-1">
              Gerenciamento completo de mentorados, acessos e métricas do sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue="management" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] bg-slate-100 p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-neon-blue-dark data-[state=active]:shadow-sm"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="management"
              className="data-[state=active]:bg-white data-[state=active]:text-neon-blue-dark data-[state=active]:shadow-sm"
            >
              Mentorados
            </TabsTrigger>
             <TabsTrigger 
              value="access"
              className="data-[state=active]:bg-white data-[state=active]:text-neon-blue-dark data-[state=active]:shadow-sm"
            >
              Vincular Acessos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-300">
             <AdminOverview />
          </TabsContent>

          <TabsContent value="management" className="space-y-4 animate-in fade-in-50 duration-300">
            <MenteeManagementView />
          </TabsContent>

          <TabsContent value="access" className="space-y-4 animate-in fade-in-50 duration-300">
            <LinkEmailsView />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
