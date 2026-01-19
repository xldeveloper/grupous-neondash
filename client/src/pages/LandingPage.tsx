
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();

  // If fully loaded and signed in, redirect to dashboard
  if (isLoaded && isSignedIn) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden font-sans text-foreground selection:bg-neon-gold/30">

       {/* Ambient Background Elements */}
       <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-gold/5 rounded-full blur-3xl pointer-events-none" />
       <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neon-blue-dark rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-neon-gold" />
            </div>
            <span className="font-bold text-xl tracking-tight text-neon-blue-dark">NEON<span className="text-neon-gold">DASH</span></span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-neon-blue-dark transition-colors">Features</a>
            <a href="#" className="hover:text-neon-blue-dark transition-colors">Testimonials</a>
            <a href="#" className="hover:text-neon-blue-dark transition-colors">Pricing</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">

        <SignedIn>
            {/* Fallback if redirect is slow */}
            <Redirect to="/dashboard" />
        </SignedIn>

        <SignedOut>
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neon-gold/30 shadow-sm mb-4">
                    <span className="w-2 h-2 rounded-full bg-neon-gold animate-pulse" />
                    <span className="text-xs font-semibold text-neon-blue-medium tracking-wide uppercase">New Premium Dashboard</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neon-blue-dark leading-[1.1]">
                    Elevate Your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue-dark via-neon-blue to-neon-gold">Mentorship</span> Performance
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Access high-fidelity analytics, track revenue streams, and optimize your mentoring structure with the new standard in AI-driven dashboards.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <SignInButton mode="modal">
                        <Button size="lg" className="h-14 px-8 text-base bg-neon-blue-dark hover:bg-neon-blue text-white shadow-lg hover:shadow-neon-blue/20 transition-all duration-300 group">
                            Login to Dashboard
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </SignInButton>

                    <Button variant="outline" size="lg" className="h-14 px-8 text-base border-neon-blue/20 hover:bg-neon-blue/5 text-neon-blue-dark">
                        Request Access
                    </Button>
                </div>
            </div>
        </SignedOut>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground z-10">
        <p>© 2026 Neon Dash. Powered by AI Intelligence.</p>
      </footer>
    </div>
  );
}
