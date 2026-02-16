import { Award, BookOpen, CheckCircle2, Clock, Coffee, PlayCircle, Users } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { SignInButton } from "@/components/auth/SignInButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * LoginSection - Auth-aware button that shows sign-in or dashboard link
 */
function LoginSection() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Link href="/dashboard">
        <Button
          size="lg"
          className="bg-neon-gold hover:bg-neon-gold/90 text-neon-blue-dark font-bold px-8"
        >
          Student Area (Dashboard)
        </Button>
      </Link>
    );
  }

  return <SignInButton />;
}

export function MentorshipContent() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero / Intro Title for this page */}
      <section className="pt-12 md:pt-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-neon-blue-dark mb-6">
          Mentorship in Practice
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your official guide to navigating Black Mentorship and getting maximum results.
        </p>
      </section>

      {/* PHASE 5: Onboarding Guide - Primeiros Passos */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-neon-blue-dark mb-8 text-center">
          First Steps in the System
        </h2>
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-neon-blue/10">
          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-100 hidden md:block -z-10" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center bg-white">
              <div className="w-16 h-16 rounded-full bg-neon-blue text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Portal Login</h3>
              <p className="text-sm text-muted-foreground">
                Click "Sign In" below. Use the email registered at purchase.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center bg-white">
              <div className="w-16 h-16 rounded-full bg-neon-blue text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Profile & Data</h3>
              <p className="text-sm text-muted-foreground">
                Access your dashboard and verify that your information is correct.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center bg-white">
              <div className="w-16 h-16 rounded-full bg-neon-gold text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md animate-pulse">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Submit Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Go to "Submit Metrics" and fill in your current business data.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <LoginSection />
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-neon-blue-dark mb-12 text-center">
          How Does the Mentorship Work?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-neon-blue/20 hover:border-neon-blue/50 transition-colors">
            <CardHeader>
              <PlayCircle className="w-10 h-10 text-neon-blue mb-2" />
              <CardTitle>Recorded Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access the core content in the members area. Watch at your own pace, but stay
                consistent.
              </p>
            </CardContent>
          </Card>
          <Card className="border-neon-blue/20 hover:border-neon-blue/50 transition-colors">
            <CardHeader>
              <BookOpen className="w-10 h-10 text-neon-blue mb-2" />
              <CardTitle>Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Spreadsheets, templates and validated scripts available for download and immediate
                application.
              </p>
            </CardContent>
          </Card>
          <Card className="border-neon-blue/20 hover:border-neon-blue/50 transition-colors">
            <CardHeader>
              <Users className="w-10 h-10 text-neon-blue mb-2" />
              <CardTitle>Live Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ask questions, network and receive strategic guidance in weekly calls.
              </p>
            </CardContent>
          </Card>
          <Card className="border-neon-blue/20 hover:border-neon-blue/50 transition-colors">
            <CardHeader>
              <Award className="w-10 h-10 text-neon-blue mb-2" />
              <CardTitle>Digital Notebook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use this system to record your progress, insights and tasks. Your evolution
                documented.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What I Expect From You */}
      <section className="bg-neon-gray/10 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-neon-blue-dark mb-12 text-center">
            What I Expect from You
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4 text-neon-gold">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-3">Radical Execution</h3>
              <p className="text-muted-foreground">
                Knowledge only has power when applied. Do not accumulate theory. Execute.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4 text-neon-gold">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-3">Do Not Binge</h3>
              <p className="text-muted-foreground">
                Respect the process. Implement one lesson before moving to the next.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4 text-neon-gold">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-3">Consistency</h3>
              <p className="text-muted-foreground">
                Results come from daily and consistent work. Show up every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apresente-se & Gerencie */}
      <section className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-neon-blue-dark mb-4">Manage Your Time</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Use this portal as your central HUB. Organize your schedule, set time blocks for
            study and execution. Organization precedes growth.
          </p>
          <Button variant="outline" className="border-neon-blue text-neon-blue">
            View Productivity Tips
          </Button>
        </div>
        <div className="bg-neon-blue-dark text-white p-10 rounded-3xl text-center">
          <h3 className="text-2xl font-bold mb-4">Introduce Yourself</h3>
          <p className="mb-8 text-neon-blue-light/80">
            We want to know you and your business in depth. Fill out your complete profile so we
            can personalize your experience.
          </p>
          <Button className="bg-neon-gold hover:bg-neon-gold/90 text-neon-blue-dark font-bold w-full py-6 text-lg">
            Fill Profile Now
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-neon-blue-dark mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is this Portal for?</AccordionTrigger>
            <AccordionContent>
              It is your command center. Here you find tools, record metrics, track
              your progress and access support materials complementary to the lessons.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How to use this system?</AccordionTrigger>
            <AccordionContent>
              Access it daily. Keep your metrics updated in the Dashboard tab. Use the
              Digital Notebook for your lesson notes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Where are the recorded lessons?</AccordionTrigger>
            <AccordionContent>
              The lessons are hosted in our official members area. This portal focuses on
              MANAGEMENT and EXECUTION of learning.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Team */}
      <section className="bg-white py-16 border-t border-neon-border/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-neon-blue-dark mb-12 text-center">
            Meet the Team
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sacha - Placeholder */}
            <div className="text-center group">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-transparent group-hover:border-neon-gold transition-all">
                {/* Img placeholder */}
                <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-2xl">
                  S
                </div>
              </div>
              <h3 className="font-bold text-lg">Sacha Gualberto</h3>
              <p className="text-sm text-neon-blue-medium">Lead Mentor</p>
            </div>
            {/* Mauricio - Placeholder */}
            <div className="text-center group">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-transparent group-hover:border-neon-gold transition-all">
                <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-2xl">
                  M
                </div>
              </div>
              <h3 className="font-bold text-lg">Maurício Magalhães</h3>
              <p className="text-sm text-neon-blue-medium">Finance & Tech</p>
            </div>
            {/* Support - Placeholder */}
            <div className="text-center group">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-transparent group-hover:border-neon-gold transition-all">
                <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold text-2xl">
                  S
                </div>
              </div>
              <h3 className="font-bold text-lg">Neon Support</h3>
              <p className="text-sm text-neon-blue-medium">Customer Success</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
