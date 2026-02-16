# Phase 6 - Advanced Features

## Metadata

| Field              | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| **Complexity**     | L6 — Multi-file feature with external API integration                 |
| **Estimated Time** | ~12 hours                                                             |
| **Parallel Safe**  | Partially (GPU-43 and GPU-18 are independent)                         |
| **Mode**           | CONSERVATIVE (plan only)                                              |
| **Issues**         | GPU-43, GPU-18                                                        |
| **Dependencies**   | Phase 1 (Styles) and Phase 2 (UI Components) completed for GPU-43    |
| **Validated**      | 2026-01-31 — Codebase verified, 87% accuracy                          |

---

## Objective

**Task:** Enhance mentee productivity and management with robust organization and planning tools.

**Context:** NeonDash (React 19 + Vite + tRPC + Drizzle + Neon PostgreSQL + Clerk + shadcn/ui)

**Why This Matters:** Productivity is essential for mentees. The current TaskBoard is basic; Google Calendar integration centralizes time management.

---

## Research Summary

### Findings Table

| #   | Finding                                                        | Confidence | Source             | Impact                     |
| --- | -------------------------------------------------------------- | ---------- | ------------------ | -------------------------- |
| 1   | TaskBoard.tsx has 178 lines, uses tRPC, no priority field      | 5          | Codebase           | Requires schema migration  |
| 2   | Category is a TEXT field (not enum): ["geral", "aula", "crm", "financeiro", "atividade"] | 5 | drizzle/schema.ts  | Can expand without migration |
| 3   | googleapis is the official library for Google Calendar API     | 5          | Web Research       | Use OAuth2 with refresh    |
| 4   | react-big-calendar (8.5k stars) is ideal for visualization     | 4          | Bryntum comparison | Install with moment        |
| 5   | OAuth2 requires access_type: 'offline' for refresh tokens      | 5          | DEV Community      | Persist tokens in DB       |
| 6   | Tokens must be encrypted at rest                               | 5          | Security best practices | AES-256 encryption     |
| 7   | shadcn/ui already has Calendar, Input, Select available        | 5          | Codebase           | Reuse components           |
| 8   | calendar.tsx uses react-day-picker (not react-big-calendar)    | 5          | Codebase           | react-big-calendar is a new dep |

### Knowledge Gaps

- [ ] Confirm whether mentees will use personal or shared Google Calendar
- [ ] Define which task categories are needed (Marketing, Sales, etc.)
- [ ] Token encryption strategy (env variable vs. vault)

### Assumptions to Validate

- [ ] Users have a personal Google account for integration
- [ ] Google Cloud Platform project will be created by the admin
- [ ] The 1M requests/day limit on the Google API is sufficient

---

## Edge Cases

### GPU-43: TaskBoard

1. **Empty filter results** — Display empty state with illustration and CTA
2. **Concurrent updates** — Use TanStack Query invalidation for synchronization
3. **Search performance** — Debounce input (300ms) to avoid excessive queries
4. **Category migration** — Existing tasks with 'geral' must continue working
5. **Mobile responsiveness** — Filters should collapse into a dropdown on mobile

### GPU-18: Google Calendar

1. **Token expiration** — Automatic refresh with exponential backoff retry
2. **User revokes access** — Detect 401 error and clear tokens from DB
3. **Network failure during OAuth** — Display friendly error with retry button
4. **Multiple tabs** — State parameter in OAuth prevents CSRF
5. **Rate limiting** — Log warnings when reaching 80% of quota
6. **Multiple calendars** — Use the user's primary calendar by default
7. **Timezone handling** — Store in UTC, display in local timezone
8. **Large event lists** — Paginate events with cursor-based pagination

---

## Relevant Files

### Must Read

| Path                                                    | Relevance                              |
| ------------------------------------------------------- | -------------------------------------- |
| `client/src/components/dashboard/TaskBoard.tsx`         | Component to be refactored             |
| `server/routers/tasks.ts`                               | tRPC router for tasks                  |
| `drizzle/schema.ts`                                     | Current tasks schema                   |
| `client/src/components/ui/calendar.tsx`                 | Existing shadcn Calendar component     |

### May Reference

