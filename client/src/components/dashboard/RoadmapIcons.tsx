import {
  Brain,
  Calculator,
  Gavel,
  Handshake,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Rocket,
  Search,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import type React from "react";

export const getModuleIcon = (order: number, title: string) => {
  // Try to match based on title keywords first
  const lowerTitle = title.toLowerCase();

  // Phase 1: Fundamentals
  if (lowerTitle.includes("fundamentos")) return LayoutDashboard;
  if (lowerTitle.includes("fase 1")) return LayoutDashboard;

  // Phase 2: Positioning
  if (lowerTitle.includes("posicionamento")) return Target;
  if (lowerTitle.includes("fase 2")) return Target;

  // Phase 3: Marketing
  if (lowerTitle.includes("marketing")) return Megaphone;
  if (lowerTitle.includes("fase 3")) return Megaphone;

  // Phase 4: Sales
  if (lowerTitle.includes("vendas")) return Handshake;
  if (lowerTitle.includes("fase 4")) return Handshake;

  // Phase 5: Management
  if (lowerTitle.includes("gestão")) return Users;
  if (lowerTitle.includes("fase 5")) return Users;

  // Phase 6: Mindset
  if (lowerTitle.includes("mindset")) return Brain;
  if (lowerTitle.includes("fase 6")) return Brain;

  // Fallback keywords (legacy or specific activities)
  if (lowerTitle.includes("boas-vindas") || lowerTitle.includes("início")) return Handshake;
  if (lowerTitle.includes("jurídica") || lowerTitle.includes("contrato")) return Gavel;
  if (lowerTitle.includes("financeir") || lowerTitle.includes("dinheiro")) return Wallet;
  if (lowerTitle.includes("precificação") || lowerTitle.includes("preço")) return Calculator;
  if (lowerTitle.includes("estratégia") || lowerTitle.includes("planejamento")) return Target;
  if (lowerTitle.includes("crescimento") || lowerTitle.includes("escala")) return LineChart;
  if (lowerTitle.includes("diagnóstico") || lowerTitle.includes("análise")) return Search;

  // Fallback map based on typical order
  const iconMap: Record<number, React.ElementType> = {
    1: LayoutDashboard, // Fundamentals
    2: Target, // Positioning
    3: Megaphone, // Marketing
    4: Handshake, // Sales
    5: Users, // Management
    6: Brain, // Mindset
  };

  return iconMap[order] || Rocket;
};
