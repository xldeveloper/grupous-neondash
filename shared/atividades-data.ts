/**
 * Static data for PLAY NEON activities
 * Restructured into 6 Phases based on pain-point research for aesthetics professionals
 */

export interface AtividadeStep {
  codigo: string;
  label: string;
  descricao?: string;
}

export interface Atividade {
  codigo: string;
  titulo: string;
  etapa: string;
  icone: string;
  descricao?: string;
  steps: AtividadeStep[];
}

export interface Fase {
  id: number;
  title: string;
  description: string;
  etapaKey: string;
  icon: string;
}

export const FASES: Fase[] = [
  {
    id: 1,
    title: "Phase 1: Foundations",
    etapaKey: "Phase 1: Foundations",
    description: "Build the foundations of your business, from legal compliance to finances.",
    icon: "🏠",
  },
  {
    id: 2,
    title: "Phase 2: Positioning",
    etapaKey: "Phase 2: Positioning",
    description: "Define your identity, niche, and how you present yourself to the market.",
    icon: "🎯",
  },
  {
    id: 3,
    title: "Phase 3: Marketing",
    etapaKey: "Phase 3: Marketing",
    description: "Attract ideal clients with content and paid traffic strategies.",
    icon: "🚀",
  },
  {
    id: 4,
    title: "Phase 4: Sales",
    etapaKey: "Phase 4: Sales",
    description: "Convert leads into loyal patients with efficient sales processes.",
    icon: "💰",
  },
  {
    id: 5,
    title: "Phase 5: Management",
    etapaKey: "Phase 5: Management",
    description: "Organize processes and team to scale your business sustainably.",
    icon: "📊",
  },
  {
    id: 6,
    title: "Phase 6: Mindset",
    etapaKey: "Phase 6: Mindset",
    description: "Develop the mindset and routines of a successful business owner.",
    icon: "🧠",
  },
];