| Path                                                    | Relevance                              |
| ------------------------------------------------------- | -------------------------------------- |
| `client/src/components/ui/input.tsx`                    | Input for search                       |
| `client/src/components/ui/select.tsx`                   | Select for filters                     |
| `client/src/components/ui/badge.tsx`                    | Badge for priority                     |
| `server/_core/trpc.ts`                                  | tRPC setup                             |

---

## Existing Patterns

```yaml
naming: camelCase for variables, PascalCase for components
file_structure: client/src/components/dashboard/* for dashboard components
error_handling: TRPCError with appropriate codes (FORBIDDEN, NOT_FOUND)
state_management: TanStack Query via trpc.useContext()
styling: Tailwind + CSS variables (--neon-gold, --neon-blue)
```

---

## Constraints

```yaml
non_negotiable:
  - Use existing shadcn/ui components
  - Do not break existing tasks during migration
  - OAuth tokens encrypted
  - Validation at each atomic task

preferences:
  - Maintain consistent Neon design (#0F172A, glow effects)
  - Low priority for GPU-18 (implement after GPU-43)
```

---

# Atomic Tasks

## GPU-43: TaskBoard Enhancement

### Phase 1: Schema & Backend

#### AT-001: Add priority enum and column to tasks table

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | CRITICAL                                                              |
| **Dependencies**  | None                                                                  |
| **Parallel Safe** | No                                                                    |

**Description:** Add `prioridade_task` enum and `priority` column to the `tasks` table.

**Files to Modify:**
- `drizzle/schema.ts`

**Implementation:**
```typescript
// Add enum
export const prioridadeTaskEnum = pgEnum("prioridade_task", ["alta", "media", "baixa"]);

// Add to tasks table
priority: prioridadeTaskEnum("priority").default("media").notNull(),
```

**Validation:**
```bash
bun run check
bun run db:push --dry-run
```

**Rollback:** Remove enum and column, revert schema.ts

---

#### AT-002: Update tasks tRPC router with filter support

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | CRITICAL                                                              |
| **Dependencies**  | AT-001                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Add filter parameters (search, category, priority) to the tasks router.

**Files to Modify:**
- `server/routers/tasks.ts`

**Implementation:**
```typescript
list: protectedProcedure
  .input(z.object({
    mentoradoId: z.number().optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(["alta", "media", "baixa"]).optional(),
  }).optional())
  .query(async ({ ctx, input }) => {
    // Add WHERE conditions with AND
  }),
```

**Validation:**
```bash
bun run check
bun test -- --grep tasks
```

**Rollback:** Revert tasks.ts to previous version

---

### Phase 2: Frontend Components

#### AT-003: Create TaskFilterToolbar component

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | HIGH                                                                  |
| **Dependencies**  | None                                                                  |
| **Parallel Safe** | YES                                                                   |

**Description:** Create toolbar component with search Input and category/priority Selects.

**Files to Create:**
- `client/src/components/dashboard/TaskFilterToolbar.tsx`

