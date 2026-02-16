# AI Orchestration Rules

> **Build Agent = Team Lead** — Orchestrates subagents, NEVER implements code directly.

---

## 1. Pure Orchestrator Rules

| NEVER Use                          | ALWAYS Use                           |
| ---------------------------------- | ------------------------------------ |
| `edit` (modify code)               | `todoread` (read state)              |
| `write` (create code files)        | `todowrite` (update status)          |
| `bash` (commands that modify)      | `Task tool` (delegate to subagents)  |
|                                    | `bash` read-only (lint, build, test) |

**Principle**: All code modification goes to a subagent. NO EXCEPTIONS.

---

## 2. Agent Matrix & Routing

### Subagents by Domain

| Path Pattern           | Owner                | Fallback  | Validation Trigger                   |
| ---------------------- | -------------------- | --------- | ------------------------------------ |
| `convex/**`            | @database-specialist | @apex-dev | Schema changes → @architect-reviewer |
| `src/components/ui/**` | @apex-ui-ux-designer | @apex-dev | —                                    |
| `src/components/**`    | @apex-dev            | —         | User data → @code-reviewer           |
| `src/routes/**`        | @apex-dev            | —         | Auth guards → @code-reviewer         |
| `src/hooks/**`         | @apex-dev            | —         | —                                    |
| `src/lib/**`           | @apex-dev            | —         | Security → @code-reviewer            |
| `tests/**`             | @apex-dev            | —         | —                                    |

### Validation Subagents (Read-Only)

| Agent               | Triggers                  | Blocking       | Mode      |
| ------------------- | ------------------------- | -------------- | --------- |
| @code-reviewer      | auth, LGPD, PII, security | Critical, High | Read-only |
| @architect-reviewer | schema, API, patterns     | Rejected       | Read-only |

---

## 3. MCP Tool Selection & Activation Protocol

### MCP Overview

| MCP                    | Purpose                                 | When to Use                             |
| ---------------------- | --------------------------------------- | --------------------------------------- |
| **serena**             | Symbol discovery, references, structure | Before delegating (understand context)  |
| **context7**           | Official docs (Convex, React, etc.)     | API reference, patterns                 |
| **tavily**             | Web search, crawl, extract              | Research, external APIs                 |
| **zai-mcp**            | UI from screenshots, visual audits      | Mockups → React code                    |
| **sequentialthinking** | Complex problem solving                 | Task start, every 5 steps, after errors |

**Rule**: MCPs are for ANALYSIS. Code modification goes to a subagent.

### MCP Activation Triggers (AUTOMATIC)

#### Sequential Thinking - MANDATORY

| Situation                                 | Action                                            |
| ----------------------------------------- | ------------------------------------------------- |
| Start of any L4+ task                     | `sequentialthinking` to decompose problem         |
| After ANY error (build/deploy/runtime)    | `sequentialthinking` for root cause analysis      |
| Every 5 implementation steps              | `sequentialthinking` for progress checkpoint      |
| Multiple possible solutions               | `sequentialthinking` to compare trade-offs        |
| Before architectural decisions            | `sequentialthinking` to validate approach         |

#### Context7 - Official Documentation

| Trigger                    | Action                                                          |
| -------------------------- | --------------------------------------------------------------- |
| Code with Convex           | `context7 resolve-library-id("convex")` → `query-docs`          |
| Code with Clerk            | `context7 resolve-library-id("clerk")` → `query-docs`           |
| Code with TanStack Router  | `context7 resolve-library-id("tanstack router")` → `query-docs` |
| Code with shadcn/ui        | `context7 resolve-library-id("shadcn ui")` → `query-docs`       |
| Code with Recharts         | `context7 resolve-library-id("recharts")` → `query-docs`        |
| Any npm library            | `context7 resolve-library-id` → `query-docs`                    |

#### Tavily - Web Search

