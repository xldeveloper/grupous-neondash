import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
