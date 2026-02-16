/**
 * AI Agent Settings Card Component
 * Configure AI SDR automations for WhatsApp responses
 */

import { motion } from "framer-motion";
import {
  Bot,
  Clock,
  Loader2,
  MessageSquare,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const DAYS_OF_WEEK = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

const DEFAULT_SYSTEM_PROMPT = `You are a professional customer service assistant for an aesthetics clinic.
Your goal is to qualify leads in a friendly and professional manner.

Guidelines:
- Be polite and empathetic
- Respond concisely and naturally
- Ask questions to understand the client's needs
- Collect information: name, procedure of interest, availability
- If the client shows interest, suggest scheduling a consultation
- Do not make promises about prices or results
- If you cannot answer something, say that a specialist will get in touch`;

const DEFAULT_GREETING = `Hello! How are you? I saw that you reached out to us.
How can I help you today?`;

type AIAgentSettingsCardProps = Record<string, never>;

export function AIAgentSettingsCard(_props: AIAgentSettingsCardProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [greetingMessage, setGreetingMessage] = useState(DEFAULT_GREETING);
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("18:00");
  const [workingDays, setWorkingDays] = useState<string[]>(["1", "2", "3", "4", "5"]);
  const [responseDelayMs, setResponseDelayMs] = useState(3000);

  // Get current config
  const { data: config, isLoading } = trpc.aiAgent.getConfig.useQuery();

  // Mutations
  const updateMutation = trpc.aiAgent.upsertConfig.useMutation({
    onSuccess: () => setIsDirty(false),
  });

  const toggleMutation = trpc.aiAgent.toggleEnabled.useMutation();

  const resetMutation = trpc.aiAgent.resetToDefaults.useMutation({
    onSuccess: () => {
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
      setGreetingMessage(DEFAULT_GREETING);
      setWorkingHoursStart("09:00");
      setWorkingHoursEnd("18:00");
      setWorkingDays(["1", "2", "3", "4", "5"]);
      setResponseDelayMs(3000);
      setIsDirty(true);
    },
  });

  // Populate form from config
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled === "sim");
      setSystemPrompt(config.systemPrompt || DEFAULT_SYSTEM_PROMPT);
      setGreetingMessage(config.greetingMessage || DEFAULT_GREETING);
      setWorkingHoursStart(config.workingHoursStart || "09:00");
      setWorkingHoursEnd(config.workingHoursEnd || "18:00");
      setWorkingDays((config.workingDays || "1,2,3,4,5").split(","));
      setResponseDelayMs(config.responseDelayMs || 3000);
    }
  }, [config]);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    toggleMutation.mutate();
  };

  const handleDayToggle = (day: string) => {
    setIsDirty(true);
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      enabled: enabled ? "sim" : "nao",
      systemPrompt,
      greetingMessage,
      workingHoursStart,
      workingHoursEnd,
      workingDays: workingDays.join(","),
      responseDelayMs,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-lg bg-teal-500/10 text-teal-600"
              animate={
                enabled
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(20, 184, 166, 0.4)",
                        "0 0 0 10px rgba(20, 184, 166, 0)",
                      ],
                    }
                  : {}
              }
              transition={enabled ? { duration: 1.5, repeat: Infinity } : {}}
            >
              <Bot className="w-5 h-5" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">AI Agent</CardTitle>
              <CardDescription>Automatic qualification responses</CardDescription>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={toggleMutation.isPending}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status indicator */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            enabled
              ? "bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900"
              : "bg-muted"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${enabled ? "text-teal-600" : "text-muted-foreground"}`} />
          <span
            className={`text-sm ${enabled ? "text-teal-700 dark:text-teal-400" : "text-muted-foreground"}`}
          >
            {enabled
              ? "Agent active and responding automatically"
              : "Agent disabled - messages will not be answered"}
          </span>
        </div>

        {/* Greeting Message */}
        <div className="space-y-2">
          <Label htmlFor="greeting" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Greeting Message
          </Label>
          <Textarea
            id="greeting"
            value={greetingMessage}
            onChange={(e) => {
              setGreetingMessage(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Message sent automatically on first contact..."
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            Sent automatically when a new contact sends the first message
          </p>
        </div>

        {/* Working Hours */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Working Hours
          </Label>

          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={workingDays.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <Label htmlFor={`day-${day.value}`} className="text-sm cursor-pointer">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="start-time" className="text-sm whitespace-nowrap">
                From
              </Label>
              <Input
                id="start-time"
                type="time"
                value={workingHoursStart}
                onChange={(e) => {
                  setWorkingHoursStart(e.target.value);
                  setIsDirty(true);
                }}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="end-time" className="text-sm whitespace-nowrap">
                to
              </Label>
              <Input
                id="end-time"
                type="time"
                value={workingHoursEnd}
                onChange={(e) => {
                  setWorkingHoursEnd(e.target.value);
                  setIsDirty(true);
                }}
                className="w-28"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Advanced Settings */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Advanced Settings
              </span>
              <motion.span
                animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* System Prompt */}
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => {
                  setSystemPrompt(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Instructions for agent behavior..."
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Defines the AI agent's personality and guidelines
              </p>
            </div>

            {/* Response Delay */}
            <div className="space-y-2">
              <Label htmlFor="delay">Response Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={responseDelayMs}
                onChange={(e) => {
                  setResponseDelayMs(Number(e.target.value));
                  setIsDirty(true);
                }}
                min={1000}
                max={10000}
                step={500}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Wait time before sending automatic response (1000-10000ms)
              </p>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Defaults
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!isDirty || updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}

export default AIAgentSettingsCard;
