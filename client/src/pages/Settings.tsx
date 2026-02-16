/**
 * Settings Page
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
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your integrations and automations</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* WhatsApp Integration Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">WhatsApp Integration</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your WhatsApp account via Z-API to send and receive messages directly from the CRM.
          </p>
          <WhatsAppConnectionCard />
        </section>

        <Separator />

        {/* AI Agent Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-semibold">AI Agent (SDR)</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure automatic AI-powered responses for lead qualification.
          </p>
          <AIAgentSettingsCard />
        </section>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