export const ATIVIDADES: Atividade[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: FOUNDATIONS (Weeks 1-4)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "f1-boas-vindas",
    titulo: "Welcome to the NEON Journey",
    etapa: "Phase 1: Foundations",
    icone: "👋",
    descricao: "Your first step in the NEON methodology.",
    steps: [
      {
        codigo: "f1-bv-1",
        label: "Watch the welcome video",
        descricao:
          "Access the members area and watch Dr. Sacha's introductory video explaining the NEON methodology.",
      },
      {
        codigo: "f1-bv-2",
        label: "Read the platform navigation guide",
        descricao:
          "Familiarize yourself with all dashboard areas: activities, metrics, calendar, and community.",
      },
      {
        codigo: "f1-bv-3",
        label: "Set up a professional profile photo",
        descricao:
          "Use a photo with a neutral background, good lighting, and professional attire. Avoid selfies or casual photos.",
      },
      {
        codigo: "f1-bv-4",
        label: "Fill in profile information",
        descricao:
          "Complete: full name, specialty, city/state, years of experience, and revenue goal.",
      },
      {
        codigo: "f1-bv-5",
        label: "Meet the community and mentors",
        descricao:
          "Join the NEON WhatsApp group and introduce yourself: name, specialty, city, and what you expect from the mentorship.",
      },
    ],
  },
  {
    codigo: "f1-diagnostico",
    titulo: "360° Diagnostic & SMART Goals",
    etapa: "Phase 1: Foundations",
    icone: "📊",
    descricao: "Understand your current situation and set clear goals for the next 6 months.",
    steps: [
      {
        codigo: "f1-diag-1",
        label: "Map revenue from the last 3 months",
        descricao:
          "Add up all income (procedures, products sold). Use bank statements if necessary.",
      },
      {
        codigo: "f1-diag-2",
        label: "Identify fixed and variable expenses",
        descricao:
          "Fixed: rent, internet, accountant. Variable: supplies, commissions. List everything with amounts.",
      },
      {
        codigo: "f1-diag-3",
        label: "Calculate current profit margin",
        descricao:
          "Formula: (Revenue - Costs) / Revenue × 100. Healthy target: above 30%.",
      },
      {
        codigo: "f1-diag-4",
        label: "Set desired revenue in 6 months",
        descricao: "Be realistic: a 30-50% increase is aggressive but achievable. Use the SMART method.",
      },
      {
        codigo: "f1-diag-5",
        label: "List your 3 biggest current obstacles",
        descricao:
          "E.g.: lack of leads, low conversion, wrong pricing. Prioritize by revenue impact.",
      },
      {
        codigo: "f1-diag-6",
        label: "Set a monthly lead goal",
        descricao:
          "Calculate: how many leads do you need to reach your revenue target? If conversion is 20%, for 10 clients you need 50 leads.",
      },
      {
        codigo: "f1-diag-7",
        label: "Create a goals timeline",
        descricao:
          "Distribute the 6-month goal into monthly milestones. Months 1-2: structure. Months 3-4: acquisition. Months 5-6: scaling.",
      },
    ],
  },
  {
    codigo: "f1-legalizacao",
    titulo: "Full Business Legal Compliance",
    etapa: "Phase 1: Foundations",
    icone: "⚖️",
    descricao: "Regularize your professional practice with all required documentation.",
    steps: [
      {
        codigo: "f1-leg-1",
        label: "Define the correct CNAE code",
        descricao:
          "For aesthetics: 9602-5/02 (Aesthetics Activities). For medical clinic: 8650-0/12. Confirm with your accountant.",
      },
      {
        codigo: "f1-leg-2",
        label: "Hire a specialized accountant",
        descricao:
          "Look for an accountant experienced with clinics/offices. Ask for referrals in the NEON group.",
      },
      {
        codigo: "f1-leg-3",
        label: "Register a CNPJ (if you don't have one yet)",
        descricao:
          "Types: MEI is not suitable for aesthetics. Choose ME or LTDA. Presumed Profit regime is usually more advantageous.",
      },
      {
        codigo: "f1-leg-4",
        label: "Obtain a business operating permit",
        descricao:
          "Apply at City Hall. Documents: articles of incorporation, CNPJ, proof of address, paid fee.",
      },
      {
        codigo: "f1-leg-5",
        label: "Obtain a Health Surveillance license",
        descricao:
          "Documents: architectural plan, PGRS, RT, list of procedures. Timeline: 30-60 days.",
      },
      {
        codigo: "f1-leg-6",
        label: "Register with the Professional Council",
        descricao: "CRBM (biomedical), COREN (nurses), CFM (physicians). Obtain your RT number.",
      },
      {
        codigo: "f1-leg-7",
        label: "Obtain Fire Department authorization",
        descricao:
          "AVCB for establishments. Check requirements for fire extinguishers and emergency exits.",
      },
      {
        codigo: "f1-leg-8",
        label: "Register with CNES",
        descricao:
          "National Registry of Healthcare Establishments. Mandatory for clinics. Done online.",
      },
    ],
  },
  {
    codigo: "f1-financas",
    titulo: "Organized Finances",
    etapa: "Phase 1: Foundations",
    icone: "💳",
    descricao: "Separate your personal and business finances and control your cash flow.",
    steps: [
      {
        codigo: "f1-fin-1",
        label: "Open a business bank account",
        descricao:
          "Digital banks (Inter, Cora) have lower fees. Never mix personal and business funds.",
      },
      {
        codigo: "f1-fin-2",
        label: "Set up a cash flow spreadsheet",
        descricao:
          "Download the template from the NEON drive or use apps like Conta Azul or Granatum. Record EVERYTHING.",
      },
      {
        codigo: "f1-fin-3",
        label: "Define a monthly owner's draw",
        descricao:
          "A fixed amount you withdraw every month. Suggestion: 30-40% of net profit. Be disciplined.",
      },
      {
        codigo: "f1-fin-4",
        label: "Map fixed and variable costs",
        descricao:
          "Fixed: rent, internet, software. Variable: supplies, commissions. Create clear categories.",
      },
      {
        codigo: "f1-fin-5",
        label: "Build an emergency reserve",
        descricao:
          "Target: 3-6 months of fixed costs. Keep in a separate account. Only touch in a real emergency.",
      },
      {
        codigo: "f1-fin-6",
        label: "Implement a simplified income statement",
        descricao:
          "Income Statement: Revenue - Variable Costs - Fixed Costs = Profit. Do it monthly.",
      },
    ],
  },
  {
    codigo: "f1-precificacao",
    titulo: "Profitable Pricing",
    etapa: "Phase 1: Foundations",
    icone: "🏷️",
    descricao: "Set prices that generate profit and communicate value to the client.",
    steps: [
      {
        codigo: "f1-prec-1",
        label: "Calculate the real cost per procedure",
        descricao:
          "Include: supplies, time (your hourly rate), equipment depreciation, overhead.",
      },
      {
        codigo: "f1-prec-2",
        label: "Research competitor prices",
        descricao:
          "Check profiles of 5-10 competitors in your area. Note prices and positioning of each.",
      },
      {
        codigo: "f1-prec-3",
        label: "Set a minimum 40% margin",
        descricao:
          "Price = Cost / (1 - Margin). If cost is R$100 and margin is 40%: 100 / 0.6 = R$166.67.",
      },
      {
        codigo: "f1-prec-4",
        label: "Create a price list",
        descricao:
          "List all procedures with prices. Create versions: cash, installments, combo.",
      },
      {
        codigo: "f1-prec-5",
        label: "Define a discount policy",
        descricao: "Maximum 10-15% for cash payment. Never give a discount without a clear reason.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: POSITIONING (Weeks 5-8)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "f2-nicho",
    titulo: "Niche & Specialization",
    etapa: "Phase 2: Positioning",
    icone: "🔍",
    descricao: "Define your main niche to differentiate yourself.",
    steps: [
      {
        codigo: "f2-nicho-1",
        label: "List areas of interest and expertise",
        descricao:
          "What do you enjoy doing most? Facial harmonization, skincare, body treatments? List 3-5 areas.",
      },
      {
        codigo: "f2-nicho-2",
        label: "Analyze local demand",
        descricao:
          "Search on Google Trends, check Google questions, analyze local competition.",
      },
      {
        codigo: "f2-nicho-3",
        label: "Assess niche profitability",
        descricao: "Higher-ticket niches: facial harmonization, advanced body treatments.",
      },
      {
        codigo: "f2-nicho-4",
        label: "Define your main niche",
        descricao:
          "Choose 1-2 niches to focus on. Example: 'Natural facial harmonization for women 35+'.",
      },
      {
        codigo: "f2-nicho-5",
        label: "Create a competitive differentiator",
        descricao:
          "What do you do differently? Service, technique, results, experience? Define 3 differentiators.",
      },
    ],
  },
  {
    codigo: "f2-persona",
    titulo: "Validated Ideal Persona",
    etapa: "Phase 2: Positioning",
    icone: "👤",
    descricao: "Define and validate your ideal client to communicate precisely.",
    steps: [
      {
        codigo: "f2-pers-1",
        label: "Define demographic data",
        descricao:
          "Age, gender, income, profession, city. Be specific: 'Women 35-50, income 10k+, SP capital'.",
      },
      {
        codigo: "f2-pers-2",
        label: "Map deep pain points",
        descricao:
          "What bothers them? Aging, low self-esteem, social comparison? Go beyond the surface.",
      },
      {
        codigo: "f2-pers-3",
        label: "Identify desires and aspirations",
        descricao: "How do they want to feel? Younger, confident, beautiful? Use their own words.",
      },
      {
        codigo: "f2-pers-4",
        label: "List common objections",
        descricao:
          "Price, fear of looking artificial, not having time. Prepare answers for each objection.",
      },
      {
        codigo: "f2-pers-5",
        label: "Validate with 5 real clients",
        descricao:
          "Interview 5 of your best clients. Ask: why did you choose me? What do you value most?",
      },
    ],
  },
  {
    codigo: "f2-posicionamento",
    titulo: "Value Proposition & Positioning",
    etapa: "Phase 2: Positioning",
    icone: "🗺️",
    descricao: "Build your unique market positioning.",
    steps: [
      {
        codigo: "f2-pos-1",
        label: "Analyze 5 direct competitors",
        descricao:
          "What do they communicate? What prices do they charge? What does their Instagram look like? Note strengths and weaknesses.",
      },
      {
        codigo: "f2-pos-2",
        label: "Identify market gaps",
        descricao:
          "What does nobody offer? Humanized service? Specific technique? Flexible hours?",
      },
      {
        codigo: "f2-pos-3",
        label: "Create a unique value proposition",
        descricao:
          "Complete: 'I help [persona] achieve [result] through [method], unlike [competitors]'.",
      },
      {
        codigo: "f2-pos-4",
        label: "Write a positioning statement",
        descricao:
          "A 2-line sentence summarizing who you are and who you serve. Use it in your bio and all presentations.",
      },
      {
        codigo: "f2-pos-5",
        label: "Create a 30-second elevator pitch",
        descricao:
          "Practice presenting who you are in 30 seconds. Use at networking events and first contacts.",
      },
    ],
  },
  {
    codigo: "f2-perfil",
    titulo: "DISC Behavioral Profile",
    etapa: "Phase 2: Positioning",
    icone: "🧠",
    descricao: "Understand your behavioral profile to improve communication and sales.",
    steps: [
      {
        codigo: "f2-disc-1",
        label: "Take the DISC test",
        descricao: "Take the free test at sites like 123test.com or ask for a link in the NEON group.",
      },
      {
        codigo: "f2-disc-2",
        label: "Analyze your strengths",
        descricao:
          "D=dominance, I=influence, S=steadiness, C=conscientiousness. Which one dominates? Use it to your advantage.",
      },
      {
        codigo: "f2-disc-3",
        label: "Identify areas for improvement",
        descricao:
          "High D can seem aggressive. High S may be slow to act. Recognize and work on it.",
      },
      {
        codigo: "f2-disc-4",
        label: "Adapt communication for clients",
        descricao: "D clients want fast results. S clients want security. Adapt your pitch.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: DIGITAL MARKETING (Weeks 9-12)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "f3-instagram",
    titulo: "Professional Instagram for Clinics",
    etapa: "Phase 3: Marketing",
    icone: "📱",
    descricao: "Turn your Instagram into a qualified lead generation machine.",
    steps: [
      {
        codigo: "f3-ig-1",
        label: "Convert to a professional account",
        descricao:
          "Settings > Account > Switch to professional account > Business. Connect to Facebook Business.",
      },
      {
        codigo: "f3-ig-2",
        label: "Optimize bio with the AIDA method",
        descricao:
          "Attention: emoji + specialty. Interest: result you deliver. Desire: social proof. Action: CTA + link.",
      },
      {
        codigo: "f3-ig-3",
        label: "Define 3-5 content pillars",
        descricao:
          "Suggestion: Educational (tips), Behind the scenes (humanizes), Results (before/after), Authority (certifications).",
      },
      {
        codigo: "f3-ig-4",
        label: "Create a 30-day editorial calendar",
        descricao:
          "Use Notion or Google Sheets. Define: 3-4 posts/week + daily stories + 1-2 reels/week.",
      },
      {
        codigo: "f3-ig-5",
        label: "Prepare a batch of 10 content pieces",
        descricao:
          "Set aside 2-3 hours per week for batch production. Record videos, write captions. Use Canva and CapCut.",
      },
      {
        codigo: "f3-ig-6",
        label: "Set up organized highlights",
        descricao:
          "Minimum: About me, Procedures, Results, Location. Use standardized covers matching your brand identity.",
      },
      {
        codigo: "f3-ig-7",
        label: "Implement a stories routine",
        descricao:
          "5-7 stories/day. Script: morning behind-the-scenes, educational content, poll, result, final CTA.",
      },
      {
        codigo: "f3-ig-8",
        label: "Create your first Reel with a strong hook",
        descricao:
          "The first 3 seconds are crucial. Use: a provocative question or 'you're doing this wrong'.",
      },
      {
        codigo: "f3-ig-9",
        label: "Establish an engagement routine",
        descricao:
          "30 min/day: reply to DMs within 1 hour, comment on 10 profiles of potential clients, respond to comments.",
      },
      {
        codigo: "f3-ig-10",
        label: "Track metrics weekly",
        descricao:
          "Insights: reach, profile visits, link clicks, saves. Goal: grow 10% week over week.",
      },
    ],
  },
  {
    codigo: "f3-trafego",
    titulo: "Paid Traffic: Meta Ads Fundamentals",
    etapa: "Phase 3: Marketing",
    icone: "🎯",
    descricao: "Set up your first campaigns to accelerate lead generation.",
    steps: [
      {
        codigo: "f3-tf-1",
        label: "Create a Business Manager",
        descricao:
          "Go to business.facebook.com. Create an account with a professional email. Add your page and Instagram.",
      },
      {
        codigo: "f3-tf-2",
        label: "Set up the Meta Pixel",
        descricao:
          "Events > Add Pixel. Install it on your website or landing page. Essential for remarketing.",
      },
      {
        codigo: "f3-tf-3",
        label: "Define your initial target audience",
        descricao:
          "Segment by: location (10-30 km), age (25-55), interests (aesthetics, beauty, skincare).",
      },
      {
        codigo: "f3-tf-4",
        label: "Create an engagement campaign",
        descricao:
          "Objective: Engagement. Budget: R$15-30/day for testing. Duration: 7 days for learning.",
      },
      {
        codigo: "f3-tf-5",
        label: "Analyze results after 7 days",
        descricao: "Acceptable CPC: < R$1.00. CTR: > 1%. Deactivate poor ads, duplicate the good ones.",
      },
      {
        codigo: "f3-tf-6",
        label: "Scale to a lead generation campaign",
        descricao:
          "Objective: WhatsApp Messages or Sign-up. Cost per lead target: R$10-40 depending on the procedure.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4: SALES & CUSTOMER SERVICE (Weeks 13-16)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "f4-whatsapp",
    titulo: "Strategic WhatsApp Business",
    etapa: "Phase 4: Sales",
    icone: "💬",
    descricao: "Set up your main sales channel to convert more leads.",
    steps: [
      {
        codigo: "f4-wpp-1",
        label: "Migrate to WhatsApp Business",
        descricao:
          "Download the WhatsApp Business app (not the regular one). Migrate your history. Use a separate business number if possible.",
      },
      {
        codigo: "f4-wpp-2",
        label: "Set up a complete business profile",
        descricao:
          "Photo: your professional photo. Description: specialty + CTA. Hours. Address with map.",
      },
      {
        codigo: "f4-wpp-3",
        label: "Create a service catalog",
        descricao:
          "Add 5-10 main procedures. Photo, short description, price (optional), link to schedule.",
      },
      {
        codigo: "f4-wpp-4",
        label: "Set up a greeting message",
        descricao:
          "'Hello! 👋 Thanks for reaching out! We'll get back to you shortly. What would you like to know?'",
      },
      {
        codigo: "f4-wpp-5",
        label: "Set up an away message",
        descricao:
          "Enable outside hours: 'Our hours are Mon-Fri, 9 AM-6 PM. Leave your message and we'll respond!'",
      },
      {
        codigo: "f4-wpp-6",
        label: "Create organization labels",
        descricao:
          "'New lead', 'In negotiation', 'Scheduled', 'Post-service', 'Inactive'. Different colors.",
      },
      {
        codigo: "f4-wpp-7",
        label: "Prepare quick replies",
        descricao:
          "Create 10+ templates: pricing, address, how procedure X works, payment methods, confirmation.",
      },
      {
        codigo: "f4-wpp-8",
        label: "Define a response SLA",
        descricao:
          "Goal: respond within 5 min during business hours. Maximum acceptable: 1 hour. A hot lead goes cold in 5 min!",
      },
    ],
  },
  {
    codigo: "f4-vendas",
    titulo: "Consultative Sales Script",
    etapa: "Phase 4: Sales",
    icone: "💰",
    descricao: "Develop sales techniques that convert without feeling pushy.",
    steps: [
      {
        codigo: "f4-vend-1",
        label: "Study consultative selling",
        descricao:
          "Consultative selling = understand the pain before offering a solution. Read: SPIN Selling or watch NEON classes.",
      },
      {
        codigo: "f4-vend-2",
        label: "Create a discovery script",
        descricao:
          "Questions: 'What motivated you to seek this now?' 'Have you done something similar before?' 'What result do you expect?'",
      },
      {
        codigo: "f4-vend-3",
        label: "Map common objections",
        descricao:
          "List the 5 most frequent objections: price, fear, time, distrust. Prepare answers for each.",
      },
      {
        codigo: "f4-vend-4",
        label: "Create an objection-handling script",
        descricao:
          "'I understand your concern about the cost. Can I show you how the return justifies the investment?'",
      },
      {
        codigo: "f4-vend-5",
        label: "Define a follow-up process",
        descricao:
          "7-touch cadence: D1 (proposal), D2 (check-in), D4 (value), D7 (urgency), D14, D21, D30 (final).",
      },
    ],
  },
  {
    codigo: "f4-jornada",
    titulo: "WOW Patient Journey",
    etapa: "Phase 4: Sales",
    icone: "⭐",
    descricao: "Create a memorable experience from first contact to loyalty.",
    steps: [
      {
        codigo: "f4-jor-1",
        label: "Map the current journey",
        descricao:
          "Draw: lead > contact > scheduling > preparation > service > post-service. Identify gaps and friction points.",
      },
      {
        codigo: "f4-jor-2",
        label: "Create a first-contact script",
        descricao:
          "Welcome + discovery + qualification. 'What motivated you?' 'Have you done this before?' 'What are your expectations?'",
      },
      {
        codigo: "f4-jor-3",
        label: "Implement a 24-hour confirmation",
        descricao:
          "'Hi [name]! Just a reminder about your appointment tomorrow at [time]. Let me know if you need anything! 💙'",
      },
      {
        codigo: "f4-jor-4",
        label: "Send pre-procedure instructions",
        descricao:
          "Create a PDF or message: what to avoid, how to prepare, what to expect. Reduces anxiety and no-shows.",
      },
      {
        codigo: "f4-jor-5",
        label: "Create a WOW moment during the service",
        descricao:
          "Elements: tea/coffee upon arrival, ambient music, heated blanket, surprise gift, before/after photo.",
      },
      {
        codigo: "f4-jor-6",
        label: "24-hour post-procedure follow-up",
        descricao:
          "'Hi [name]! How are you doing? How are you feeling? Any questions, I'm here! 💙'",
      },
      {
        codigo: "f4-jor-7",
        label: "7-day post-procedure follow-up",
        descricao:
          "Check results, ask for feedback, request a Google review. 'Are you happy with the results?'",
      },
      {
        codigo: "f4-jor-8",
        label: "Implement 60-90 day reactivation",
        descricao:
          "'Hi [name]! It's been 2 months since your [procedure]. Time to schedule your maintenance!'",
      },
      {
        codigo: "f4-jor-9",
        label: "Create a referral program",
        descricao:
          "'Refer a friend and get 10% off your next session!' Physical or digital card to share.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5: MANAGEMENT & SCALING (Weeks 17-20)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "f5-organizacao",
    titulo: "Organization & Productivity",
    etapa: "Phase 5: Management",
    icone: "📅",
    descricao: "Organize your calendar and task system for maximum productivity.",
    steps: [
      {
        codigo: "f5-org-1",
        label: "Choose a calendar tool",
        descricao:
          "Google Calendar (integrates with everything), Calendly (online scheduling), or systems like Simples Agenda.",
      },
      {
        codigo: "f5-org-2",
        label: "Set up time blocks",
        descricao:
          "Blocks for: appointments, administrative, content, personal. Protect strategic time slots.",
      },
      {
        codigo: "f5-org-3",
        label: "Define administrative hours",
        descricao:
          "Reserve 2-3 hours/week for: finances, planning, metrics analysis. Do not see clients during this time.",
      },
      {
        codigo: "f5-org-4",
        label: "Implement a confirmation system",
        descricao: "Automation 48h and 24h before. Reduce no-shows by up to 50% with reminders.",
      },
      {
        codigo: "f5-org-5",
        label: "Protect 1 day off",
        descricao:
          "Choose one day WITHOUT appointments. Non-negotiable. Your rest impacts your performance.",
      },
    ],
  },
  {
    codigo: "f5-processos",
    titulo: "Processes & SOPs",
    etapa: "Phase 5: Management",
    icone: "📋",
    descricao: "Document and standardize your operational processes.",
    steps: [
      {
        codigo: "f5-sop-1",
        label: "List key processes",
        descricao: "Service, sales, finance, post-service. List everything you do repeatedly.",
      },
      {
        codigo: "f5-sop-2",
        label: "Document the service SOP",
        descricao:
          "Step by step: reception, intake form, procedure, instructions, photo, farewell. With checklist.",
      },
      {
        codigo: "f5-sop-3",
        label: "Document the sales SOP",
        descricao:
          "Steps: qualification, presentation, objection, closing, post-sale. Scripts included.",
      },
      {
        codigo: "f5-sop-4",
        label: "Document the financial SOP",
        descricao: "Collections, payments, reconciliation, income statement. Who does what, when, and how.",
      },
      {
        codigo: "f5-sop-5",
        label: "Create a quality checklist",
        descricao:
          "Daily check: inventory, equipment, cleaning, schedule. Weekly: metrics, pending items.",
      },
    ],
  },
  {
    codigo: "f5-dashboard",
    titulo: "Results Dashboard",
    etapa: "Phase 5: Management",
    icone: "📈",
    descricao: "Monitor key indicators and make data-driven decisions.",
    steps: [
      {
        codigo: "f5-kpi-1",
        label: "Define revenue KPIs",
        descricao: "Monthly revenue, average ticket, recurrence. Goal vs. actual. Compare month over month.",
      },
      {
        codigo: "f5-kpi-2",
        label: "Define marketing KPIs",
        descricao:
          "Leads generated, cost per lead, conversion rate. Which channel brings the best results?",
      },
      {
        codigo: "f5-kpi-3",
        label: "Define service KPIs",
        descricao: "No-show rate, NPS, return rate. How is the client experience?",
      },
      {
        codigo: "f5-kpi-4",
        label: "Set up a spreadsheet/dashboard",
        descricao: "Use Google Sheets or Notion. Update weekly. Visualize progress.",
      },
      {
        codigo: "f5-kpi-5",
        label: "Establish an analysis routine",
        descricao: "Friday: review the week. Last day of the month: full analysis. 30 min each.",
      },
      {
        codigo: "f5-kpi-6",
        label: "Define data-driven adjustments",
        descricao:
          "If conversion is low: review the script. If leads are low: review traffic. Act on the bottleneck.",
      },
    ],
  },
  {
    codigo: "f5-equipe",
    titulo: "Team Management (when applicable)",
    etapa: "Phase 5: Management",
    icone: "👥",
    descricao: "Build and manage your high-performance team.",
    steps: [
      {
        codigo: "f5-eq-1",
        label: "Map required positions",
        descricao:
          "Typical roles: receptionist, assistant, social media manager. What do you most need to delegate?",
      },
      {
        codigo: "f5-eq-2",
        label: "Create job descriptions",
        descricao:
          "Responsibilities, schedule, competencies, compensation. Be clear from the start.",
      },
      {
        codigo: "f5-eq-3",
        label: "Define a hiring process",
        descricao:
          "Where to advertise, interview, practical test, trial period. Hire slowly.",
      },
      {
        codigo: "f5-eq-4",
        label: "Structure the onboarding",
        descricao: "First week: culture, processes, systems. Use the SOPs you created.",
      },
      {
        codigo: "f5-eq-5",
        label: "Create a feedback system",
        descricao: "Weekly 15-min 1:1. What went well, what to improve, support needed.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 6: MINDSET & ROUTINES (Ongoing)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "f6-mural",
    titulo: "Extraordinary Life Vision Board",
    etapa: "Phase 6: Mindset",
    icone: "✨",
    descricao: "Create your vision board and stay focused on your dreams.",
    steps: [
      {
        codigo: "f6-mur-1",
        label: "Define your ideal life vision",
        descricao:
          "What does your life look like in 3 years? Home, travel, routine, relationships, business. Be specific.",
      },
      {
        codigo: "f6-mur-2",
        label: "Collect inspiring images",
        descricao:
          "Pinterest, magazines, photos. Represent each area: career, family, health, leisure, finances.",
      },
      {
        codigo: "f6-mur-3",
        label: "Build a physical or digital board",
        descricao:
          "Physical: board on the office wall. Digital: wallpaper, secret Pinterest board, Notion.",
      },
      {
        codigo: "f6-mur-4",
        label: "Place it somewhere visible",
        descricao:
          "You need to SEE it every day. Nightstand, computer screen, bathroom mirror.",
      },
    ],
  },
  {
    codigo: "f6-gratidao",
    titulo: "Daily Gratitude Practice",
    etapa: "Phase 6: Mindset",
    icone: "🙏",
    descricao: "Practice daily gratitude for a positive and abundant mindset.",
    steps: [
      {
        codigo: "f6-grat-1",
        label: "Choose a format (journal or app)",
        descricao:
          "Physical journal for those who like to write. Apps: Day One, Gratitude. Choose what you'll actually use.",
      },
      {
        codigo: "f6-grat-2",
        label: "Set a daily time",
        descricao:
          "Morning (sets the day) or evening (reflection). Link to an existing habit: after coffee, before bed.",
      },
      {
        codigo: "f6-grat-3",
        label: "Record 3 gratitudes per day",
        descricao:
          "Be specific: not 'family', but 'the call with my mom this morning that made me happy'.",
      },
      {
        codigo: "f6-grat-4",
        label: "Reflect on impacts weekly",
        descricao: "Friday: reread the week. How did your mood and perspective change? What did you learn?",
      },
    ],
  },
  {
    codigo: "f6-leitura",
    titulo: "Reading Routine",
    etapa: "Phase 6: Mindset",
    icone: "📚",
    descricao: "Develop a reading habit for continuous growth.",
    steps: [
      {
        codigo: "f6-leit-1",
        label: "Choose a book from the NEON list",
        descricao:
          "Suggestions: Think and Grow Rich, Mindset, Essentialism, Start with Why. Ask for the list in the group.",
      },
      {
        codigo: "f6-leit-2",
        label: "Set a reading goal",
        descricao:
          "Suggestion: 10-20 pages/day or 1 book/month. Start small, increase gradually.",
      },
      {
        codigo: "f6-leit-3",
        label: "Set a fixed time",
        descricao: "Early morning, lunch, before bed. Replace 30 min of phone time with reading.",
      },
      {
        codigo: "f6-leit-4",
        label: "Record actionable insights",
        descricao:
          "Don't just read, apply. Write down: 'What can I do differently based on this?' Implement 1 thing per book.",
      },
    ],
  },
  {
    codigo: "f6-saude-mental",
    titulo: "Entrepreneur Mental Health",
    etapa: "Phase 6: Mindset",
    icone: "🧘",
    descricao: "Take care of yourself to take care of your business. Burnout prevention.",
    steps: [
      {
        codigo: "f6-sm-1",
        label: "Recognize signs of burnout",
        descricao:
          "Symptoms: constant exhaustion, work cynicism, drop in productivity, irritability, insomnia.",
      },
      {
        codigo: "f6-sm-2",
        label: "Set fixed work hours",
        descricao:
          "Start and end times. Don't reply to WhatsApp outside hours. Enable 'Do Not Disturb' mode.",
      },
      {
        codigo: "f6-sm-3",
        label: "Create a daily disconnection ritual",
        descricao:
          "After 8 PM: phone in another room. Relaxing activity: bath, reading, show, family time.",
      },
      {
        codigo: "f6-sm-4",
        label: "Protect 1 sacred day off",
        descricao:
          "At least 1 day/week WITHOUT work. Don't check metrics. Your brain needs to rest.",
      },
      {
        codigo: "f6-sm-5",
        label: "Build a support network",
        descricao:
          "Use the NEON group actively. Have 2-3 colleagues to vent to. Consider therapy.",
      },
      {
        codigo: "f6-sm-6",
        label: "Exercise regularly",
        descricao:
          "At least 3x/week, 30 min. Walking, gym, yoga, dancing. Releases endorphins, reduces anxiety.",
      },
      {
        codigo: "f6-sm-7",
        label: "Implement breaks during the day",
        descricao:
          "Pomodoro: 25 min work + 5 min break. Every 4 cycles: 15-30 min. Stand up, hydrate, breathe.",
      },
    ],
  },
  {
    codigo: "f6-mentoria",
    titulo: "Making the Most of NEON Mentorship",
    etapa: "Phase 6: Mindset",
    icone: "📞",
    descricao: "Maximize the value of your mentorship with preparation and execution.",
    steps: [
      {
        codigo: "f6-ment-1",
        label: "Prepare an agenda before each call",
        descricao:
          "List: 3 wins of the month, 3 current challenges, 3 specific questions. Send 24 hours in advance.",
      },
      {
        codigo: "f6-ment-2",
        label: "Define mentorship objectives",
        descricao:
          "What do you NEED to walk away knowing from this call? Focus saves time and boosts results.",
      },
      {
        codigo: "f6-ment-3",
        label: "Record insights during the call",
        descricao: "Write down everything: recommendations, tasks, deadlines. Use Notion, Notes, or even paper.",
      },
      {
        codigo: "f6-ment-4",
        label: "Create a post-call action plan",
        descricao:
          "Turn insights into tasks with deadlines. Maximum 3-5 actions. Prioritize by impact.",
      },
      {
        codigo: "f6-ment-5",
        label: "Execute and report at the next session",
        descricao:
          "The differentiator is EXECUTION. Do what was agreed and share the results at the next call.",
      },
    ],
  },
];

/**
 * Groups activities by phase
 */
export function getAtividadesByEtapa(): Record<string, Atividade[]> {
  const grouped: Record<string, Atividade[]> = {};
  for (const atividade of ATIVIDADES) {
    if (!grouped[atividade.etapa]) {
      grouped[atividade.etapa] = [];
    }
    grouped[atividade.etapa].push(atividade);
  }
  return grouped;
}

/**
 * Calculates total progress given a progress map
 */
export function calcularProgresso(progressMap: Record<string, boolean>): {
  total: number;
  completed: number;
  percentage: number;
} {
  let total = 0;
  let completed = 0;

  for (const atividade of ATIVIDADES) {
    for (const step of atividade.steps) {
      total++;
      const key = `${atividade.codigo}:${step.codigo}`;
      if (progressMap[key]) {
        completed++;
      }
    }
  }

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Color mapping for phase categories (6 Phases)
 */
export function getEtapaColor(etapa: string): {
  border: string;
  bg: string;
  text: string;
  ring: string;
} {
  const colorMap: Record<string, { border: string; bg: string; text: string; ring: string }> = {
    "Phase 1: Foundations": {
      border: "border-l-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      ring: "ring-amber-500/30",
    },
    "Phase 2: Positioning": {
      border: "border-l-blue-500",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      ring: "ring-blue-500/30",
    },
    "Phase 3: Marketing": {
      border: "border-l-pink-500",
      bg: "bg-pink-500/10",
      text: "text-pink-500",
      ring: "ring-pink-500/30",
    },
    "Phase 4: Sales": {
      border: "border-l-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      ring: "ring-emerald-500/30",
    },
    "Phase 5: Management": {
      border: "border-l-violet-500",
      bg: "bg-violet-500/10",
      text: "text-violet-500",
      ring: "ring-violet-500/30",
    },
    "Phase 6: Mindset": {
      border: "border-l-teal-500",
      bg: "bg-teal-500/10",
      text: "text-teal-500",
      ring: "ring-teal-500/30",
    },
  };

  return (
    colorMap[etapa] ?? {
      border: "border-l-primary",
      bg: "bg-primary/10",
      text: "text-primary",
      ring: "ring-primary/30",
    }
  );
}

/**
 * Get motivational message based on progress percentage
 */
export function getMotivationalMessage(percentage: number): {
  message: string;
  emoji: string;
} {
  if (percentage === 100) {
    return { message: "Congratulations! Journey complete! 🎉", emoji: "🏆" };
  }
  if (percentage >= 75) {
    return { message: "Almost there! You're crushing it!", emoji: "🔥" };
  }
  if (percentage >= 50) {
    return { message: "Halfway there! Keep it up!", emoji: "💪" };
  }
  if (percentage >= 25) {
    return { message: "Great progress! Keep the momentum!", emoji: "⚡" };
  }
  if (percentage > 0) {
    return { message: "Good start! The first step is the most important.", emoji: "🚀" };
  }
  return { message: "Your journey starts now!", emoji: "✨" };
}
