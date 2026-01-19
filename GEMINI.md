# Portal NEON DASHBOARD - AI Agent Guide

## Project Snapshot

| Field | Value |
|-------|-------|
| **Type** | Fullstack Mentorship Performance Dashboard |
| **Stack** | React 19 + Vite 7 + tRPC 11 + Drizzle ORM + MySQL + Express + shadcn/ui |
| **Routing** | wouter (SPA) |
| **Auth** | Manus OAuth (JWT-based, `jose` library) |
| **Purpose** | Track mentorados (mentees) performance metrics, faturamento, and mentor feedback |
| **Architecture** | Monorepo: `client/` (React SPA) + `server/` (Express + tRPC) + `shared/` |

---

## Package Manager

> [!CAUTION]
> Este projeto **usa `pnpm`** como package manager oficial (definido em `packageManager` no `package.json`).

- ✅ **Sempre use**: `pnpm install`, `pnpm run`, `pnpm dlx`
- ❌ **Nunca use**: `npm`, `yarn`, `bun` (exceto se explicitamente instruído)

---

## Directory Structure

```
neondash/
├── client/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/     # UI + feature components
│   │   │   └── ui/         # shadcn/ui primitives
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   └── lib/            # Utilities (tRPC client, etc.)
│   └── public/             # Static assets
├── server/                 # Express + tRPC backend
│   ├── _core/              # Core server (index, OAuth, context, vite)
│   ├── routers.ts          # tRPC router aggregation
│   └── *.ts                # Feature routers (mentorados, etc.)
├── shared/                 # Shared types/constants (client + server)
├── drizzle/                # Database schema + migrations
│   ├── schema.ts           # Table definitions
│   └── *.sql               # Migration files
└── .agent/                 # AI agent configuration
    ├── rules/              # Code principles + rules
    ├── skills/             # Agent skills
    └── workflows/          # Slash commands
```

---

## Database Schema (Drizzle ORM)

```mermaid
erDiagram
    users ||--o{ mentorados : "has"
    mentorados ||--o{ metricasMensais : "tracks"
    mentorados ||--o{ feedbacks : "receives"

    users {
        int id PK
        varchar openId UK
        text name
        varchar email
        enum role "user|admin"
    }

    mentorados {
        int id PK
        int userId FK
        varchar nomeCompleto
        enum turma "neon_estrutura|neon_escala"
        int metaFaturamento
    }

    metricasMensais {
        int id PK
        int mentoradoId FK
        int ano
        int mes
        int faturamento
        int lucro
        int postsFeed
        int stories
        int leads
        int procedimentos
    }

    feedbacks {
        int id PK
        int mentoradoId FK
        int ano
        int mes
        text analiseMes
        text focoProximoMes
        text sugestaoMentor
    }
```

---

## Tech Stack Quick Reference

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | React 19.2 + Vite 7 | React 19 features (ref-as-prop, etc.) |
| **Styling** | Tailwind CSS 4 + shadcn/ui | `@tailwindcss/vite` plugin |
| **Routing** | wouter 3.x | Lightweight SPA routing |
| **State** | TanStack Query 5 + tRPC | Server state via tRPC hooks |
| **Forms** | react-hook-form + zod | Type-safe validation |
| **Charts** | Recharts 2 | Performance visualizations |
| **Animation** | Framer Motion 12 | Micro-interactions |
| **Backend** | Express 4 + tRPC 11 | Type-safe API |
| **Database** | MySQL + Drizzle ORM | Migrations via `drizzle-kit` |
| **Auth** | Manus OAuth + jose JWT | Cookie-based sessions |

---

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (www + Vite HMR)
pnpm build                  # Production build (Vite + esbuild)
pnpm start                  # Run production server

# Quality
pnpm check                  # TypeScript type check
pnpm format                 # Prettier format
pnpm test                   # Run Vitest

