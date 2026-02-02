import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * SignInButton - Custom sign-in button without Clerk
 *
 * Redirects to the OAuth login page or shows login modal.
 */
export function SignInButton() {
  const handleSignIn = () => {
    // Redirect to OAuth login endpoint
    window.location.href = "/api/auth/login";
  };

  return (
    <Button size="lg" onClick={handleSignIn}>
      <LogIn className="mr-2 h-4 w-4" />
      Entrar
    </Button>
  );
}
