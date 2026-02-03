# PLAN-atividades-mentorado-v2: Reestruturação das Atividades do Dashboard

> **Goal:** Analisar, consolidar e aprimorar as atividades do dashboard do mentorado com base na persona NEON e nas maiores dores de profissionais de estética.

---

## 0. Research Findings

### Persona NEON (site neon.drasacha.com.br)

| Aspecto | Descrição |
|---------|-----------|
| **Público** | Profissionais de saúde/estética (biomédicos, esteticistas, enfermeiros) |
| **Duração** | 6 meses de mentoria Black |
| **Entregáveis** | Calls individuais, análise financeira, Raio-X mensal, tutorias marketing/vendas, Divã (psicóloga), Tim-Tim (networking), viagem de celebração |
| **Investimento** | R$ 20.000 à vista ou 12x R$ 1.667,98 |
| **Proposta** | "Decidiram Brilhar Até no Escuro" - profissionais prontas para escalar |

### Maiores Dores de Profissionais de Estética

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | **Gestão do tempo e agenda desorganizada** - Fluxo constante de pacientes sem sistema | 5/5 | Graces, IdealOdonto | Alto |
| 2 | **Dificuldade em captar e converter leads** - Instagram/WhatsApp sem estratégia | 5/5 | Consentz, Agencia10x | Crítico |
| 3 | **Falta de controle financeiro** - Não separa PF de PJ, sem fluxo de caixa | 5/5 | Graces, ORVI | Alto |
| 4 | **Precificação errada** - Cobram muito barato, sem margem de lucro | 5/5 | ORVI Health | Alto |
| 5 | **Ausência de SOPs** - Cada atendimento é diferente, sem padronização | 4/5 | IdealOdonto | Médio |
| 6 | **Pós-atendimento fraco** - Não fazem follow-up, perdem clientes | 5/5 | Graces, Agencia10x | Crítico |
| 7 | **Marketing digital ineficiente** - Posts sem estratégia, sem métricas | 5/5 | Consentz, Nuvolum | Alto |
| 8 | **Falta de clareza sobre KPIs** - Não sabem o que medir | 4/5 | SEBRAE, IdealOdonto | Médio |
| 9 | **Legalização incompleta** - CNPJ, alvará, vigilância sanitária pendentes | 5/5 | Conta4, ORVI | Alto |
| 10 | **Burnout e mindset limitante** - Trabalham demais sem equilíbrio | 4/5 | NEON site (Divã) | Alto |

### Análise das Atividades Atuais

**Total atual:** 24 atividades em `client/src/data/atividades-data.ts`

#### Redundâncias Identificadas

| Atividade 1 | Atividade 2 | Problema |
|-------------|-------------|----------|
| `m1-juridico` | `primordial-checklist` | Ambas cobrem documentação legal/CNPJ |
| `m1-diagnostico` | `atividade-04` | Ambas mapeiam situação atual vs. desejada |
| `m1-financeiro` | `atividade-11` | Ambas tratam de planilhas/fluxo de caixa |
| `m2-kpis` | `estrategia-analise` | Ambas focam em métricas e análise mensal |
| `atividade-01` | `estrategia-conteudo` | Instagram + conteúdo separados sem necessidade |

#### Lacunas Críticas (Atividades que FALTAM)

| Lacuna | Por que é crítica | Proposta |
|--------|-------------------|----------|
| **WhatsApp Business** | Principal canal de vendas, só mencionado superficialmente | Nova atividade completa |
| **Jornada do Paciente** | Experiência pré/durante/pós atendimento não coberta | Nova atividade |
| **Tráfego Pago** | Mencionado como "opcional", mas é essencial em 2024+ | Nova atividade fundamentos |
| **Saúde Mental** | NEON tem "Divã" mas dashboard não cobre burnout | Nova atividade |

---

## 1. User Review Required

> [!IMPORTANT]
> **Decisão crítica sobre estrutura das fases:**
> A proposta reorganiza as 24 atividades em 6 FASES sequenciais ao invés dos atuais "Módulos" desconectados. Isso muda a progressão lógica do mentorado.

