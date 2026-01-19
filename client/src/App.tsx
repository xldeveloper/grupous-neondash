import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MyDashboard from "./pages/MyDashboard";
import Admin from "./pages/Admin";
import SubmitMetrics from "./pages/SubmitMetrics";
import Estrutura from "./pages/Estrutura";
import Escala from "./pages/Escala";
import LandingPage from "./pages/LandingPage";

function Router() {
  return (
    <Switch>
      {/* Public Landing Page */}
      <Route path="/" component={LandingPage} />

      {/* Dashboard Routes (protected by DashboardLayout) */}
      <Route path="/dashboard" component={Home} />
      <Route path="/meu-dashboard" component={MyDashboard} />
      <Route path="/enviar-metricas" component={SubmitMetrics} />
      <Route path="/admin" component={Admin} />
      <Route path="/estrutura" component={Estrutura} />
      <Route path="/escala" component={Escala} />

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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
