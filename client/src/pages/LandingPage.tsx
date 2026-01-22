import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, Users, Shield, Star, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { SignInButton as ClerkSignInButton } from "@clerk/clerk-react";
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/ui/neon-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const [, setLocation] = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check if user is a mentorado - only if authenticated
  const { data: mentorado, isLoading: loadingMentorado } =
    trpc.mentorados.me.useQuery(undefined, {
      enabled: isAuthenticated && hasCheckedAuth,
      retry: false,
      refetchOnWindowFocus: false,
    });

  // Wait for initial auth check to complete before deciding to redirect
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setHasCheckedAuth(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (!hasCheckedAuth) return;
    if (loading) return;
    if (!isAuthenticated) return;
    if (loadingMentorado) return;

    if (mentorado) {
      setLocation("/meu-dashboard");
    } else if (user?.role === "admin") {
      setLocation("/dashboard");
    } else {
      setLocation("/primeiro-acesso");
    }
  }, [
    hasCheckedAuth,
    isAuthenticated,
    loading,
    loadingMentorado,
    mentorado,
    user,
    setLocation,
  ]);

  if (loading || !hasCheckedAuth || (isAuthenticated && loadingMentorado) || isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-pulse text-neon-blue-medium font-medium tracking-wide">
          Carregando Neon...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden font-sans text-foreground selection:bg-neon-gold/30 scroll-smooth">
      {/* Ambient Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-neon-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full py-4 px-6 md:px-12 flex justify-between items-center z-50 bg-paper/80 backdrop-blur-md border-b border-neon-border/50">
        <div className="flex items-center gap-3">
          <img
            src="/brand/neon-symbol-official.png"
            alt="Neon"
            className="w-8 h-8 object-contain"
          />
          <div>
            <span className="font-bold text-xl tracking-tight text-neon-blue-dark block leading-none">
              NEON
            </span>
            <span className="text-[9px] text-neon-blue-medium uppercase tracking-[0.25em] font-mono font-medium">
              Mentoria Black
            </span>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground items-center">
          <a href="#resources" className="hover:text-neon-blue-dark transition-colors">
            Recursos
          </a>
          <a href="#testimonials" className="hover:text-neon-blue-dark transition-colors">
            Depoimentos
          </a>
          <ClerkSignInButton mode="modal">
            <Button variant="ghost" className="text-neon-blue-dark hover:bg-neon-blue/5 hover:text-neon-blue">
              Login
            </Button>
          </ClerkSignInButton>
          <ClerkSignInButton mode="modal">
            <Button size="sm" className="bg-neon-blue-dark hover:bg-neon-blue text-white shadow-md hover:shadow-lg transition-all">
              Começar Agora
            </Button>
          </ClerkSignInButton>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative z-10 flex flex-col items-center text-center">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neon-gold/30 shadow-sm mb-4 hover:border-neon-gold/60 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-neon-gold animate-pulse shadow-[0_0_8px_rgba(172,148,105,0.5)]" />
            <span className="text-xs font-bold text-neon-blue-medium tracking-wide uppercase">
              Dashboard de Alta Performance v2.0
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neon-blue-dark leading-[1.1]">
            Domine os Números da Sua <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue-dark via-neon-blue to-neon-gold pb-2">
              Clínica de Estética
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tenha clareza total sobre faturamento, lucro e conversão. A ferramenta definitiva para mentorados que buscam escala e previsibilidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <ClerkSignInButton mode="modal">
              <Button
                size="lg"
                className="h-14 px-8 text-base bg-neon-blue-dark hover:bg-neon-blue text-white shadow-xl hover:shadow-neon-blue/20 hover:-translate-y-0.5 transition-all duration-300 group rounded-full"
              >
                Acessar Meu Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </ClerkSignInButton>
          </div>

          {/* Floating UI Elements as decoration */}
          <div className="hidden md:block absolute top-[20%] left-[5%] animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
             <NeonCard variant="glass" className="w-48 p-4 rotate-[-6deg]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-bold text-neon-blue-dark">+28% Crescimento</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full w-[70%] bg-neon-green rounded-full" />
                </div>
             </NeonCard>
          </div>

           <div className="hidden md:block absolute bottom-[10%] right-[5%] animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
             <NeonCard variant="glass" className="w-56 p-4 rotate-[6deg]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-gold/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-neon-gold fill-neon-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Meta Atingida</p>
                    <p className="text-sm font-bold text-neon-blue-dark">R$ 150.000,00</p>
                  </div>
                </div>
             </NeonCard>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="resources" className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-neon-blue-dark mb-4">
              Tudo que você precisa para escalar
            </h2>
            <p className="text-muted-foreground">
              Monitoramento em tempo real, relatórios detalhados e feedbacks diretos do seu mentor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <NeonCard variant="default" className="group">
              <NeonCardHeader>
                <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-4 group-hover:bg-neon-blue/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-neon-blue" />
                </div>
                <NeonCardTitle>Métricas Detalhadas</NeonCardTitle>
              </NeonCardHeader>
              <NeonCardContent>
                <p className="text-muted-foreground">
                  Acompanhe Faturamento, Lucro Líquido, Ticket Médio e Custo por Lead com gráficos intuitivos.
                </p>
              </NeonCardContent>
            </NeonCard>

            <NeonCard variant="default" className="group">
              <NeonCardHeader>
                 <div className="w-12 h-12 rounded-xl bg-neon-gold/10 flex items-center justify-center mb-4 group-hover:bg-neon-gold/20 transition-colors">
                  <Users className="w-6 h-6 text-neon-gold" />
                </div>
                <NeonCardTitle>Gestão de Leads</NeonCardTitle>
              </NeonCardHeader>
              <NeonCardContent>
                <p className="text-muted-foreground">
                  Visualize seu funil de vendas, taxas de conversão e origem dos seus melhores pacientes.
                </p>
              </NeonCardContent>
            </NeonCard>

             <NeonCard variant="default" className="group">
              <NeonCardHeader>
                 <div className="w-12 h-12 rounded-xl bg-neon-blue-dark/5 flex items-center justify-center mb-4 group-hover:bg-neon-blue-dark/10 transition-colors">
                  <Shield className="w-6 h-6 text-neon-blue-dark" />
                </div>
                <NeonCardTitle>Feedback Privado</NeonCardTitle>
              </NeonCardHeader>
              <NeonCardContent>
                <p className="text-muted-foreground">
                  Receba análises mensais e direcionamentos estratégicos diretamente do seu mentor na plataforma.
                </p>
              </NeonCardContent>
            </NeonCard>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section id="testimonials" className="py-20 bg-neon-gray/50">
        <div className="container mx-auto px-4">
           <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-neon-blue-dark mb-4">
              O que dizem nossos mentorados
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "Consegui dobrar meu faturamento em 3 meses apenas ajustando as métricas que o dashboard me mostrou.",
                author: "Dra. Ana Silva",
                role: "Harmonização Facial"
              },
               {
                quote: "A clareza que tenho hoje sobre meu lucro real mudou completamente minha gestão financeira.",
                author: "Dr. Carlos Eduardo",
                role: "Implante Capilar"
              },
               {
                quote: "O feedback mensal direto na plataforma é o game changer. Sei exatamente onde focar.",
                author: "Dra. Marina Costa",
                role: "Dermatologista"
              }
            ].map((t, i) => (
              <NeonCard key={i} variant="glass" className="border-none bg-white">
                <NeonCardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-neon-gold fill-neon-gold" />)}
                  </div>
                  <p className="text-slate-600 mb-6 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-bold text-neon-blue-dark">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </NeonCardContent>
              </NeonCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-neon-border text-center text-sm text-muted-foreground z-10">
        <div className="container mx-auto px-4 flex flex-col items-center">
           <div className="w-12 h-12 bg-neon-blue-dark rounded-full flex items-center justify-center mb-6">
              <span className="text-neon-gold font-bold text-xl">N</span>
           </div>
           <p className="mb-4">© 2026 Neon - Mentoria Black. Todos os direitos reservados.</p>
           <p className="max-w-md mx-auto text-xs text-slate-400">
             Plataforma exclusiva para membros da Mentoria Black. O acesso é restrito e monitorado. Grupo US.
           </p>
        </div>
      </footer>
    </div>
  );
}
