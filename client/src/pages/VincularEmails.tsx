import { AlertCircle, CheckCircle2, Link2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

export default function VincularEmails() {
  const [selectedMentorado, setSelectedMentorado] = useState<string>("");
  const [email, setEmail] = useState("");

  const { data: mentorados, isLoading } = trpc.mentorados.list.useQuery();
  const linkEmailMutation = trpc.mentorados.linkEmail.useMutation({
    onSuccess: () => {
      toast.success("Email linked successfully!");
      setSelectedMentorado("");
      setEmail("");
    },
    onError: (error) => {
      toast.error(`Error linking email: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorado || !email) {
      toast.error("Select a mentee and enter the email");
      return;
    }
    linkEmailMutation.mutate({
      mentoradoId: parseInt(selectedMentorado, 10),
      email,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neon-blue-dark tracking-tight">Link Emails</h1>
          <p className="text-muted-foreground mt-2">
            Associate each mentee's login email to their profile in the system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Link Form */}
          <Card className="border-neon-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-blue-dark">
                <Link2 className="w-5 h-5" />
                New Link
              </CardTitle>
              <CardDescription>
                Select a mentee and enter the email they use to log in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mentorado">Mentee</Label>
                  <Select value={selectedMentorado} onValueChange={setSelectedMentorado}>
                    <SelectTrigger id="mentorado">
                      <SelectValue placeholder="Select a mentee" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentorados?.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.nomeCompleto} - Neon
                          {m.email && ` (${m.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Login Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This must be the email the mentee uses to log in to the system
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-neon-blue-dark hover:bg-neon-blue"
                  disabled={linkEmailMutation.isPending}
                >
                  {linkEmailMutation.isPending ? "Linking..." : "Link Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Mentee List */}
          <Card className="border-neon-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-blue-dark">
                <Mail className="w-5 h-5" />
                Link Status
              </CardTitle>
              <CardDescription>Mentees and their linked emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {mentorados?.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">{m.nomeCompleto}</div>
                      <div className="text-xs text-muted-foreground mt-1">Neon</div>
                      {m.email && (
                        <div className="text-xs text-neon-blue mt-1 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {m.email}
                        </div>
                      )}
                    </div>
                    <div>
                      {m.email ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-neon-gold/30 bg-neon-gold/5">
          <CardHeader>
            <CardTitle className="text-neon-blue-dark">How does it work?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>1.</strong> Select the mentee you want to link
            </p>
            <p>
              <strong>2.</strong> Enter the email they use to log in (Google, Microsoft,
              etc.)
            </p>
            <p>
              <strong>3.</strong> After linking, when the mentee logs in, they will
              automatically see only their own data
            </p>
            <p className="text-xs mt-4 text-amber-700">
              Warning: The email must match exactly the one used for OAuth login
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
