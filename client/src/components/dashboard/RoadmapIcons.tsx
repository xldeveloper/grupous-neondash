import {
  Briefcase,
  Calculator,
  Gavel,
  Handshake,
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

  if (lowerTitle.includes("boas-vindas") || lowerTitle.includes("início")) return Handshake;
  if (lowerTitle.includes("jurídica") || lowerTitle.includes("contrato")) return Gavel;
  if (lowerTitle.includes("financeir") || lowerTitle.includes("dinheiro")) return Wallet;
  if (lowerTitle.includes("precificação") || lowerTitle.includes("preço")) return Calculator;
  if (lowerTitle.includes("equipe") || lowerTitle.includes("gestão")) return Users;
  if (lowerTitle.includes("marketing") || lowerTitle.includes("vendas")) return Megaphone;
  if (lowerTitle.includes("estratégia") || lowerTitle.includes("planejamento")) return Target;
  if (lowerTitle.includes("crescimento") || lowerTitle.includes("escala")) return LineChart;
  if (lowerTitle.includes("diagnóstico") || lowerTitle.includes("análise")) return Search;

  // Fallback map based on typical order
  const iconMap: Record<number, React.ElementType> = {
    1: Handshake,
    2: Gavel,
    3: Wallet,
    4: Calculator,
    5: Users,
    6: Megaphone,
    7: Target,
    8: Briefcase,
    9: LineChart,
    10: Rocket,
  };

  return iconMap[order] || Rocket;
};
