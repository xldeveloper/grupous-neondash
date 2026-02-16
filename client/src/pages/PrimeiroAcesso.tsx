import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function PrimeiroAcesso() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const hasTriedAutoComplete = useRef(false);

  // Fetch diagnostic data
  const {
    data: diagnostic,
    isLoading: loadingDiag,
    refetch: refetchDiag,
  } = trpc.auth.diagnostic.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Complete onboarding mutation
  const { mutate: completeOnboarding, isPending: isCompletingOnboarding } =
    trpc.mentorados.completeOnboarding.useMutation({
      onSuccess: () => {
        toast.success("Redirecting to your dashboard...");
        navigate("/meu-dashboard");
      },
      onError: () => {
        // Even if mutation fails, still redirect (profile is linked)
        navigate("/meu-dashboard");
      },
    });

  // Auto-redirect when profile is fully linked
  useEffect(() => {
    if (
      diagnostic?.status.isFullyLinked &&
      !loadingDiag &&
      !hasTriedAutoComplete.current &&
      !isCompletingOnboarding
    ) {
      hasTriedAutoComplete.current = true;
      completeOnboarding();
    }
  }, [diagnostic?.status.isFullyLinked, loadingDiag, isCompletingOnboarding, completeOnboarding]);

  // Sync mutation
  const { mutate: syncUser, isPending: syncing } = trpc.auth.syncUser.useMutation({
    onSuccess: (result) => {
      if (result.linked) {
        toast.success("Profile linked successfully! Reload the page.");
        refetchDiag();
      } else {
        toast.info(result.message);
      }
    },
    onError: (err) => {
      toast.error(`Error syncing: ${err.message}`);
    },
  });

  const handleSync = () => {
    syncUser();
  };

  const handleRefresh = () => {
    refetchDiag();
    toast.info("Checking status...");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center mx-auto">
            <UserCircle className="w-12 h-12 text-neon-blue" />
          </div>
          <h1 className="text-3xl font-bold text-neon-blue-dark">Welcome to Neon Dashboard!</h1>
          <p className="text-muted-foreground">We're happy to have you here</p>
        </div>

        {/* Diagnostic Card */}
        <Card className="border-neon-blue/30 bg-gradient-to-br from-neon-blue/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-blue-dark">
              <Database className="w-5 h-5" />
              Sync Diagnosis
            </CardTitle>
            <CardDescription>Detailed status of your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingDiag ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-neon-blue" />
                <span className="ml-2 text-muted-foreground">Checking...</span>
              </div>
            ) : diagnostic ? (
              <div className="space-y-4">
                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    className={`p-4 rounded-lg border ${diagnostic.status.isFullyLinked ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      {diagnostic.status.isFullyLinked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className="font-medium text-sm">
                        {diagnostic.status.isFullyLinked ? "Linked" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mentee</p>
                  </div>

                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-sm">
                        {diagnostic.clerk.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Access Level</p>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${diagnostic.status.multipleMatches ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      {diagnostic.status.multipleMatches ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Database className="w-5 h-5 text-slate-600" />
                      )}
                      <span className="font-medium text-sm">
                        {diagnostic.status.multipleMatches ? "Duplicates" : "OK"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Records</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-white rounded-lg p-4 border space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{diagnostic.clerk.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span className="text-muted-foreground">
                      {diagnostic.clerk.name || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Database ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {diagnostic.database.userId}
                    </Badge>
                  </div>
                  {diagnostic.mentorado && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Mentee:</span>
                      <span className="text-muted-foreground">
                        {diagnostic.mentorado.nomeCompleto} ({diagnostic.mentorado.turma})
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {diagnostic.recommendations.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-2 text-sm">Recommendations:</h4>
                    <ul className="space-y-1">
                      {diagnostic.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loadingDiag}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  {!diagnostic.status.isFullyLinked && diagnostic.status.hasUnlinkedMatch && (
                    <Button
                      size="sm"
                      onClick={handleSync}
                      disabled={syncing}
                      className="bg-neon-blue hover:bg-neon-blue-dark"
                    >
                      {syncing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Link Now
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Error loading diagnosis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card - Only show if NOT linked */}
        {diagnostic && !diagnostic.status.isFullyLinked && (
          <Card className="border-amber-500/30 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Profile Pending Linking
              </CardTitle>
              <CardDescription className="text-amber-800">
                Your mentee profile has not yet been linked to your login email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-amber-900">Your login email</div>
                    <div className="text-sm text-amber-700 mt-1">
                      {user?.email || "Email not available"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-amber-800 space-y-2">
                <p>
                  To access your personalized dashboard with your metrics and feedback,
                  the administrator needs to link your email to your mentee profile.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Card - Show if linked */}
        {diagnostic?.status.isFullyLinked && (
          <Card className="border-green-500/30 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="w-5 h-5" />
                Profile Linked Successfully!
              </CardTitle>
              <CardDescription className="text-green-800">
                Your profile is ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => (window.location.href = "/meu-dashboard")}
              >
                Go to My Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Next Steps - Only if not linked */}
        {diagnostic && !diagnostic.status.isFullyLinked && (
          <Card className="border-neon-blue/20">
            <CardHeader>
              <CardTitle className="text-neon-blue-dark">Next Steps</CardTitle>
              <CardDescription>What to do now?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-neon-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Contact the administrator</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Let them know you logged in with the email: <strong>{user?.email}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-neon-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Wait for the linking</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      The administrator will link your email to your mentee profile in the system
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-6 h-6 rounded-full bg-neon-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Log in again</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      After linking, log out and log in again to access your dashboard
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What you'll have access to */}
        <Card className="border-neon-gold/30 bg-neon-gold/5">
          <CardHeader>
            <CardTitle className="text-neon-blue-dark flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neon-gold" />What you'll have access to after
              linking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">
                  Personalized dashboard with your metrics
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Monthly progress charts</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Personalized mentor feedback</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">
                  Monthly metrics submission form
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Comparison with proposed goals</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-gold mt-2" />
                <span className="text-muted-foreground">Complete performance history</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-neon-blue/20">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>Need help? Contact the system administrator.</p>
              <Badge variant="outline" className="mt-3">
                Neon - Mentoria Black
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
