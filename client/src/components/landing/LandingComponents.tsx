import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/button";
import {
  heroStagger,
  heroText,
  parallaxFloat,
  scaleReveal,
  scrollReveal,
} from "@/lib/animation-variants";

// === ANIMATED COUNTER COMPONENT ===
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

// === HERO SECTION ===
export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden px-4 pt-24 pb-16">
      {/* Animated Background Elements */}
      <motion.div
        variants={parallaxFloat}
        initial="initial"
        animate="animate"
        className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        variants={parallaxFloat}
        initial="initial"
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.03] pointer-events-none" />

      {/* Content Container */}
      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate="show"
        variants={heroStagger}
      >
        {/* Elite Badge */}
        <motion.div variants={heroText} className="mb-8">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              Mentoria Black • Grupo de Elite
            </span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={heroText}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8"
        >
          <span className="block text-foreground">Transforme sua</span>
          <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            clínica em referência
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={heroText}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Metodologia exclusiva de <span className="font-semibold text-foreground">6 meses</span>{" "}
          para escalar sua clínica com previsibilidade, gestão inteligente e{" "}
          <span className="font-semibold text-primary">lucro real</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={heroText}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <SignInButton />
          </motion.div>

          <Button
            variant="ghost"
            size="lg"
            className="text-muted-foreground hover:text-foreground group"
          >
            Conhecer Metodologia
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Stats Strip */}
        <motion.div variants={heroText} className="flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { value: 500, suffix: "+", label: "Clínicas" },
            { value: 6, suffix: " meses", label: "Jornada" },
            { value: 2, suffix: "M+", label: "Em faturamento" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// === BENEFITS SECTION ===
export function BenefitsSection() {
  const benefits = [
    {
      title: "Calls Individuais",
      desc: "Acompanhamento estratégico personalizado para o seu momento de negócio. Direcionamento assertivo.",
      icon: Users,
      accent: "bg-primary/10 text-primary",
    },
    {
      title: "Gestão 360º",
      desc: "Administrativo, Financeiro, Marketing e Vendas integrados em uma metodologia única.",
      icon: BarChart3,
      accent: "bg-chart-2/10 text-chart-2",
    },
    {
      title: "Ferramentas Validadas",
      desc: "Templates, planilhas e scripts que funcionam. Aplique imediatamente no seu negócio.",
      icon: Target,
      accent: "bg-chart-5/10 text-chart-5",
    },
    {
      title: "Comunidade Elite",
      desc: "Networking com profissionais que pensam grande. Conexões que geram oportunidades.",
      icon: Award,
      accent: "bg-primary/10 text-primary",
    },
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.03),transparent_50%)]" />

      <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={scrollReveal}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4 block">
            Por que a Neon?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">O que você recebe</h2>
          <p className="text-muted-foreground text-lg">
            Uma experiência completa para transformar sua clínica e sua mentalidade empreendedora.
          </p>
        </motion.div>

        {/* Benefits Grid - Asymmetric */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={scaleReveal}
              transition={{ delay: idx * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                className="h-full p-8 rounded-2xl bg-card border border-border/50 transition-all duration-300 cursor-default"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${benefit.accent} flex items-center justify-center mb-6`}
                >
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// === METHODOLOGY SECTION ===
export function MethodologySection() {
  const steps = [
    {
      number: "01",
      title: "Consumo",
      desc: "Assista às aulas na plataforma de membros. Conteúdo direto ao ponto.",
      icon: BookOpen,
    },
    {
      number: "02",
      title: "Execução",
      desc: "Aplique as ferramentas aqui no Portal NEON. Ação gera resultado.",
      icon: Zap,
    },
    {
      number: "03",
      title: "Análise",
      desc: "Monitore seus dados no Dashboard. Números não mentem.",
      icon: TrendingUp,
    },
    {
      number: "04",
      title: "Mentoria",
      desc: "Tire dúvidas nos encontros ao vivo. Ajuste a rota com suporte real.",
      icon: Sparkles,
    },
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section className="py-24 md:py-32 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={scrollReveal}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4 block">
            A Metodologia
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Protocolo da <span className="text-primary">Elite</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            O segredo não é a velocidade, é a direção. Siga o método.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={scaleReveal}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center"
              >
                {/* Step Number Circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative mx-auto w-[120px] h-[120px] rounded-full bg-muted border-4 border-card shadow-lg flex flex-col items-center justify-center mb-6 z-10"
                >
                  <span className="text-3xl font-bold text-primary">{step.number}</span>
                  <step.icon className="w-5 h-5 text-muted-foreground mt-1" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// === SOCIAL PROOF SECTION ===
export function SocialProofSection() {
  const testimonials = [
    {
      quote: "Em 4 meses, aumentei meu faturamento em 47%. A metodologia é clara e funciona.",
      name: "Dra. Ana Carolina",
      role: "Dermatologista",
      avatar: "AC",
    },
    {
      quote:
        "Saí do caos financeiro para ter previsibilidade. Hoje sei exatamente para onde minha clínica vai.",
      name: "Dr. Rafael Mendes",
      role: "Clínica de Estética",
      avatar: "RM",
    },
    {
      quote: "O suporte individualizado faz toda diferença. Sinto que tenho um sócio estratégico.",
      name: "Dra. Juliana Santos",
      role: "Harmonização Facial",
      avatar: "JS",
    },
  ];

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={scrollReveal}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary tracking-widest uppercase mb-4 block">
            Resultados Reais
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Quem já passou pela Neon
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={scaleReveal}
              transition={{ delay: idx * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full p-8 rounded-2xl bg-card border border-border/50 transition-all duration-300"
              >
                {/* Quote */}
                <p className="text-foreground leading-relaxed mb-6 italic">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={scrollReveal}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border/50">
            <CheckCircle2 className="w-5 h-5 text-chart-2" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">98%</span> de satisfação entre os
              mentorados
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// === FOOTER ===
export function SimpleFooter() {
  return (
    <footer className="py-16 bg-card border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">N</span>
            </div>
            <div>
              <span className="font-bold text-foreground block leading-none">NEON</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Mentoria Black
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-primary/20" />

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 Neon Mentoria Black. Grupo US. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