> [!WARNING]
> **Impacto no banco de dados:**
> Se mentorados já possuem progresso salvo com códigos antigos (`m1-juridico`, etc.), precisaremos de migração para novos códigos ou mapeamento de compatibilidade.

> [!CAUTION]
> **Conteúdo detalhado dos steps:**
> Cada step terá descrição expandida com passo a passo. Isso aumenta significativamente o tamanho do arquivo `atividades-data.ts`. Confirme se isso é desejado.

### Perguntas para Validação

1. **Manter códigos antigos ou criar novos?** (Ex: `m1-juridico` → `f1-legalizacao`)
2. **Adicionar campo `ferramentas: string[]` nas atividades?**
3. **Adicionar campo `metricaSucesso: string` em cada atividade?**
4. **Ordem das 6 fases está correta para a jornada NEON?**

---

## 2. Proposed Changes

### Nova Estrutura: 6 Fases + 25 Atividades

---

#### FASE 1: FUNDAMENTOS (Semanas 1-4)

##### [MODIFY] `atividades-data.ts` - Consolidar Legalização

**Antes:** `m1-juridico` (5 steps) + `primordial-checklist` (14 steps) = 19 steps redundantes

**Depois:** "Legalização Completa do Negócio" (12 steps otimizados)

**Arquivo:** [atividades-data.ts](file:///home/mauricio/neondash/client/src/data/atividades-data.ts)

---

#### FASE 3: MARKETING DIGITAL (Semanas 9-12)

##### [NEW] Instagram Profissional

Atividade completamente nova consolidando Instagram + Conteúdo + Audiência:

**11 steps abrangentes:**
1. Converter para conta profissional
2. Otimizar bio com método AIDA
3. Definir 3-5 pilares de conteúdo
4. Criar calendário editorial de 30 dias
5. Preparar batch de 10 conteúdos
6. Configurar ferramentas de agendamento
7. Implementar rotina de stories diários
8. Criar primeiro Reels com hook forte
9. Configurar destaques organizados
10. Estabelecer rotina de engajamento (30min/dia)
11. Acompanhar métricas semanalmente

##### [NEW] Tráfego Pago Fundamentos

**6 steps:**
1. Criar Gerenciador de Negócios do Facebook
2. Configurar Pixel do Meta
3. Definir público-alvo inicial
4. Criar primeira campanha de engajamento
5. Analisar resultados e ajustar
6. Escalar para campanha de leads/mensagens

---

#### FASE 4: VENDAS E ATENDIMENTO (Semanas 13-16)

##### [NEW] WhatsApp Business Estratégico

**8 steps:**
1. Migrar para WhatsApp Business
2. Configurar perfil comercial completo
3. Criar catálogo de serviços
4. Configurar mensagem de saudação automática
5. Configurar mensagem de ausência
6. Criar etiquetas de organização
7. Preparar templates de respostas rápidas
8. Definir regra de resposta (máximo 1h útil)

##### [NEW] Jornada WOW do Paciente

**9 steps:**
1. Mapear jornada atual (as-is)
2. Criar script de primeira abordagem
3. Implementar confirmação 24h antes
4. Enviar orientações pré-procedimento
5. Criar 'momento WOW' durante atendimento
6. Acompanhamento 24h pós-procedimento
7. Acompanhamento 7 dias pós
8. Implementar reativação 60-90 dias
9. Criar programa de indicações

---

#### FASE 6: MINDSET E ROTINAS (Contínuo)

##### [NEW] Saúde Mental do Empreendedor

**7 steps:**
1. Reconhecer sinais de esgotamento
2. Definir horários de trabalho e respeitar
3. Criar ritual de desconexão diária
4. Estabelecer 1 dia de folga sagrado
5. Criar rede de apoio
6. Praticar exercício físico regular
7. Implementar pausas estratégicas durante o dia

---

## 3. Atomic Implementation Tasks

### AT-001: Atualizar Interfaces TypeScript

**Goal:** Adicionar campo `descricao` opcional nos steps
**Dependencies:** Nenhuma

#### Subtasks:
- [ ] ST-001.1: Adicionar `descricao?: string` na interface `AtividadeStep`
  - **File:** `client/src/data/atividades-data.ts`
  - **Validation:** `bun run check` passa sem erros

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-002: Consolidar Atividades Redundantes ⚡

**Goal:** Reduzir 6 pares de atividades redundantes
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Consolidar atividades jurídicas → `f1-legalizacao`
- [ ] ST-002.2: Consolidar atividades diagnóstico → `f1-diagnostico`
- [ ] ST-002.3: Consolidar atividades financeiras → `f1-financas`
- [ ] ST-002.4: Consolidar atividades KPIs → `f5-dashboard`
- [ ] ST-002.5: Consolidar atividades Instagram → `f3-instagram`
- [ ] ST-002.6: Consolidar atividades posicionamento → `f2-posicionamento`

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-003: Adicionar Novas Atividades Críticas ⚡

**Goal:** Adicionar 4 atividades que preenchem lacunas
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-003.1: Adicionar "WhatsApp Business Estratégico" (`f4-whatsapp`)
- [ ] ST-003.2: Adicionar "Jornada WOW do Paciente" (`f4-jornada`)
- [ ] ST-003.3: Adicionar "Tráfego Pago Fundamentos" (`f3-trafego`)
- [ ] ST-003.4: Adicionar "Saúde Mental do Empreendedor" (`f6-saude-mental`)

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-004: Atualizar Etapas para 6 Fases

**Goal:** Renomear etapas de "Módulo X" para "Fase X: Nome"
**Dependencies:** AT-002, AT-003

#### Subtasks:
- [ ] ST-004.1: Atualizar campo `etapa` de todas as atividades
- [ ] ST-004.2: Atualizar função `getEtapaColor()` com novas cores

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-005: Expandir Descrições dos Steps

**Goal:** Adicionar `descricao` detalhada aos steps
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-005.1: Descrições Fase 1
- [ ] ST-005.2: Descrições Fase 2
- [ ] ST-005.3: Descrições Fase 3-6

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-006: Atualizar UI para Mostrar Descrições

**Goal:** Exibir descrições dos steps no componente
**Dependencies:** AT-005

#### Subtasks:
- [ ] ST-006.1: Adicionar tooltip ou expand com descrição
  - **File:** `client/src/components/dashboard/AtividadesContent.tsx`
- [ ] ST-006.2: Testar responsividade

**Rollback:** `git checkout client/src/components/dashboard/AtividadesContent.tsx`

---

### AT-007: Migração de Progresso (se necessário)

**Goal:** Mapear códigos antigos para novos
**Dependencies:** AT-002, AT-003, AT-004

#### Subtasks:
- [ ] ST-007.1: Criar script de migração
- [ ] ST-007.2: Validar progresso existente

**Rollback:** Restore from backup

---

## 4. Verification Plan

### Automated Tests
```bash
bun run check     # TypeScript validation
bun run lint      # Linting
bun test          # Unit tests
```

### Manual Verification
- [ ] Navegar para /dashboard/atividades
- [ ] Verificar 6 fases visíveis
- [ ] Verificar novas atividades
- [ ] Expandir step e verificar descrição
- [ ] Marcar step e verificar persistência

---

## 5. Rollback Plan

```bash
git checkout client/src/data/atividades-data.ts
git checkout client/src/components/dashboard/AtividadesContent.tsx
```

---

## Resumo de Mudanças

| Antes | Depois |
|-------|--------|
| 24 atividades | 25 atividades (mais focadas) |
| Módulos desconectados | 6 Fases sequenciais |
| 6 pares redundantes | Consolidadas |
| 4 lacunas críticas | 4 novas atividades |
| Steps genéricos | Steps com descrição passo a passo |

---

## Próximos Passos

1. **Revisar este plano** e responder às perguntas de validação
2. **Executar** `/implement` para aplicar as mudanças
3. **Testar** a nova experiência no dashboard