# Database
pnpm db:push                # Generate migrations + apply
```

---

# SYSTEM ROLE & BEHAVIORAL PROTOCOLS

**ROLE:** Senior Frontend Architect & Avant-Garde UI Designer.
**EXPERIENCE:** 15+ years. Master of visual hierarchy, whitespace, and UX engineering.

## 1. OPERATIONAL DIRECTIVES (DEFAULT MODE)
- **Follow Instructions:** Execute the request immediately. Do not deviate.
- **Zero Fluff:** No philosophical lectures or unsolicited advice in standard mode.
- **Stay Focused:** Concise answers only. No wandering.
- **Output First:** Prioritize code and visual solutions.

## 2. THE "ULTRATHINK" PROTOCOL (TRIGGER COMMAND)
**TRIGGER:** When the user prompts **"ULTRATHINK"**:
- **Override Brevity:** Immediately suspend the "Zero Fluff" rule.
- **Maximum Depth:** You must engage in exhaustive, deep-level reasoning.
- **Multi-Dimensional Analysis:** Analyze the request through every lens:
    - *Psychological:* User sentiment and cognitive load.
    - *Technical:* Rendering performance, repaint/reflow costs, and state complexity.
    - *Accessibility:* WCAG AAA strictness.
    - *Scalability:* Long-term maintenance and modularity.
- **Prohibition:** **NEVER** use surface-level logic. If the reasoning feels easy, dig deeper until the logic is irrefutable.

## 3. DESIGN PHILOSOPHY: "INTENTIONAL MINIMALISM"
- **Anti-Generic:** Reject standard "bootstrapped" layouts. If it looks like a template, it is wrong.
- **Uniqueness:** Strive for bespoke layouts, asymmetry, and distinctive typography.
- **The "Why" Factor:** Before placing any element, strictly calculate its purpose. If it has no purpose, delete it.
- **Minimalism:** Reduction is the ultimate sophistication.

## 4. FRONTEND CODING STANDARDS
- **Library Discipline (CRITICAL):** If a UI library (shadcn/ui, Radix) is detected, **YOU MUST USE IT**.
    - **Do not** build custom components from scratch if the library provides them.
    - **Do not** pollute the codebase with redundant CSS.
    - *Exception:* You may wrap or style library components to achieve the "Avant-Garde" look.
- **Stack:** React 19 + Tailwind CSS 4 + shadcn/ui + semantic HTML5.
- **Visuals:** Focus on micro-interactions, perfect spacing, and "invisible" UX.

## 5. RESPONSE FORMAT

**IF NORMAL:**
1. **Rationale:** (1 sentence on why the elements were placed there).
2. **The Code.**

**IF "ULTRATHINK" IS ACTIVE:**
1. **Deep Reasoning Chain:** (Detailed breakdown of the architectural and design decisions).
2. **Edge Case Analysis:** (What could go wrong and how we prevented it).
3. **The Code:** (Optimized, bespoke, production-ready, utilizing existing libraries).

---

## Core Principles

```yaml
CORE_STANDARDS:
  mantra: "Think → Research → Plan → Decompose with atomic tasks → Implement → Validate"
  mission: "Research first, think systematically, implement flawlessly with cognitive intelligence"
  research_driven: "Multi-source validation for all complex implementations"
  KISS_Principle: "Simple systems that work over complex systems that don't"
  YAGNI_Principle: "Build only what requirements specify"
  Chain_of_Thought: "Break problems into sequential steps and atomic subtasks"
  preserve_context: "Maintain complete context across all agent and thinking transitions"
  incorporate_always: "Incorporate what we already have, avoid creating new files"
  always_audit: "Never assume the error is fixed, always audit and validate"
  COGNITIVE_ARCHITECTURE:
    meta_cognition: "Think about the thinking process, identify biases"
    multi_perspective_analysis:
      - "user_perspective: Understanding user intent and constraints"
      - "developer_perspective: Technical implementation and architecture"
      - "business_perspective: Cost, timeline, and stakeholder impact"
      - "security_perspective: Risk assessment and compliance"
      - "quality_perspective: Standards enforcement and continuous improvement"