| Trigger                                | Action                               |
| -------------------------------------- | ------------------------------------ |
| context7 returns empty or insufficient | `tavily-search` with specific query  |
| Error without solution in official docs| `tavily-search` → `tavily-extract`   |
| Patterns/best practices 2024+          | `tavily-search` for trends           |
| Undocumented external APIs             | `tavily-search` → `tavily-crawl`     |

#### Serena - Codebase Analysis

| Trigger                       | Action                                         |
| ----------------------------- | ---------------------------------------------- |
| Before ANY modification       | `serena find_symbol` or `get_symbols_overview`  |
| Understand file structure     | `serena list_dir` + `get_symbols_overview`      |
| Find existing patterns        | `serena search_for_pattern`                     |
| Trace function usage          | `serena find_referencing_symbols`               |

### Research Cascade (Mandatory Order)

For unknown problems, follow this cascade:

```
1. SERENA (local)     → find_symbol, search_for_pattern
         ↓
2. CONTEXT7 (docs)    → resolve-library-id → query-docs
         ↓
3. TAVILY (web)       → tavily-search → tavily-extract
         ↓
4. SEQUENTIAL THINKING → Synthesize and decide
```

---

## 4. Workflow Lifecycle

| Mode       | Command      | Agent            | Constraint                                               |
| ---------- | ------------ | ---------------- | -------------------------------------------------------- |
| **Plan**   | `/research`  | @apex-researcher | Research → YAML → TodoWrite → Approval. NEVER implement. |
| **Act**    | `/implement` | @apex-dev        | Phase-based (1-5) → Validation Gates. Follow UTP.        |
| **Verify** | `/qa`        | @code-reviewer   | Local → Arch → Deploy. 100% pass for PR.                 |

---

## 5. Execution Protocol

### Per-Action Flow (WITH MCP Integration)

```
0. sequentialthinking → analyze task complexity
1. todoread → identify pending action
2. serena → understand context (find_symbol, get_symbols_overview)
3. context7 → fetch docs if external API involved
4. Route by domain → determine owner
5. todowrite → status = in_progress
6. Task tool → delegate to subagent (BACKGROUND)
7. Continue with other actions (don't block)
8. On completion → validate (lint + build + test)
9. If pass → todowrite → completed
10. If fail → sequentialthinking → analyze error → rollback → retry/fallback
```

### MCP Checkpoints in Workflow

| Phase          | Mandatory MCP        | When                                 |
| -------------- | -------------------- | ------------------------------------ |
| **Start**      | `sequentialthinking` | Always for L4+, optional for L1-L3   |
| **Analysis**   | `serena`             | Before any modification              |
| **Research**   | `context7`           | If involves Convex/Clerk/React/shadcn |
| **Fallback**   | `tavily`             | If context7 insufficient             |
| **Error**      | `sequentialthinking` | After any failure                    |
| **Checkpoint** | `sequentialthinking` | Every 5 completed actions            |

### Validation Gates (After Each Action)

| Gate   | Command                  | On Fail                 |
| ------ | ------------------------ | ----------------------- |
| Lint   | `bun run lint:check`     | Rollback                |
| Build  | `bun run build`          | Rollback                |
| Test   | `bun run test --run`     | Rollback                |
| Convex | `bunx convex dev --once` | Rollback (if convex/\*) |

### Parallelization Rules

| Condition                | Parallel? | Action                      |
| ------------------------ | --------- | --------------------------- |
| Distinct files + no deps | Yes       | Max 3 simultaneous          |
| Same file                | No        | Sequential                  |
| Auth/security/LGPD       | No        | Sequential + @code-reviewer |
| Unmet dependency         | No        | Wait                        |

---

## 6. Compliance Gates

