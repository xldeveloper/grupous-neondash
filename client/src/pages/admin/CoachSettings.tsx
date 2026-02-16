import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export default function CoachSettings() {
  const [prompt, setPrompt] = useState("");
  const utils = trpc.useUtils();

  const { data: currentPrompt, isLoading } = trpc.admin.getSetting.useQuery({
    key: "neon_coach_prompt",
  });

  const { mutate: saveSetting, isPending: isSaving } = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      toast.success("Prompt updated successfully!", {
        description: "The Neon Coach will use these new instructions on the next generation.",
      });
      utils.admin.getSetting.invalidate({ key: "neon_coach_prompt" });
    },
    onError: () => {
      toast.error("Error saving prompt.");
    },
  });

  useEffect(() => {
    if (currentPrompt) {
      setPrompt(currentPrompt.value);
    }
  }, [currentPrompt]);

  const handleSave = () => {
    saveSetting({
      key: "neon_coach_prompt",
      value: prompt,
      description: "Neon Coach master prompt (Business Intelligence)",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-gold" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Neon Coach Settings
        </h1>
        <p className="text-gray-400">
          Manage the intelligence and behavior of the AI assistant.
        </p>
      </div>

      <Card className="border-neon-gold/20 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🧠 Master Prompt</CardTitle>
          <CardDescription>
            These instructions define the Coach's personality, rules, and response format.
            Changes here affect all new task generations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[400px] font-mono text-sm leading-relaxed bg-black/60 border-white/10"
            placeholder="Enter the system prompt here..."
          />

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                if (currentPrompt?.value) setPrompt(currentPrompt.value);
              }}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-neon-gold text-black hover:bg-neon-gold/80"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-900/20 p-4 border border-blue-500/30">
        <h4 className="font-semibold text-blue-400 mb-2">Prompt Engineering Tip</h4>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>
            Clearly define the <strong>Persona</strong> (e.g., "You are a specialist in...")
          </li>
          <li>
            Specify the <strong>Output Format</strong> JSON explicitly.
          </li>
          <li>Use examples ("Few-Shot Prompting") to guide the model.</li>
          <li>Keep the rules numbered for the model to follow step-by-step.</li>
        </ul>
      </div>
    </div>
  );
}