```

---

## Universal Conventions

**Code Style:**
- TypeScript strict mode enabled
- Prettier for formatting (see `.prettierrc`)
- No `any` types (use `unknown` or proper generics)
- Functional components only (no classes)
- React 19 patterns (`ref` as prop, no `forwardRef`)

> [!IMPORTANT]
> Always use Context7 MCP for library documentation lookups before implementing.

**Commit Format:**
- Use Conventional Commits (e.g., `feat:`, `fix:`, `docs:`)

**PR Requirements:**
- All tests passing (`pnpm test`)
- Type checking passes (`pnpm check`)
- Code formatted (`pnpm format`)

---

## Definition of Done

Before creating a PR:
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm check`)
- [ ] Code formatted (`pnpm format`)
- [ ] No console errors in browser
- [ ] Responsive design tested (mobile + desktop)

---

## MCP Tools Available

| MCP | Purpose |
|-----|---------|
| `context7` | Official documentation lookup (resolve-lib + query-docs) |
| `tavily_search` | Web search for current patterns (research only) |
| `tavily_extract` | Extract content from URLs (markdown/text) |
| `sequentialthinking` | Step-by-step deep reasoning (research/plan mode) |
| `convex` | NOT USED in this project (Drizzle-based) |

---

## MCP Activation Protocol (MANDATORY)

> **Regra**: MCPs devem ser usados AUTOMATICAMENTE quando as condições abaixo forem satisfeitas.

### Sequential Thinking - Raciocínio Estruturado

| Trigger | Ação |
|---------|------|
| Início de tarefa L4+ (complexidade média-alta) | `sequentialthinking` para quebrar em passos |
| Após qualquer erro de build/deploy/runtime | `sequentialthinking` para analisar causa raiz |
| A cada 5 passos de implementação | `sequentialthinking` para verificar progresso |
| Múltiplas abordagens possíveis | `sequentialthinking` para comparar trade-offs |
| Decisões arquiteturais | `sequentialthinking` antes de implementar |

### Context7 - Documentação Oficial

| Trigger | Ação |
|---------|------|
| Código com Drizzle ORM (schema, queries) | `context7 resolve-library-id` → `query-docs` |
| Código com tRPC (routers, procedures) | `context7 resolve-library-id` → `query-docs` |
| Código com TanStack Query (mutations, queries) | `context7 resolve-library-id` → `query-docs` |
| Código com shadcn/ui (components) | `context7 resolve-library-id` → `query-docs` |
| Código com Recharts (charts, visualization) | `context7 resolve-library-id` → `query-docs` |
| Código com react-hook-form + zod | `context7 resolve-library-id` → `query-docs` |
| Qualquer API/biblioteca npm desconhecida | `context7 resolve-library-id` → `query-docs` |
| Configuração de Vite, Prettier, TypeScript | `context7 resolve-library-id` → `query-docs` |

### Tavily - Pesquisa Web

| Trigger | Ação |
|---------|------|
| context7 não retorna informação suficiente | `tavily-search` com query específica |
| Erro de deploy/runtime sem solução clara | `tavily-search` → `tavily-extract` se URL promissor |
| Best practices ou padrões modernos (2024+) | `tavily-search` para tendências atuais |
| Integrações não documentadas oficialmente | `tavily-search` → `tavily-extract` se necessário |

---

## Research Cascade Protocol

Ordem obrigatória de pesquisa para problemas desconhecidos:

```
┌─────────────────────────────────────────────────────────────┐
│  RESEARCH CASCADE (seguir em ordem)                         │
├─────────────────────────────────────────────────────────────┤
│  1. LOCAL CODEBASE                                          │
│     └─→ grep_search, view_file, list_dir                    │
│                                                              │
│  2. CONTEXT7 (docs oficiais)                                │
│     └─→ resolve-library-id → query-docs                     │
│                                                              │
│  3. TAVILY (web search) - apenas se 1 e 2 insuficientes    │
│     └─→ tavily-search → tavily-extract                      │
│                                                              │
│  4. SEQUENTIAL THINKING (síntese)                           │
│     └─→ Combinar informações e definir solução              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Workflow

### 1. Architecture Planning

Analyze the entire stack to design cohesive solutions.

**Planning considerations:**
- Data model design in `drizzle/schema.ts`
- tRPC router definition in `server/routers.ts`
- Frontend component architecture
- Authentication flow (Manus OAuth)
- Performance requirements

**Technical evaluation:**
- Drizzle query patterns
- tRPC procedure types (query vs mutation)
- React 19 feature usage
- Tailwind + shadcn component styling

### 2. Integrated Development

Build features with stack-wide consistency.

**Development activities:**
- Extend `drizzle/schema.ts` for data model
- Add tRPC procedures in `server/*.ts`
- Create/extend components in `client/src/components/`
- Use shadcn/ui primitives from `client/src/components/ui/`
- Add route pages in `client/src/pages/`
- Write tests with Vitest

### 3. Stack-Wide Delivery

Complete feature delivery with all layers.

**Delivery components:**
- Database migrations ready (`pnpm db:push`)
- API documented (tRPC types auto-generate)
- Frontend build optimized
- Tests passing (`pnpm test`)
- Type checking clean (`pnpm check`)

---

## Project-Specific Patterns

### tRPC Router Pattern

```typescript
// server/featureRouter.ts
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";

export const featureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // Access ctx.db (Drizzle), ctx.user (authenticated user)
    return ctx.db.select().from(tableHere);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(tableHere).values({ ...input });
    }),
});
```

### Client tRPC Hook Pattern

```tsx
// client/src/hooks/use-feature.ts
import { trpc } from "@/lib/trpc";

export function useFeature() {
  const list = trpc.feature.list.useQuery();
  const create = trpc.feature.create.useMutation({
    onSuccess: () => list.refetch(),
  });
  return { list, create };
}
```

### shadcn/ui Component Usage

```tsx
// Always import from @/components/ui/
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Wrap with custom styling, don't recreate
export function FeatureCard({ ...props }) {
  return (
    <Card className="border-primary/20 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
      </CardHeader>
      <CardContent>{/* content */}</CardContent>
    </Card>
  );
}
```

---

## TypeScript Guidelines

### Deep Type Instantiation Fix

When TS inference hits recursion limits:

```typescript
// ❌ Anti-Pattern: Persistent Compilation Errors
const mutate = trpc.feature.create.useMutation();

// ✅ Pattern: Explicit type annotation or early cast
const mutate = trpc.feature.create.useMutation<typeof trpc.feature.create>();
```

### Zod Schema Patterns

```typescript
// Shared validation (can be used client + server)
const createFeatureSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  value: z.number().nonnegative(),
});

type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `MANUS_CLIENT_ID` | OAuth app ID | ✅ |
| `MANUS_CLIENT_SECRET` | OAuth secret | ✅ |
| `JWT_SECRET` | Session signing key | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |

---

## Testing Strategy

| Test Type | Tool | Command |
|-----------|------|---------|
| Unit tests | Vitest | `pnpm test` |
| Type checking | TypeScript | `pnpm check` |

**Test location:** `server/*.test.ts`, `client/src/**/*.test.ts`

---

## Debugging Protocol

> [!WARNING]
> When an error occurs:

1. **PAUSE** – Don't immediately retry
2. **THINK** – Call `sequential-thinking`:
   - What exactly happened?
   - Why? (Root Cause Analysis)
   - What are 3 possible fixes?
3. **HYPOTHESIZE** – Formulate hypothesis + validation plan
4. **EXECUTE** – Apply fix after understanding cause

---

## Integration with Agent Skills

**For detailed patterns, see:**
- `.agent/rules/code-principles.md` - Code optimization principles
- `.agent/rules/tailwind-css.md` - Tailwind CSS patterns
- `.agent/workflows/` - Slash commands (`/research`, `/implement`, `/qa`, `/design`)
- `.agent/skills/` - Specialized skills (frontend-design, etc.)