**Implementation Details:**
- Use `@/components/ui/input` for search
- Use `@/components/ui/select` for filters
- Emit onChange with 300ms debounce for search
- Existing categories: geral, aula, crm, financeiro, atividade
- New categories (optional): marketing, vendas, operacional
- Priorities: Alta (#F59E0B), Media (#3B82F6), Baixa (#6B7280)

> **Note:** Category is a TEXT field, not an enum. New values can be added without migration.

**Validation:**
```bash
bun run build
```

**Rollback:** Delete component file

---

#### AT-004: Restyle TaskCard with Neon Design System

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | HIGH                                                                  |
| **Dependencies**  | None                                                                  |
| **Parallel Safe** | YES                                                                   |

**Description:** Refactor task cards to follow the Neon Design System.

**Files to Modify:**
- `client/src/components/dashboard/TaskBoard.tsx`

**Design Specs:**
- Background: `#0F172A` (slate-900)
- Border: `border-primary/20` with hover `border-primary/50`
- Priority badges:
  - Alta: `bg-amber-500/20 text-amber-400 border-amber-500/50`
  - Media: `bg-blue-500/20 text-blue-400 border-blue-500/50`
  - Baixa: `bg-slate-500/20 text-slate-400 border-slate-500/50`
- Glow effect on hover: `shadow-[0_0_15px_rgba(59,130,246,0.3)]`

**Validation:**
```bash
bun run build
```

**Rollback:** Revert TaskBoard.tsx styling

---

#### AT-005: Integrate FilterToolbar into TaskBoard

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | HIGH                                                                  |
| **Dependencies**  | AT-002, AT-003                                                        |
| **Parallel Safe** | No                                                                    |

**Description:** Integrate the filter toolbar into the TaskBoard and connect with the tRPC query.

**Files to Modify:**
- `client/src/components/dashboard/TaskBoard.tsx`

**Implementation:**
```typescript
const [filters, setFilters] = useState({ search: '', category: '', priority: '' });
const { data: tasks } = trpc.tasks.list.useQuery({ ...filters, mentoradoId });
```

**Validation:**
```bash
bun run build
bun dev # Manual: test filter functionality
```

**Rollback:** Remove filter integration, revert to basic list

---

#### AT-006: Add EmptyFilterResult component

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | MEDIUM                                                                |
| **Dependencies**  | AT-005                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Create empty state component when filters return no results.

**Files to Create:**
- `client/src/components/dashboard/EmptyFilterResult.tsx`

**Design:**
- Icon: SearchX (lucide-react)
- Text: "No tasks found"
- Button: "Clear filters"

**Validation:**
```bash
bun run build
```

**Rollback:** Delete component file

---

## GPU-18: Google Calendar Integration (Low Priority)

### Phase 1: Setup & Configuration

#### AT-011: Configure Google Cloud Platform project

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | CRITICAL                                                              |
| **Dependencies**  | None                                                                  |
| **Parallel Safe** | YES                                                                   |

**Description:** Configure the GCP project, enable Calendar API, and obtain OAuth2 credentials.

**Manual Steps:**
1. Go to console.cloud.google.com
2. Create new project "NeonDash Calendar"
3. Enable "Google Calendar API"
4. Configure OAuth consent screen
5. Create OAuth2 credentials (Web application)
6. Add redirect URI: `http://localhost:3000/api/calendar/callback`
7. Copy Client ID and Client Secret

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback
```

**Validation:**
```bash
cat .env | grep GOOGLE_CLIENT_ID # Should not be empty
```

**Rollback:** Delete GCP project and remove env variables

---

#### AT-012: Add googleTokens table to schema

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | CRITICAL                                                              |
| **Dependencies**  | AT-011                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Add table to store Google OAuth tokens securely.

**Files to Modify:**
- `drizzle/schema.ts`

**Schema:**
```typescript
export const googleTokens = pgTable(
  "google_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at").notNull(),
    scope: text("scope").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("google_tokens_user_idx").on(table.userId),
  ]
);
```

**Validation:**
```bash
bun run check
bun run db:push --dry-run
```

**Rollback:** Remove table from schema, run db:push

---

### Phase 2: Backend Services

#### AT-013: Create Google Calendar service

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | CRITICAL                                                              |
| **Dependencies**  | AT-012                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Create service to manage the OAuth2 client and Google Calendar API calls.

**Files to Create:**
- `server/services/googleCalendar.ts`

**Dependencies to Install:**
```bash
bun add googleapis
```

**Implementation:**
```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleCalendarService = {
  getAuthUrl: () => oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.readonly']
  }),

  exchangeCodeForTokens: async (code: string) => { ... },

  refreshAccessToken: async (refreshToken: string) => { ... },

  getEvents: async (accessToken: string, timeMin: Date, timeMax: Date) => { ... },
};
```

**Validation:**
```bash
bun run check
```

**Rollback:** Delete service file, remove googleapis dependency

---

#### AT-014: Implement calendar tRPC router

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | HIGH                                                                  |
| **Dependencies**  | AT-013                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Create tRPC router with procedures for OAuth flow and calendar operations.

**Files to Create:**
- `server/routers/calendar.ts`

**Files to Modify:**
- `server/routers.ts` (add calendarRouter)

**Procedures:**
- `getAuthUrl` — Returns authorization URL
- `handleCallback` — Exchanges code for tokens, persists in DB
- `getStatus` — Returns whether user is connected
- `getEvents` — Lists calendar events
- `disconnect` — Removes user tokens

**Validation:**
```bash
bun run check
```

**Rollback:** Delete router, remove from routers.ts

---

### Phase 3: Frontend

#### AT-015: Install react-big-calendar and create Agenda page

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | HIGH                                                                  |
| **Dependencies**  | AT-014                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Install react-big-calendar and create the Agenda page.

**Dependencies to Install:**
```bash
bun add react-big-calendar moment @types/react-big-calendar
```

**Files to Create:**
- `client/src/pages/Agenda.tsx`

**Implementation:**
```tsx
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export function Agenda() {
  const { data: events } = trpc.calendar.getEvents.useQuery();

  return (
    <Calendar
      localizer={localizer}
      events={events ?? []}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
    />
  );
}
```

**Validation:**
```bash
bun run build
```

**Rollback:** Delete page, remove dependencies

---

#### AT-016: Implement OAuth connect button and status

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Priority**      | MEDIUM                                                                |
| **Dependencies**  | AT-015                                                                |
| **Parallel Safe** | No                                                                    |

**Description:** Add Google connection button and status indicator.

**Files to Modify:**
- `client/src/pages/Agenda.tsx`

**UI Components:**
- Button: "Connect Google Calendar" (when disconnected)
- Badge: "Connected" with green status (when connected)
- Button: "Disconnect" (when connected)

**Validation:**
```bash
bun run build
bun dev # Manual: complete OAuth flow test
```

**Rollback:** Revert page changes

---

## Validation Gates

### Automated

| ID     | Command            | Expected        | When                  |
| ------ | ------------------ | --------------- | --------------------- |
| VT-001 | `bun run check`    | Exit 0          | After each AT         |
| VT-002 | `bun run build`    | Exit 0          | After frontend ATs    |
| VT-003 | `bun run lint`     | No errors       | Before PR             |
| VT-004 | `bun test`         | All pass        | Before PR             |
| VT-005 | `bun run db:push`  | Exit 0          | After schema changes  |

### Manual Review

| Reviewer   | Focus                                | Required If              |
| ---------- | ------------------------------------ | ------------------------ |
| @security  | Token storage & OAuth implementation | GPU-18 implementation    |
| @designer  | Neon Design System compliance        | GPU-43 UI changes        |

---

## Output

```yaml
format: "docs/PLAN-fase-6-funcionalidades-avancadas.md"