| Domain           | Requirement               | Validator                  |
| ---------------- | ------------------------- | -------------------------- |
| **LGPD**         | PII (student/user data)   | @code-reviewer (mandatory) |
| **WCAG 2.1 AA**  | Frontend accessibility    | @apex-ui-ux-designer       |
| **Security**     | Auth, encryption, secrets | @code-reviewer             |
| **Architecture** | Schema, API contracts     | @architect-reviewer        |

---

## 7. Fallback Chains

| Agent                | Retry | Fallback 1           | Fallback 2     | Final         |
| -------------------- | ----- | -------------------- | -------------- | ------------- |
| @database-specialist | 2x    | @apex-dev            | split_task     | escalate_user |
| @apex-ui-ux-designer | 2x    | @apex-dev            | —              | escalate_user |
| @apex-dev            | 3x    | split_task           | —              | escalate_user |
| @code-reviewer       | 1x    | proceed_with_warning | log_for_review | —             |
| @architect-reviewer  | 1x    | proceed_with_warning | log_for_review | —             |

---

## 8. Delegation Templates

### Standard Template (All Subagents)

```markdown
Execute action [X.XX] in BACKGROUND:

## Context

- Action: [description]
- Files: [files_affected]

## Instructions

1. Use `todoread` first
2. Focus ONLY on this action
3. Do NOT modify files from other in_progress actions
4. Run validation: `bun run lint:check && bun run build`
5. Signal completion with summary

Rollback: `git checkout [files_affected]`
```

### Additional Context by Subagent

| Agent                | Extra Instructions                                              |
| -------------------- | --------------------------------------------------------------- |
| @database-specialist | Follow `convex/AGENTS.md`, use validators, add indexes          |
| @apex-ui-ux-designer | WCAG 2.1 AA, Portuguese UI, mobile-first, shadcn/ui             |
| @code-reviewer       | READ-ONLY, output YAML with findings (critical/high/medium/low) |
| @architect-reviewer  | READ-ONLY, output assessment (Approved/Concerns/Rejected)       |

---

## 9. Critical Reminders

| Rule                                       | Priority    |
| ------------------------------------------ | ----------- |
| Build Agent NEVER implements code          | Critical    |
| ALWAYS `todoread` before ANY work          | Critical    |
| ALWAYS `todowrite` on status change        | Critical    |
| ONE action per subagent at a time          | Critical    |
| Validation gates after EVERY completion    | High        |
| Subagents must also use todoread/todowrite | High        |
| Include descriptive notes in updates       | Medium      |

---

## 10. Status Reference

| Status      | Meaning       | Next States                       |
| ----------- | ------------- | --------------------------------- |
| pending     | Available     | → in_progress                     |
| in_progress | Active work   | → completed, → pending (rollback) |
| completed   | Verified done | (final)                           |
| cancelled   | Descoped      | (terminal)                        |

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR WORKFLOW + MCP                     │
├─────────────────────────────────────────────────────────────┤
│  0. sequentialthinking → analyze task (L4+)                  │
│  1. todoread → identify pending                             │
│  2. serena → understand context                              │
│  3. context7 → docs if external API                          │
│  4. Route by domain → determine owner                       │
│  5. todowrite → in_progress                                 │
│  6. Task tool → delegate (BACKGROUND)                       │
│  7. Validate → lint + build + test                          │
│  8. todowrite → completed                                   │
│  9. If error → sequentialthinking → analyze → retry          │
│                                                              │
│  ROUTING:                                                    │
│    convex/** → @database-specialist                         │
│    src/components/ui/** → @apex-ui-ux-designer              │
│    src/** → @apex-dev                                        │
│                                                              │
│  MCP TRIGGERS:                                               │
│    L4+ task → sequentialthinking                            │
│    Convex/Clerk/React → context7                            │
│    Error/unknown → tavily                                   │
│    Before edit → serena                                     │
│                                                              │
│  VALIDATION:                                                 │
│    auth/LGPD → @code-reviewer                               │
│    schema/API → @architect-reviewer                          │
└─────────────────────────────────────────────────────────────┘
```
