/**
 * Settings Page - Configurações
 * Manages WhatsApp Z-API connection and AI agent settings
 */

import { MessageCircle, Settings2, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Separator } from "@/components/ui/separator";
import { AIAgentSettingsCard } from "@/components/whatsapp/AIAgentSettingsCard";
import { WhatsAppConnectionCard } from "@/components/whatsapp/WhatsAppConnectionCard";

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas integrações e automações</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* WhatsApp Integration Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Integração WhatsApp</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Conecte sua conta WhatsApp via Z-API para enviar e receber mensagens diretamente do CRM.
          </p>
          <WhatsAppConnectionCard />
        </section>

        <Separator />

        {/* AI Agent Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Agente IA (SDR)</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure respostas automáticas com inteligência artificial para qualificação de leads.
          </p>
          <AIAgentSettingsCard />
        </section>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
