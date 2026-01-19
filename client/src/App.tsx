import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MyDashboard from "./pages/MyDashboard";
import Admin from "./pages/Admin";
import SubmitMetrics from "./pages/SubmitMetrics";
import Estrutura from "./pages/Estrutura";
import Escala from "./pages/Escala";
import LandingPage from "./pages/LandingPage";

// Wrapper for protected routes
const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <>
    <SignedIn>
      <Component />
    </SignedIn>
    <SignedOut>
      <Redirect to="/" />
    </SignedOut>
  </>
);

function Router() {
  return (
    <Switch>
      {/* Public Landing Page */}
      <Route path="/" component={LandingPage} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/meu-dashboard">
        <ProtectedRoute component={MyDashboard} />
      </Route>
      <Route path="/enviar-metricas">
        <ProtectedRoute component={SubmitMetrics} />
      </Route>
      <Route path="/admin">
         {/* Admin might need extra role checks later */}
        <ProtectedRoute component={Admin} />
      </Route>
      <Route path="/estrutura">
        <ProtectedRoute component={Estrutura} />
      </Route>
      <Route path="/escala">
        <ProtectedRoute component={Escala} />
      </Route>

      {/* 404 Pages */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          {/* Global Toaster */}
          <Toaster />

          {/* Main Router */}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
