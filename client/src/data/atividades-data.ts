/**
 * Dados estáticos das atividades do PLAY NEON
 * Copiados do Notion para exibição no dashboard
 *
 * Para atualizar: edite este arquivo diretamente
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

export const ATIVIDADES: Atividade[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO 2 - ATIVIDADES PRIMORDIAIS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "primordial-checklist",
    titulo:
      "ATIVIDADE PRIMORDIAL: Checklist de Registro de Consultório e Abertura de Empresa (CNPJ)",
    etapa: "Módulo 2",
    icone: "📋",
    descricao:
      "Documentação necessária para registro de consultório de saúde e abertura de empresa.",
    steps: [
      { codigo: "doc-1", label: "Autorização do Corpo de Bombeiros" },
      { codigo: "doc-2", label: "Autorização da Vigilância Sanitária" },
      {
        codigo: "doc-3",
        label: "Pedido devidamente preenchido (pelo site da Vigilância)",
      },
      {
        codigo: "doc-4",
        label:
          "Cópia do Contrato Social da Empresa (Quando abre CNPJ - Contador)",
      },
      {
        codigo: "doc-5",
        label: "Cópia do CNPJ ou CPF — no caso de pessoa física",
      },
      {
        codigo: "doc-6",
        label: "Comprovante do recolhimento da taxa do serviço",
      },
      {
        codigo: "doc-7",
        label:
          "Cópia da Carteira Profissional emitida pelo Conselho de Classe do Responsável Técnico",
      },
      { codigo: "doc-8", label: "Declaração do horário de funcionamento" },
      { codigo: "doc-9", label: "Croqui de localização" },
      {
        codigo: "doc-10",
        label:
          "Relação dos procedimentos técnicos a serem executados no estabelecimento",
      },
      { codigo: "doc-11", label: "PGRS" },
      {
        codigo: "doc-12",
        label: "Registro do Consultório enquanto pessoa jurídica (Cartão CNPJ)",
      },
      { codigo: "doc-13", label: "Alvará de Funcionamento da Prefeitura" },
      {
        codigo: "doc-14",
        label:
          "Cadastro no CNES (registro obrigatório para estabelecimentos de saúde)",
      },
    ],
  },
  {
    codigo: "primordial-organizacao",
    titulo: "ATIVIDADE PRIMORDIAL: Organização - Agendas e Tarefas",
    etapa: "Módulo 2",
    icone: "📅",
    descricao:
      "Organize sua agenda e sistema de tarefas para máxima produtividade.",
    steps: [
      {
        codigo: "org-1",
        label: "Escolher ferramenta de agenda (Google Calendar, Notion, etc)",
      },
      {
        codigo: "org-2",
        label: "Configurar blocos de tempo para atendimentos",
      },
      {
        codigo: "org-3",
        label: "Definir horários para tarefas administrativas",
      },
      { codigo: "org-4", label: "Criar sistema de lembretes" },
      { codigo: "org-5", label: "Configurar automações de confirmação" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ATIVIDADES NUMERADAS (01-12)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "atividade-01",
    titulo: "Atividade 01 - Análise da BIO do Instagram",
    etapa: "Posicionamento",
    icone: "📱",
    descricao: "Otimize sua bio do Instagram para atrair mais pacientes.",
    steps: [
      { codigo: "bio-1", label: "Definir proposta de valor clara" },
      { codigo: "bio-2", label: "Incluir especialidade principal" },
      { codigo: "bio-3", label: "Adicionar localização" },
      { codigo: "bio-4", label: "Incluir CTA (chamada para ação)" },
      { codigo: "bio-5", label: "Configurar link na bio (Linktree, etc)" },
    ],
  },
  {
    codigo: "atividade-02",
    titulo: "Atividade 02 - Análise do Perfil Comportamental",
    etapa: "Autoconhecimento",
    icone: "🧠",
    descricao: "Entenda seu perfil comportamental para melhorar comunicação.",
    steps: [
      { codigo: "perfil-1", label: "Realizar teste DISC" },
      { codigo: "perfil-2", label: "Analisar pontos fortes" },
      { codigo: "perfil-3", label: "Identificar pontos de melhoria" },
      { codigo: "perfil-4", label: "Definir estratégias de comunicação" },
    ],
  },
  {
    codigo: "atividade-03",
    titulo: "Atividade 03 - Devolutiva da 1a CALL",
    etapa: "Mentoria",
    icone: "📞",
    descricao: "Preparação e acompanhamento da primeira call de mentoria.",
    steps: [
      { codigo: "call-1", label: "Preparar dúvidas para a call" },
      { codigo: "call-2", label: "Definir objetivos da mentoria" },
      { codigo: "call-3", label: "Registrar insights da call" },
      { codigo: "call-4", label: "Criar plano de ação pós-call" },
    ],
  },
  {
    codigo: "atividade-04",
    titulo: "Atividade 04 - Onde ESTOU e Onde QUERO CHEGAR?",
    etapa: "Planejamento",
    icone: "🎯",
    descricao: "Defina sua situação atual e objetivos futuros.",
    steps: [
      { codigo: "onde-1", label: "Mapear situação financeira atual" },
      { codigo: "onde-2", label: "Definir faturamento desejado em 12 meses" },
      { codigo: "onde-3", label: "Listar obstáculos atuais" },
      { codigo: "onde-4", label: "Definir recursos necessários" },
      { codigo: "onde-5", label: "Criar timeline de metas" },
    ],
  },
  {
    codigo: "atividade-05",
    titulo: "Atividade 05 - Traçando Metas",
    etapa: "Planejamento",
    icone: "📊",
    descricao: "Defina metas SMART para seu negócio.",
    steps: [
      { codigo: "meta-1", label: "Definir meta de faturamento mensal" },
      { codigo: "meta-2", label: "Definir meta de leads mensais" },
      { codigo: "meta-3", label: "Definir meta de procedimentos" },
      { codigo: "meta-4", label: "Definir meta de conteúdo (posts/stories)" },
      { codigo: "meta-5", label: "Validar metas com mentor" },
    ],
  },
  {
    codigo: "atividade-06",
    titulo: "Atividade 06 - Mural da Vida Extraordinária (R)",
    etapa: "Mindset",
    icone: "✨",
    descricao: "Crie seu mural de visualização de vida extraordinária.",
    steps: [
      { codigo: "mural-1", label: "Definir visão de vida ideal" },
      { codigo: "mural-2", label: "Coletar imagens inspiradoras" },
      { codigo: "mural-3", label: "Montar o mural físico ou digital" },
      { codigo: "mural-4", label: "Posicionar em local visível" },
    ],
  },
  {
    codigo: "atividade-07",
    titulo: "Atividade 07 - Caderno da Gratidão (R)",
    etapa: "Mindset",
    icone: "🙏",
    descricao: "Pratique gratidão diária para mindset positivo.",
    steps: [
      { codigo: "grat-1", label: "Escolher caderno/app para registros" },
      { codigo: "grat-2", label: "Definir horário diário para prática" },
      { codigo: "grat-3", label: "Registrar 3 gratidões por dia por 1 semana" },
      { codigo: "grat-4", label: "Refletir sobre impactos na semana" },
    ],
  },
  {
    codigo: "atividade-08",
    titulo: "Atividade 08 - Em qual Nicho desejo ATUAR?",
    etapa: "Posicionamento",
    icone: "🔍",
    descricao: "Defina seu nicho de atuação principal.",
    steps: [
      { codigo: "nicho-1", label: "Listar áreas de interesse" },
      { codigo: "nicho-2", label: "Analisar demanda de mercado" },
      { codigo: "nicho-3", label: "Avaliar concorrência" },
      { codigo: "nicho-4", label: "Definir nicho principal" },
      { codigo: "nicho-5", label: "Criar posicionamento diferenciado" },
    ],
  },
  {
    codigo: "atividade-09",
    titulo: "Atividade 09 - Criando/Validando sua PERSONA",
    etapa: "Posicionamento",
    icone: "👤",
    descricao: "Defina seu cliente ideal (persona).",
    steps: [
      { codigo: "persona-1", label: "Definir dados demográficos" },
      { codigo: "persona-2", label: "Mapear dores e desejos" },
      { codigo: "persona-3", label: "Identificar objeções comuns" },
      { codigo: "persona-4", label: "Definir onde a persona está (canais)" },
      { codigo: "persona-5", label: "Validar persona com clientes reais" },
    ],
  },
  {
    codigo: "atividade-10",
    titulo: "Atividade 10 - Mapeando Posicionamento Estratégico",
    etapa: "Posicionamento",
    icone: "🗺️",
    descricao: "Defina seu posicionamento estratégico no mercado.",
    steps: [
      { codigo: "pos-1", label: "Analisar concorrentes diretos" },
      { codigo: "pos-2", label: "Identificar diferenciais competitivos" },
      { codigo: "pos-3", label: "Definir proposta única de valor" },
      { codigo: "pos-4", label: "Criar mensagem de posicionamento" },
    ],
  },
  {
    codigo: "atividade-11",
    titulo: "Atividade 11 - PLANILHAS: Faturamentos Mensais",
    etapa: "Gestão",
    icone: "📈",
    descricao: "Configure suas planilhas de controle financeiro.",
    steps: [
      { codigo: "plan-1", label: "Baixar planilha modelo" },
      { codigo: "plan-2", label: "Configurar categorias de receita" },
      { codigo: "plan-3", label: "Configurar categorias de despesa" },
      { codigo: "plan-4", label: "Lançar dados do mês atual" },
      { codigo: "plan-5", label: "Analisar indicadores" },
    ],
  },
  {
    codigo: "atividade-12",
    titulo: "Atividade 12 - VENDA é energia e BASE do seu negócio",
    etapa: "Vendas",
    icone: "💰",
    descricao: "Desenvolva mentalidade e técnicas de vendas.",
    steps: [
      { codigo: "venda-1", label: "Estudar técnicas de vendas consultivas" },
      { codigo: "venda-2", label: "Criar script de abordagem" },
      { codigo: "venda-3", label: "Praticar contorno de objeções" },
      { codigo: "venda-4", label: "Definir processo de follow-up" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ROTINEIRO E ESTRATÉGIAS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    codigo: "rotineiro-leitura",
    titulo: "ROTINEIRO (R) DE LEITURA",
    etapa: "Hábitos",
    icone: "📚",
    descricao: "Desenvolva o hábito de leitura diária.",
    steps: [
      { codigo: "leit-1", label: "Escolher livro da lista recomendada" },
      { codigo: "leit-2", label: "Definir meta de páginas/dia" },
      { codigo: "leit-3", label: "Reservar horário fixo para leitura" },
      { codigo: "leit-4", label: "Registrar insights em caderno" },
    ],
  },
  {
    codigo: "estrategia-conteudo",
    titulo: "ESTRATÉGIA - PRODUÇÃO DE CONTEÚDO (R)",
    etapa: "Marketing",
    icone: "📝",
    descricao: "Crie sua estratégia de produção de conteúdo.",
    steps: [
      { codigo: "cont-1", label: "Definir pilares de conteúdo" },
      { codigo: "cont-2", label: "Criar calendário editorial" },
      { codigo: "cont-3", label: "Produzir batch de conteúdos" },
      { codigo: "cont-4", label: "Agendar publicações" },
      { codigo: "cont-5", label: "Analisar métricas semanalmente" },
    ],
  },
  {
    codigo: "estrategia-audiencia",
    titulo: "ESTRATÉGIA - META abrindo para Audiência (R)",
    etapa: "Marketing",
    icone: "📣",
    descricao: "Estratégias para aumentar sua audiência.",
    steps: [
      { codigo: "aud-1", label: "Definir meta de seguidores" },
      { codigo: "aud-2", label: "Implementar estratégia de hashtags" },
      { codigo: "aud-3", label: "Criar parcerias estratégicas" },
      { codigo: "aud-4", label: "Investir em tráfego pago (opcional)" },
    ],
  },
  {
    codigo: "estrategia-follow",
    titulo: "ESTRATÉGIA - Cadência de Follow e Script de Vendas (R)",
    etapa: "Vendas",
    icone: "🔄",
    descricao: "Crie seu processo de follow-up e scripts.",
    steps: [
      { codigo: "follow-1", label: "Definir cadência de follow-up" },
      { codigo: "follow-2", label: "Criar templates de mensagens" },
      { codigo: "follow-3", label: "Configurar automação de lembretes" },
      { codigo: "follow-4", label: "Criar script de fechamento" },
    ],
  },
  {
    codigo: "estrategia-analise",
    titulo: "ESTRATÉGIA - ANÁLISE MENSAL DE CAPTAÇÃO E VENDAS (R)",
    etapa: "Gestão",
    icone: "📊",
    descricao: "Análise mensal de resultados de captação e vendas.",
    steps: [
      { codigo: "analise-1", label: "Compilar dados do mês" },
      { codigo: "analise-2", label: "Calcular taxa de conversão" },
      { codigo: "analise-3", label: "Identificar gargalos no funil" },
      { codigo: "analise-4", label: "Definir ajustes para próximo mês" },
      { codigo: "analise-5", label: "Registrar aprendizados" },
    ],
  },
];

/**
 * Agrupa atividades por etapa
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
 * Calcula progresso total dado um mapa de progresso
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
