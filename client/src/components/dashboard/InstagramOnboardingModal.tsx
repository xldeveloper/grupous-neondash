import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Instagram, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInstagramOnboarding } from "@/hooks/useInstagramOnboarding";

interface InstagramOnboardingModalProps {
  mentoradoId: number | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    title: "Connect your Instagram",
    description:
      "Connect your Instagram account to automatically sync your posts and stories with the dashboard.",
    benefits: [
      "Automatic post and story metrics",
      "Comparison with previous months",
      "Time savings on data entry",
    ],
  },
  {
    title: "Requirements",
    description: "To connect Instagram, your account must meet the following requirements:",
    requirements: [
      "Business or Creator account (not personal)",
      "Connected to a Facebook page",
      "Admin access to the page",
    ],
  },
  {
    title: "Authorize Access",
    description: "Click the button below to authorize NEON Portal to access your metrics.",
  },
];

export function InstagramOnboardingModal({
  mentoradoId,
  isOpen,
  onOpenChange,
}: InstagramOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { startOAuth, isConnecting, error } = useInstagramOnboarding({ mentoradoId });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleConnect = () => {
    startOAuth();
  };

  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            {step.title}
          </DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {/* Step 0: Benefits */}
            {currentStep === 0 && step.benefits && (
              <ul className="space-y-3">
                {step.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            {/* Step 1: Requirements */}
            {currentStep === 1 && step.requirements && (
              <ul className="space-y-3">
                {step.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    {req}
                  </li>
                ))}
              </ul>
            )}

            {/* Step 2: Connect */}
            {currentStep === 2 && (
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !mentoradoId}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Instagram className="mr-2 h-4 w-4" />
                      Connect Instagram
                    </>
                  )}
                </Button>

                {error && <p className="text-sm text-destructive text-center">{error.message}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>

          {currentStep < steps.length - 1 ? <Button onClick={handleNext}>Next</Button> : null}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1 pt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i === currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