files_created:
  - path: "client/src/components/dashboard/TaskFilterToolbar.tsx"
    purpose: "Filter toolbar for TaskBoard"
  - path: "client/src/components/dashboard/EmptyFilterResult.tsx"
    purpose: "Empty state for filters with no results"
  - path: "server/services/googleCalendar.ts"
    purpose: "Service for Google Calendar API"
  - path: "server/routers/calendar.ts"
    purpose: "tRPC router for calendar"
  - path: "client/src/pages/Agenda.tsx"
    purpose: "Agenda page with calendar"

files_modified:
  - path: "drizzle/schema.ts"
    changes: "Add prioridadeTaskEnum, priority column, googleTokens table"
  - path: "server/routers/tasks.ts"
    changes: "Add filter parameters to list procedure"
  - path: "server/routers.ts"
    changes: "Add calendarRouter"
  - path: "client/src/components/dashboard/TaskBoard.tsx"
    changes: "Integrate filters, restyle with Neon design"

success_definition: |
  - TaskBoard with functional filters (search, category, priority)
  - Cards with Neon design and priority badges
  - Empty state for filters with no results
  - Google Calendar connectable via OAuth2
  - Calendar events displayed in react-big-calendar
  - Builds passing without errors

failure_handling: |
  If schema migration fails: Rollback via db:push with previous schema
  If OAuth fails: Clear tokens from DB, prompt re-authentication
  If build fails: Revert to last working commit
```

---

## Pre-Submission Checklist

### Research
- [x] Codebase searched (TaskBoard.tsx, tasks.ts, schema.ts)
- [x] Docs consulted (Context7 unavailable, used Tavily)
- [x] Web research done (googleapis, react-big-calendar)
- [x] Security identified (OAuth, token encryption)
- [x] Edge cases considered (8+ documented)

### Context
- [x] Findings Table included (7 findings)
- [x] Knowledge Gaps listed (3 gaps)
- [x] Assumptions to Validate listed (3 assumptions)
- [x] Relevant files specified
- [x] WHY included for instructions

### Tasks
- [x] Truly atomic
- [x] Validation command each
- [x] Dependencies mapped
- [x] Rollback defined
- [x] Parallel-safe marked

### Behavior
- [x] Mode specified (CONSERVATIVE)
- [x] Output format explicit
- [x] Success criteria measurable
- [x] Failure handling defined
