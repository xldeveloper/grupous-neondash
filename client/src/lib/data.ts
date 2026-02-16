export interface MentoradoData {
  faturamento: number;
  lucro: number;
  posts_feed: number;
  stories: number;
  leads: number;
  procedimentos: number;
}

export interface DetalheScore {
  realizado: number;
  meta?: number;
  esperado?: number;
  percentual: number;
  score: number;
}

export interface MentoradoAnalise {
  dados: MentoradoData;
  score: number;
  detalhes: {
    faturamento: DetalheScore;
    posts_feed: DetalheScore;
    stories: DetalheScore;
    procedimentos: DetalheScore;
    leads?: DetalheScore;
    bonus_estrutura?: number;
  };
  classificacao: string;
  feedback?: {
    analise_dezembro: string;
    foco_janeiro: string;
    sugestao: string;
  };
}

export interface GrupoAnalise {
  analise: Record<string, MentoradoAnalise>;
  ranking: [string, number][];
  benchmarks: {
    meta_faturamento: number;
    posts_feed_min: number;
    stories_min: number;
    procedimentos_min: number;
    leads_min?: number;
  };
}

export interface AnaliseCompleta {
  neon: GrupoAnalise;
}

export const analiseData: AnaliseCompleta = {
  neon: {
    analise: {
      "Ana Scaravate": {
        dados: {
          faturamento: 16350.0,
          lucro: 10864.38,
          posts_feed: 2,
          stories: 99,
          leads: 4,
          procedimentos: 16,
        },
        score: 88.8,
        detalhes: {
          faturamento: {
            realizado: 16350.0,
            meta: 16000,
            percentual: 102.2,
            score: 40,
          },
          posts_feed: {
            realizado: 2,
            esperado: 8,
            percentual: 25.0,
            score: 3.8,
          },
          stories: {
            realizado: 99,
            esperado: 28,
            percentual: 353.6,
            score: 15,
          },
          procedimentos: {
            realizado: 16,
            esperado: 5,
            percentual: 320.0,
            score: 20,
          },
          bonus_estrutura: 10,
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Excellent performance in revenue (R$ 16,350) and stories (99), but low feed frequency (2 posts).",
          foco_janeiro:
            "Maintain the stories pace and increase feed presence to educate the audience about new procedures.",
          sugestao:
            "Ana, your stories engagement is fantastic and directly reflected in your revenue. For January, the focus is turning that warm audience into recurring patients. Increase to 3 weekly feed posts focusing on 'pain vs. solution' to attract new followers who don't yet see your stories. Use the 'Strategic Assessment' campaign to fill the schedule for weeks 3 and 4.",
        },
      },
      "Alina Targino": {
        dados: {
          faturamento: 9220.0,
          lucro: 3970.56,
          posts_feed: 20,
          stories: 84,
          leads: 0,
          procedimentos: 12,
        },
        score: 83.0,
        detalhes: {
          faturamento: {
            realizado: 9220.0,
            meta: 16000,
            percentual: 57.6,
            score: 23.1,
          },
          posts_feed: {
            realizado: 20,
            esperado: 8,
            percentual: 250.0,
            score: 15,
          },
          stories: {
            realizado: 84,
            esperado: 28,
            percentual: 300.0,
            score: 15,
          },
          procedimentos: {
            realizado: 12,
            esperado: 5,
            percentual: 240.0,
            score: 20,
          },
          bonus_estrutura: 10,
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Great consistency in posts (20) and stories (84), but revenue (R$ 9,220) below the R$ 16k target.",
          foco_janeiro:
            "Convert the high content volume into effective bookings through active prospecting.",
          sugestao:
            "Alina, you are a content machine! Now we need to convert that visibility into sales. In January, apply the 'Active Prospecting' strategy by sending direct messages to people who interact with your posts. Don't wait for them to come to you. Use the strategic assessment invitation script with the 30 most engaged names on your Instagram.",
        },
      },
      "Tânia Cristina": {
        dados: {
          faturamento: 9120.0,
          lucro: 6300.0,
          posts_feed: 20,
          stories: 37,
          leads: 4,
          procedimentos: 8,
        },
        score: 82.8,
        detalhes: {
          faturamento: {
            realizado: 9120.0,
            meta: 16000,
            percentual: 57.0,
            score: 22.8,
          },
          posts_feed: {
            realizado: 20,
            esperado: 8,
            percentual: 250.0,
            score: 15,
          },
          stories: {
            realizado: 37,
            esperado: 28,
            percentual: 132.1,
            score: 15,
          },
          procedimentos: {
            realizado: 8,
            esperado: 5,
            percentual: 160.0,
            score: 20,
          },
          bonus_estrutura: 10,
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Exemplary consistency on the feed (20 posts), but revenue (R$ 9,120) still has growth potential.",
          foco_janeiro:
            "Improve the stories offering and focus on higher average ticket procedures.",
          sugestao:
            "Tania, your storefront looks great, but we need to be more intentional about selling. For January, slightly reduce the feed if needed, but intensify stories with direct calls to action (CTAs). The '10 spots for assessment' campaign is perfect for you to create urgency and close higher-value packages.",
        },
      },
      "Mariana Guimarães": {
        dados: {
          faturamento: 9068.0,
          lucro: 4500.75,
          posts_feed: 7,
          stories: 157,
          leads: 13,
          procedimentos: 10,
        },
        score: 80.8,
        detalhes: {
          faturamento: {
            realizado: 9068.0,
            meta: 16000,
            percentual: 56.7,
            score: 22.7,
          },
          posts_feed: {
            realizado: 7,
            esperado: 8,
            percentual: 87.5,
            score: 13.1,
          },
          stories: {
            realizado: 157,
            esperado: 28,
            percentual: 560.7,
            score: 15,
          },
          procedimentos: {
            realizado: 10,
            esperado: 5,
            percentual: 200.0,
            score: 20,
          },
          bonus_estrutura: 10,
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Stories queen (157!), but revenue (R$ 9,068) and feed (7 posts) can improve.",
          foco_janeiro:
            "Balance the feed presence and leverage the lead base (13 captured) to generate sales.",
          sugestao:
            "Mariana, your stories connection is incredible. In January, let's use that influence to fill the schedule. Take those 13 leads from December plus new ones that come in and apply the active prospecting script. On the feed, focus on 'Social Proof' posts to validate your authority for newcomers.",
        },
      },
      "Gabriela Santiago": {
        dados: {
          faturamento: 3600.0,
          lucro: 1990.0,
          posts_feed: 2,
          stories: 49,
          leads: 2,
          procedimentos: 7,
        },
        score: 57.8,
        detalhes: {
          faturamento: {
            realizado: 3600.0,
            meta: 16000,
            percentual: 22.5,
            score: 9.0,
          },
          posts_feed: {
            realizado: 2,
            esperado: 8,
            percentual: 25.0,
            score: 3.8,
          },
          stories: {
            realizado: 49,
            esperado: 28,
            percentual: 175.0,
            score: 15,
          },
          procedimentos: {
            realizado: 7,
            esperado: 5,
            percentual: 140.0,
            score: 20,
          },
          bonus_estrutura: 10,
        },
        classificacao: "Fair",
        feedback: {
          analise_dezembro:
            "Revenue (R$ 3,600) and actions (2 posts) below potential. Needs a management turnaround.",
          foco_janeiro: "Rigorous execution of the basics: minimum consistency and active prospecting.",
          sugestao:
            "Gabriela, January is the turning point. Don't worry about perfection, focus on execution. Your goal is simple: 3 posts per week and daily active prospecting. Use Google My Business to attract local patients already searching for your service. The goal is to double this revenue with simple, consistent actions.",
        },
      },
      "Thais Olimpia": {
        dados: {
          faturamento: 30725.0,
          lucro: 0,
          posts_feed: 12,
          stories: 36,
          leads: 184,
          procedimentos: 12,
        },
        score: 96.0,
        detalhes: {
          faturamento: {
            realizado: 30725.0,
            meta: 30000,
            percentual: 102.4,
            score: 40,
          },
          posts_feed: {
            realizado: 12,
            esperado: 12,
            percentual: 100.0,
            score: 15,
          },
          stories: {
            realizado: 36,
            esperado: 28,
            percentual: 128.6,
            score: 15,
          },
          procedimentos: {
            realizado: 12,
            esperado: 15,
            percentual: 80.0,
            score: 16.0,
          },
          leads: { realizado: 184, esperado: 20, percentual: 920.0, score: 10 },
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Stellar performance! Hit the revenue target (R$ 30,725) and generated an incredible 184 leads.",
          foco_janeiro: "Lead management and qualification to maintain a high conversion rate.",
          sugestao:
            "Thais, you 'cleared' the game in December! With 184 leads, your challenge in January is qualification and conversion. Don't let those contacts go cold. Use the strategic assessment campaign to filter the curious from the real buyers. Maintain consistency and start thinking about delegating scheduling if you haven't already.",
        },
      },
      "Lana Máximo": {
        dados: {
          faturamento: 88365.0,
          lucro: 22774.0,
          posts_feed: 5,
          stories: 127,
          leads: 13,
          procedimentos: 54,
        },
        score: 87.8,
        detalhes: {
          faturamento: {
            realizado: 88365.0,
            meta: 30000,
            percentual: 294.6,
            score: 40,
          },
          posts_feed: {
            realizado: 5,
            esperado: 12,
            percentual: 41.7,
            score: 6.2,
          },
          stories: {
            realizado: 127,
            esperado: 28,
            percentual: 453.6,
            score: 15,
          },
          procedimentos: {
            realizado: 54,
            esperado: 15,
            percentual: 360.0,
            score: 20,
          },
          leads: { realizado: 13, esperado: 20, percentual: 65.0, score: 6.5 },
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Record revenue (R$ 88,365), but the feed (5 posts) was neglected.",
          foco_janeiro:
            "Resume feed presence to ensure future demand and avoid relying solely on referrals/recurring clients.",
          sugestao:
            "Lana, impressive results! To ensure this revenue is sustainable long-term, we need to re-engage the feed. Return with 3 weekly posts focused on education and authority. You already have the revenue; now build the brand empire to sustain this level all year.",
        },
      },
      "Kleber Oliveira": {
        dados: {
          faturamento: 66300.0,
          lucro: 0,
          posts_feed: 2,
          stories: 71,
          leads: 92,
          procedimentos: 36,
        },
        score: 87.5,
        detalhes: {
          faturamento: {
            realizado: 66300.0,
            meta: 30000,
            percentual: 221.0,
            score: 40,
          },
          posts_feed: {
            realizado: 2,
            esperado: 12,
            percentual: 16.7,
            score: 2.5,
          },
          stories: {
            realizado: 71,
            esperado: 28,
            percentual: 253.6,
            score: 15,
          },
          procedimentos: {
            realizado: 36,
            esperado: 15,
            percentual: 240.0,
            score: 20,
          },
          leads: { realizado: 92, esperado: 20, percentual: 460.0, score: 10 },
        },
        classificacao: "Excellent",
        feedback: {
          analise_dezembro:
            "Monster revenue (R$ 66,300), but the feed (2 posts) is nearly nonexistent.",
          foco_janeiro:
            "Organize the digital storefront. Revenue is great, but the showcase needs to reflect that success.",
          sugestao:
            "Kleber, financially you are soaring. The risk is becoming invisible to new audiences. In January, dedicate time to organizing the feed with 'Social Proof' and 'Behind the Scenes' posts. Show the clinic's success to attract patients seeking even higher ticket values. An updated Google My Business is essential for you.",
        },
      },
      Carmen: {
        dados: {
          faturamento: 65274.0,
          lucro: 0,
          posts_feed: 10,
          stories: 131,
          leads: 27,
          procedimentos: 0,
        },
        score: 77.5,
        detalhes: {
          faturamento: {
            realizado: 65274.0,
            meta: 30000,
            percentual: 217.6,
            score: 40,
          },
          posts_feed: {
            realizado: 10,
            esperado: 12,
            percentual: 83.3,
            score: 12.5,
          },
          stories: {
            realizado: 131,
            esperado: 28,
            percentual: 467.9,
            score: 15,
          },
          procedimentos: {
            realizado: 0,
            esperado: 15,
            percentual: 0.0,
            score: 0.0,
          },
          leads: { realizado: 27, esperado: 20, percentual: 135.0, score: 10 },
        },
        classificacao: "Good",
        feedback: {
          analise_dezembro:
            "Excellent revenue (R$ 65,274) with a good balance of posts (10) and stories (131).",
          foco_janeiro: "Maintain consistency and focus on client retention.",
          sugestao:
            "Carmen, you found the ideal balance. In January, your focus should be keeping this machine running and asking for Google My Business reviews. With this volume of appointments, you can dominate local search quickly. Encourage your patients to leave testimonials to attract even more organic demand.",
        },
      },
      "Jéssica Sales": {
        dados: {
          faturamento: 22554.0,
          lucro: 0,
          posts_feed: 7,
          stories: 93,
          leads: 43,
          procedimentos: 10,
        },
        score: 77.2,
        detalhes: {
          faturamento: {
            realizado: 22554.0,
            meta: 30000,
            percentual: 75.2,
            score: 30.1,
          },
          posts_feed: {
            realizado: 7,
            esperado: 12,
            percentual: 58.3,
            score: 8.8,
          },
          stories: {
            realizado: 93,
            esperado: 28,
            percentual: 332.1,
            score: 15,
          },
          procedimentos: {
            realizado: 10,
            esperado: 15,
            percentual: 66.7,
            score: 13.3,
          },
          leads: { realizado: 43, esperado: 20, percentual: 215.0, score: 10 },
        },
        classificacao: "Good",
        feedback: {
          analise_dezembro:
            "Good revenue (R$ 22,554) and consistent stories (93), but the feed (7 posts) can improve.",
          foco_janeiro: "Accelerate to hit 30k. You were so close!",
          sugestao:
            "Jessica, the 30k mark is right there! In January, active prospecting will be your differentiator. Take your list of past patients and offer the strategic assessment. For content, focus on showing results (ethical before/after) to increase desire and make it easier to close larger plans.",
        },
      },
      "Iza Pionório": {
        dados: {
          faturamento: 11425.48,
          lucro: 0,
          posts_feed: 23,
          stories: 137,
          leads: 47,
          procedimentos: 12,
        },
        score: 71.2,
        detalhes: {
          faturamento: {
            realizado: 11425.48,
            meta: 30000,
            percentual: 38.1,
            score: 15.2,
          },
          posts_feed: {
            realizado: 23,
            esperado: 12,
            percentual: 191.7,
            score: 15,
          },
          stories: {
            realizado: 137,
            esperado: 28,
            percentual: 489.3,
            score: 15,
          },
          procedimentos: {
            realizado: 12,
            esperado: 15,
            percentual: 80.0,
            score: 16.0,
          },
          leads: { realizado: 47, esperado: 20, percentual: 235.0, score: 10 },
        },
        classificacao: "Good",
        feedback: {
          analise_dezembro:
            "High volume of posts (23) and stories (137), but revenue (R$ 11,425) did not match the effort.",
          foco_janeiro: "Adjust the offer and target audience. Too much effort, too little financial return.",
          sugestao:
            "Iza, your dedication is unquestionable. The problem may be in the offer or the audience. In January, let's focus on quality, not quantity. Reduce posts if needed, but improve the copy and the offer. Use active prospecting to find patients with an immediate buying profile and higher ticket.",
        },
      },
      Élica: {
        dados: {
          faturamento: 20110.6,
          lucro: 10159.48,
          posts_feed: 3,
          stories: 196,
          leads: 12,
          procedimentos: 5,
        },
        score: 58.2,
        detalhes: {
          faturamento: {
            realizado: 20110.6,
            meta: 30000,
            percentual: 67.0,
            score: 26.8,
          },
          posts_feed: {
            realizado: 3,
            esperado: 12,
            percentual: 25.0,
            score: 3.8,
          },
          stories: {
            realizado: 196,
            esperado: 28,
            percentual: 700.0,
            score: 15,
          },
          procedimentos: {
            realizado: 5,
            esperado: 15,
            percentual: 33.3,
            score: 6.7,
          },
          leads: { realizado: 12, esperado: 20, percentual: 60.0, score: 6.0 },
        },
        classificacao: "Fair",
        feedback: {
          analise_dezembro:
            "Very high stories (196!), but revenue (R$ 20,110) and feed (3 posts) are unbalanced.",
          foco_janeiro: "Convert the stories audience into direct sales.",
          sugestao:
            "Elica, you have your audience's attention on stories; now charge for it! In January, be more direct with your offers. Less 'good morning' and more 'schedule open'. Use the question box to identify pain points and reach out via DM to book. The feed needs attention: 3 weekly posts so you don't depend only on existing followers.",
        },
      },
      Jayne: {
        dados: {
          faturamento: 4900.0,
          lucro: 0,
          posts_feed: 30,
          stories: 57,
          leads: 52,
          procedimentos: 4,
        },
        score: 51.9,
        detalhes: {
          faturamento: {
            realizado: 4900.0,
            meta: 30000,
            percentual: 16.3,
            score: 6.5,
          },
          posts_feed: {
            realizado: 30,
            esperado: 12,
            percentual: 250.0,
            score: 15,
          },
          stories: {
            realizado: 57,
            esperado: 28,
            percentual: 203.6,
            score: 15,
          },
          procedimentos: {
            realizado: 4,
            esperado: 15,
            percentual: 26.7,
            score: 5.3,
          },
          leads: { realizado: 52, esperado: 20, percentual: 260.0, score: 10 },
        },
        classificacao: "Fair",
        feedback: {
          analise_dezembro:
            "Many posts (30), many leads (52), but low revenue (R$ 4,900). Conversion problem.",
          foco_janeiro:
            "Total focus on sales and closing. Marketing is working; sales are not.",
          sugestao:
            "Jayne, you are attracting people (52 leads!), but you are not closing. Stop focusing only on attracting and focus on converting. In January, dedicate yourself to learning how to close sales. Reach out to those leads again, offer the strategic assessment, and practice your sales script. Your gold is in those unconverted contacts.",
        },
      },
      "Tamara Dilma": {
        dados: {
          faturamento: 18278.0,
          lucro: 3989.0,
          posts_feed: 23,
          stories: 0,
          leads: 0,
          procedimentos: 7,
        },
        score: 48.7,
        detalhes: {
          faturamento: {
            realizado: 18278.0,
            meta: 30000,
            percentual: 60.9,
            score: 24.4,
          },
          posts_feed: {
            realizado: 23,
            esperado: 12,
            percentual: 191.7,
            score: 15,
          },
          stories: { realizado: 0, esperado: 28, percentual: 0.0, score: 0.0 },
          procedimentos: {
            realizado: 7,
            esperado: 15,
            percentual: 46.7,
            score: 9.3,
          },
          leads: { realizado: 0, esperado: 20, percentual: 0.0, score: 0.0 },
        },
        classificacao: "Fair",
        feedback: {
          analise_dezembro:
            "Reasonable revenue (R$ 18,278) sustained by posts (23), but ZERO stories and leads.",
          foco_janeiro: "Show up on stories! It's impossible to scale without personal connection.",
          sugestao:
            "Tamara, your feed covers the basics, but the lack of stories (0) is leaving money on the table. In January, the goal is simple: show up on stories every day. Behind the scenes, coffee, questions. People buy from people. Start slowly, but start. This will unlock the next level of your revenue.",
        },
      },
    },
    ranking: [
      ["Thais Olimpia", 96.0],
      ["Ana Scaravate", 88.8],
      ["Lana Máximo", 87.8],
      ["Kleber Oliveira", 87.5],
      ["Alina Targino", 83.0],
      ["Tânia Cristina", 82.8],
      ["Mariana Guimarães", 80.8],
      ["Carmen", 77.5],
      ["Jéssica Sales", 77.2],
      ["Iza Pionório", 71.2],
      ["Élica", 58.2],
      ["Gabriela Santiago", 57.8],
      ["Jayne", 51.9],
      ["Tamara Dilma", 48.7],
    ],
    benchmarks: {
      meta_faturamento: 16000,
      posts_feed_min: 8,
      stories_min: 28,
      procedimentos_min: 5,
      leads_min: 20,
    },
  },
};
