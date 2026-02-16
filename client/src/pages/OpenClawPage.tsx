/**
 * OpenClaw Page - AI Assistant Chat Interface
 *
 * Main page for interacting with the NEON AI Assistant.
 * Simplified version using the new aiAssistant router.
 */

import { Bot, Target } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ChatInterface } from "@/components/openclaw/ChatInterface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function OpenClawPage() {
  const contextQuery = trpc.aiAssistant.getContext.useQuery();

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">NEON Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Your AI-powered mentorship assistant
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>

          {/* Context Sidebar */}
          <div className="space-y-4">
            {/* Current Mentee Card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-primary" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contextQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : contextQuery.data?.hasProfile && contextQuery.data.mentorado ? (
                  <>
                    <div>
                      <p className="font-medium">{contextQuery.data.mentorado.nome}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {contextQuery.data.mentorado.turma === "neon" ? "NEON" : "NEON"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-muted-foreground">Goal</p>
                        <p className="font-semibold">
                          R${" "}
                          {contextQuery.data.mentorado.metaFaturamento?.toLocaleString("pt-BR") ??
                            "-"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-muted-foreground">AI Status</p>
                        <p className="font-semibold">
                          {contextQuery.data.aiConfigured ? "Active" : "Offline"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Mentee profile not found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* AI Status Card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Bot className="h-4 w-4 text-emerald-500" />
                  Assistant Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={contextQuery.data?.aiConfigured ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {contextQuery.data?.aiConfigured ? "Configured" : "Not configured"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
