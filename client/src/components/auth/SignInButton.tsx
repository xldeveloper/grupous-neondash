import { SignInButton as ClerkSignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <Button size="lg">Entrar</Button>
    </ClerkSignInButton>
  );
}
