# PRP: Unification of Neon Estrutura and Escala into a Single NEON

## Metadata

| Field              | Value                                             |
| ------------------ | ------------------------------------------------- |
| **Complexity**     | L6 — Architecture, data migration, multi-file     |
| **Estimated Time** | 4-6 hours                                         |
| **Parallel Safe**  | Partially (AT-001 must be executed first)          |
| **Risk Level**     | Medium (requires data migration in production)    |

---

## 1. Objective and Context

The goal of this implementation is to **unify the "Neon Estrutura" and "Neon Escala" groups into a single group called "NEON"**. Currently, the system separates mentees into two distinct cohorts, each with its own metrics, rankings, and visualizations. This separation will be eliminated, creating a unified experience in both the database and the user interface.

The change impacts multiple layers of the application, from the PostgreSQL database schema (via Drizzle ORM), through the business logic in the backend (tRPC routers), to the React components in the frontend. The final result will be a consolidated dashboard where all mentees compete in a single ranking and view aggregated metrics.

---

## 2. Impact Analysis

### 2.1 Affected Files

| Layer        | File                                              | Type of Change                                 |
| ------------ | ------------------------------------------------- | ---------------------------------------------- |
| **Database** | `drizzle/schema.ts`                               | Modify `turmaEnum` to a single value           |
| **Database** | `drizzle/0000_nifty_betty_ross.sql`               | Reference (do not modify)                      |
| **Database** | New migration                                     | Create migration to update existing data       |
| **Backend**  | `server/gamificacao.ts`                           | Remove loop by cohorts in ranking calculation  |
| **Backend**  | `server/gamificacaoRouter.ts`                     | Remove cohort filter from endpoint             |
| **Backend**  | `server/mentoradosRouter.ts`                      | Remove cohort validation from inputs           |
| **Backend**  | `server/emailService.ts`                          | Remove cohort reference in email               |
| **Backend**  | `server/services/userService.ts`                  | Remove cohort default                          |
| **Backend**  | `server/seed-playbook.ts`                         | Unify playbook modules                         |
| **Backend**  | `server/routers/playbook.ts`                      | Remove cohort filter                           |
| **Backend**  | `server/_core/context.ts`                         | Remove cohort default                          |
| **Frontend** | `client/src/pages/Home.tsx`                       | Remove cohort tabs, unify data                 |
| **Frontend** | `client/src/pages/Admin.tsx`                      | Remove separate counters                       |
| **Frontend** | `client/src/pages/MyDashboard.tsx`                | Remove cohort badge                            |
| **Frontend** | `client/src/pages/VincularEmails.tsx`             | Remove cohort display                          |
| **Frontend** | `client/src/pages/MoltbotPage.tsx`                | Remove cohort reference                        |
| **Frontend** | `client/src/components/dashboard/RankingView.tsx` | Remove cohort filter                           |
| **Frontend** | `client/src/components/dashboard/TurmaView.tsx`   | Remove or completely refactor                  |
| **Frontend** | `client/src/components/profile-card.tsx`          | Remove cohort prop                             |
| **Frontend** | `client/src/components/admin/*.tsx`               | Remove cohort references                       |
| **Frontend** | `client/src/lib/data.ts`                          | Unify data structure                           |

---

## 3. Atomic Tasks

### Phase 1: Foundation (Database)

#### AT-001: Create Migration to Unify Cohort in the Database

**Priority:** Critical
**Dependencies:** None
**Parallel Safe:** No

**Description:** This task creates a SQL migration that updates all existing records to use a single cohort value and modifies the enum in the Drizzle schema.

**Files to Modify:**

1. `drizzle/schema.ts` — Line 18
2. Create a new migration file

**Implementation Prompt:**

```
You are a Drizzle ORM and PostgreSQL expert. Execute the following modifications on the neondash project:

1. OPEN the file `drizzle/schema.ts` and locate line 18:
   export const turmaEnum = pgEnum("turma", ["neon_estrutura", "neon_escala"]);

2. MODIFY to:
   export const turmaEnum = pgEnum("turma", ["neon"]);

3. CREATE a new SQL migration file in `drizzle/migrations/` with current timestamp (format: XXXX_unify_turma.sql) containing:

-- Update all mentees to unified cohort
UPDATE mentorados SET turma = 'neon' WHERE turma IN ('neon_estrutura', 'neon_escala');

-- Update all rankings to unified cohort
UPDATE ranking_mensal SET turma = 'neon' WHERE turma IN ('neon_estrutura', 'neon_escala');

-- Update all playbook_modules to unified cohort
UPDATE playbook_modules SET turma = 'neon' WHERE turma IN ('neon_estrutura', 'neon_escala');

-- Alter the enum (PostgreSQL requires recreation)
ALTER TYPE turma RENAME TO turma_old;
CREATE TYPE turma AS ENUM ('neon');
ALTER TABLE mentorados ALTER COLUMN turma TYPE turma USING 'neon'::turma;
ALTER TABLE ranking_mensal ALTER COLUMN turma TYPE turma USING 'neon'::turma;
ALTER TABLE playbook_modules ALTER COLUMN turma TYPE turma USING turma::text::turma;
DROP TYPE turma_old;

4. EXECUTE `bun run db:generate` to generate the updated snapshot.

VALIDATION:
- Verify that `drizzle/schema.ts` contains only 'neon' in turmaEnum
- Verify that the migration file was created
- Execute `bun run db:migrate` in the development environment to test
```

**Validation:**

- `grep -n "turmaEnum" drizzle/schema.ts` should show only `["neon"]`
- Migration file exists in `drizzle/migrations/`
- `bun run db:migrate` executes without errors

**Rollback:**

```bash
# Revert schema
git checkout drizzle/schema.ts
# Delete migration
rm drizzle/migrations/*unify_turma.sql
# In production, execute reverse SQL
```

---

### Phase 2: Core (Backend Logic)

#### AT-002: Remove Cohort Logic in Gamification Calculation

**Priority:** Critical
**Dependencies:** `[AT-001]`
**Parallel Safe:** Yes (after AT-001)

**Description:** The file `server/gamificacao.ts` currently iterates over both cohorts to calculate separate rankings. This logic must be simplified to process all mentees in a single ranking.

**Files to Modify:**

1. `server/gamificacao.ts` — Lines 305-420

**Implementation Prompt:**

```
You are a TypeScript and backend logic expert. Execute the following modifications on the file `server/gamificacao.ts`:

1. LOCATE the function `calculateMonthlyRanking` (approximately line 305).

2. FIND the code:
   const turmas = ["neon_estrutura", "neon_escala"] as const;
   for (const turma of turmas) {

3. REMOVE the cohort loop and REFACTOR to process all active mentees at once:

   // BEFORE (remove):
   const turmas = ["neon_estrutura", "neon_escala"] as const;
   for (const turma of turmas) {
     const mentoradosTurma = await db
       .select()
       .from(mentorados)
       .where(and(eq(mentorados.turma, turma), eq(mentorados.ativo, "sim")));
     // ... rest of the code inside the loop
   }

   // AFTER (replace with):
   const allMentorados = await db
     .select()
     .from(mentorados)
     .where(eq(mentorados.ativo, "sim"));

   const rankings: {
     mentoradoId: number;
     pontuacao: number;
     bonus: number;
   }[] = [];

   for (const m of allMentorados) {
     // ... keep the existing score calculation logic
   }

   // Sort by score
   rankings.sort((a, b) => b.pontuacao - a.pontuacao);

   // Delete existing rankings for the month (without cohort filter)
   await db
     .delete(rankingMensal)
     .where(
       and(
         eq(rankingMensal.ano, ano),
         eq(rankingMensal.mes, mes)
       )
     );

   // Insert new rankings with fixed cohort 'neon'
   for (let i = 0; i < rankings.length; i++) {
     await db.insert(rankingMensal).values({
       mentoradoId: rankings[i].mentoradoId,
       ano,
       mes,
       turma: "neon",
       posicao: i + 1,
       pontuacaoTotal: rankings[i].pontuacao,
       pontosBonus: rankings[i].bonus,
     });
   }

4. LOCATE the function `getRanking` (approximately line 712) and REMOVE the optional cohort parameter:

   // BEFORE:
   turma?: "neon_estrutura" | "neon_escala"

   // AFTER:
   // Remove the turma parameter completely

5. UPDATE the query inside `getRanking` to not filter by cohort.

VALIDATION:
- Execute `bun run typecheck` to verify types
- Execute `bun run test` to run existing tests
```

**Validation:**

- `grep -n "neon_estrutura\|neon_escala" server/gamificacao.ts` returns no results
- `bun run typecheck` passes without errors
- `bun run test` passes (may need to update tests)

---

#### AT-003: Update tRPC Routers to Remove Cohort Filters

**Priority:** Critical
**Dependencies:** `[AT-002]`
**Parallel Safe:** Yes

**Description:** The tRPC routers expose endpoints that accept cohort as a parameter. These must be updated to no longer accept this filter.

**Files to Modify:**

1. `server/gamificacaoRouter.ts` — Line 70
2. `server/mentoradosRouter.ts` — Lines 62, 170, 218
3. `server/routers/playbook.ts` — Line 15

**Implementation Prompt:**

```
You are a tRPC and Zod expert. Execute the following modifications on the backend routers:

### File 1: server/gamificacaoRouter.ts

1. LOCATE line 70:
   turma: z.enum(["neon_estrutura", "neon_escala"]).optional(),

2. REMOVE this line completely from the input schema.

3. UPDATE the call to `Gamificacao.getRanking` removing the turma parameter.

### File 2: server/mentoradosRouter.ts

1. LOCATE line 62 (inside `create`):
   turma: z.enum(["neon_estrutura", "neon_escala"]),

2. REPLACE with:
   turma: z.literal("neon").default("neon"),

3. LOCATE line 170 (inside `update`):
   turma: z.enum(["neon_estrutura", "neon_escala"]).optional(),

4. REMOVE this line completely (turma should not be editable).

5. LOCATE line 218 (inside `createNew`):
   turma: z.enum(["neon_estrutura", "neon_escala"]),

6. REPLACE with:
   turma: z.literal("neon").default("neon"),

### File 3: server/routers/playbook.ts

1. LOCATE line 15:
   z.object({ turma: z.enum(["neon_estrutura", "neon_escala"]).optional() })

2. REMOVE the input object completely or replace with z.void().

3. UPDATE the query to not filter by cohort.

VALIDATION:
- Execute `bun run typecheck`
- Test the endpoints manually via Postman or Thunder Client
```

**Validation:**

- `grep -rn "neon_estrutura\|neon_escala" server/*.ts server/routers/*.ts` returns no results
- `bun run typecheck` passes

---

#### AT-004: Update Auxiliary Backend Services

**Priority:** High
**Dependencies:** `[AT-001]`
**Parallel Safe:** Yes

**Description:** Auxiliary services such as email and user context also reference cohorts and must be updated.

**Files to Modify:**

1. `server/emailService.ts` — Line 51
2. `server/services/userService.ts` — Lines 95-96
3. `server/_core/context.ts` — Line 134

**Implementation Prompt:**

```
You are a TypeScript expert. Execute the following modifications on the auxiliary services:

### File 1: server/emailService.ts

1. LOCATE line 51:
   turma === "neon_estrutura" ? "Neon Estrutura" : "Neon Escala";

2. REPLACE with:
   const turmaNome = "NEON";

3. UPDATE the email template to use only "NEON" as the cohort name.

### File 2: server/services/userService.ts

1. LOCATE lines 95-96:
   (user.public_metadata?.turma as "neon_estrutura" | "neon_escala") ||
   "neon_estrutura";

2. REPLACE with:
   "neon" as const;

### File 3: server/_core/context.ts

1. LOCATE line 134:
   turma: "neon_estrutura", // Default value

2. REPLACE with:
   turma: "neon", // Unified cohort

VALIDATION:
- Execute `bun run typecheck`
- Verify that there are no more references to "neon_estrutura" or "neon_escala" in these files
```

**Validation:**

- `grep -n "neon_estrutura\|neon_escala" server/emailService.ts server/services/userService.ts server/_core/context.ts` returns no results

---

### Phase 3: Integration (Frontend)

#### AT-005: Unify Home Page and Remove Cohort Tabs

**Priority:** High
**Dependencies:** `[AT-002, AT-003]`
**Parallel Safe:** Yes

**Description:** The Home page currently displays separate tabs for "Estrutura Neurons" and "Escala Neurons". These must be removed and replaced with a unified view.

**Files to Modify:**

1. `client/src/pages/Home.tsx`

**Implementation Prompt:**

```
You are a React and TypeScript expert. Execute the following modifications on `client/src/pages/Home.tsx`:

1. LOCATE the imports of `analiseData` and UPDATE to use unified data:

   // The data structure will be modified in AT-008, but prepare the code for:
   const allMentorados = [
     ...Object.entries(analiseData.neon?.analise || {}),
   ];

2. LOCATE the tabs array in `FloatingDockTabsList` (lines 122-148):

   {
     value: "estrutura",
     label: "Estrutura Neurons",
     icon: Users,
   },
   {
     value: "escala",
     label: "Escala Neurons",
     icon: TrendingUp,
   },

3. REMOVE these two entries from the tabs array.

4. LOCATE the `FloatingDockTabsContent` for "estrutura" and "escala" (lines 365-373):

   <FloatingDockTabsContent value="estrutura" className="mt-0">
     <TurmaView type="estrutura" />
   </FloatingDockTabsContent>

   <FloatingDockTabsContent value="escala" className="mt-0">
     <TurmaView type="escala" />
   </FloatingDockTabsContent>

5. REPLACE with a single "Mentees" tab:

   <FloatingDockTabsContent value="mentorados" className="mt-0">
     <MentoradosUnifiedView />
   </FloatingDockTabsContent>

6. UPDATE the calculation logic for `topPerformers`, `faturamentoTotal`, `totalMentorados`, and `chartData` to use unified data instead of concatenating two sources.

7. REMOVE the "5 Estrutura" and "9 Escala" badges (lines 215-220) and replace with a single total counter.

VALIDATION:
- Execute `bun run dev` and visually verify that cohort tabs no longer appear
- Verify that aggregated data is correct
```

**Validation:**

- Visually, the Home page no longer displays cohort tabs
- `grep -n "estrutura\|escala" client/src/pages/Home.tsx` returns only references to "infrastructure" or similar (not cohort-related)

---

#### AT-006: Update RankingView to Remove Cohort Filter

**Priority:** High
**Dependencies:** `[AT-003]`
**Parallel Safe:** Yes

**Description:** The RankingView component has a dropdown to filter by cohort that must be removed.

**Files to Modify:**

1. `client/src/components/dashboard/RankingView.tsx`

**Implementation Prompt:**

```
You are a React and TypeScript expert. Execute the following modifications on `client/src/components/dashboard/RankingView.tsx`:

1. LOCATE the cohort state (line 24-26):

   const [turma, setTurma] = useState<
     "neon_estrutura" | "neon_escala" | "todas"
   >("todas");

2. REMOVE this state completely.

3. LOCATE the tRPC query (lines 28-32):

   const { data: ranking, isLoading } = trpc.gamificacao.ranking.useQuery({
     ano: selectedYear,
     mes: selectedMonth,
     turma: turma === "todas" ? undefined : turma,
   });

4. SIMPLIFY to:

   const { data: ranking, isLoading } = trpc.gamificacao.ranking.useQuery({
     ano: selectedYear,
     mes: selectedMonth,
   });

5. LOCATE the cohort Select (lines 77-90) and REMOVE completely:

   <Select
     value={turma}
     onValueChange={v => setTurma(v as typeof turma)}
   >
     ...
   </Select>

6. LOCATE the cohort Badges on podium cards (lines 155-162) and REMOVE:

   <Badge
     variant="outline"
     className="text-xs mb-2 bg-white/50 backdrop-blur-sm"
   >
     {item.mentorado.turma === "neon_estrutura"
       ? "Estrutura"
       : "Escala"}
   </Badge>

7. LOCATE the cohort display in the full list (lines 224-228) and REMOVE:

   <p className="text-sm text-slate-500">
     {item.mentorado.turma === "neon_estrutura"
       ? "Neon Estrutura"
       : "Neon Escala"}
   </p>

VALIDATION:
- Execute `bun run dev` and verify that the cohort filter no longer appears
- Verify that the ranking displays all mentees in a single list
```

**Validation:**

- `grep -n "neon_estrutura\|neon_escala" client/src/components/dashboard/RankingView.tsx` returns no results

---

#### AT-007: Update Administrative Components

**Priority:** Medium
**Dependencies:** `[AT-003]`
**Parallel Safe:** Yes

**Description:** Administrative components display cohort counters and badges that must be removed.

**Files to Modify:**

1. `client/src/pages/Admin.tsx`
2. `client/src/pages/VincularEmails.tsx`
3. `client/src/components/admin/AdminOverview.tsx`
4. `client/src/components/admin/MenteeManagementView.tsx`
5. `client/src/components/admin/LinkEmailsView.tsx`

**Implementation Prompt:**

```
You are a React expert. Execute the following modifications on the administrative components:

### File 1: client/src/pages/Admin.tsx

1. LOCATE lines 36-39:
   const estruturaCount =
     mentorados?.filter((m: any) => m.turma === "neon_estrutura").length || 0;
   const escalaCount =
     mentorados?.filter((m: any) => m.turma === "neon_escala").length || 0;

2. REPLACE with:
   const totalCount = mentorados?.length || 0;

3. LOCATE lines 70-73 (count badges) and REPLACE with a single counter:
   <span className="bg-neon-gold/20 text-neon-blue-dark px-2 py-0.5 rounded-full font-medium">
     {totalCount} Mentees
   </span>

4. LOCATE lines 147-154 (cohort display in table) and REMOVE the cohort column completely.

### File 2: client/src/pages/VincularEmails.tsx

1. LOCATE lines 102-106 and 164-166 that display cohort badges and REMOVE.

### File 3: client/src/components/admin/AdminOverview.tsx

1. SEARCH for references to "estrutura" or "escala" and REMOVE.

### File 4: client/src/components/admin/MenteeManagementView.tsx

1. SEARCH for references to "estrutura" or "escala" and REMOVE.

### File 5: client/src/components/admin/LinkEmailsView.tsx

1. SEARCH for references to "estrutura" or "escala" and REMOVE.

VALIDATION:
- Execute `bun run dev` and navigate to the admin area
- Verify that there are no more visual references to separate cohorts
```

**Validation:**

- `grep -rn "neon_estrutura\|neon_escala" client/src/pages/Admin.tsx client/src/pages/VincularEmails.tsx client/src/components/admin/` returns no results

---

#### AT-008: Update Other Frontend Components

**Priority:** Medium
**Dependencies:** `[AT-003]`
**Parallel Safe:** Yes

**Description:** Additional components such as profile-card, MyDashboard, and MoltbotPage also reference cohorts.

**Files to Modify:**

1. `client/src/components/profile-card.tsx`
2. `client/src/pages/MyDashboard.tsx`
3. `client/src/pages/MoltbotPage.tsx`

**Implementation Prompt:**

```
You are a React and TypeScript expert. Execute the following modifications:

### File 1: client/src/components/profile-card.tsx

1. LOCATE the props interface (line 20):
   turma?: "neon_estrutura" | "neon_escala";

2. REMOVE this prop completely.

3. LOCATE the gradient logic based on cohort (lines 46-52) and SIMPLIFY to a single default gradient:
   const gradientClass = "bg-gradient-to-r from-purple-500 to-pink-500";

4. LOCATE the cohort Badge (lines 103-107) and REMOVE completely.

### File 2: client/src/pages/MyDashboard.tsx

1. LOCATE line 252:
   {currentMentorado?.turma === "neon_estrutura"

2. REMOVE all cohort conditional logic and replace with fixed text or remove the badge completely.

### File 3: client/src/pages/MoltbotPage.tsx

1. LOCATE lines 67 and 85 that check cohort and REMOVE the conditionals.

VALIDATION:
- Execute `bun run typecheck` to verify no type errors
- Visually verify that components render correctly
```

**Validation:**

- `grep -rn "neon_estrutura\|neon_escala" client/src/components/profile-card.tsx client/src/pages/MyDashboard.tsx client/src/pages/MoltbotPage.tsx` returns no results

---

### Phase 4: Polish (Data & Seeding)

#### AT-009: Unify Static Data in data.ts

**Priority:** Medium
**Dependencies:** `[AT-005]`
**Parallel Safe:** Yes

**Description:** The file `client/src/lib/data.ts` contains mock data separated by cohort that must be unified.

**Files to Modify:**

1. `client/src/lib/data.ts`

**Implementation Prompt:**

```
You are a TypeScript expert. Execute the following modifications on `client/src/lib/data.ts`:

1. LOCATE the `AnaliseCompleta` interface (lines 49-52):

   export interface AnaliseCompleta {
     neon_estrutura: GrupoAnalise;
     neon_escala: GrupoAnalise;
   }

2. REPLACE with:

   export interface AnaliseCompleta {
     neon: GrupoAnalise;
   }

3. LOCATE the `analiseData` object (line 54 onwards) and UNIFY the data:

   export const analiseData: AnaliseCompleta = {
     neon: {
       analise: {
         // Combine all mentees from both previous cohorts
         ...dadosNeonEstrutura,
         ...dadosNeonEscala,
       },
       ranking: [
         // Combine and reorder by score
         ...rankingCombinado,
       ],
       benchmarks: {
         meta_faturamento: 20000, // Average between 16000 and 30000
         posts_feed_min: 10,
         stories_min: 44,
         procedimentos_min: 8,
         leads_min: 50,
       },
     },
   };

4. REMOVE the `bonus_estrutura` property from mentee details (no longer relevant with a single cohort).

5. RECALCULATE the combined ranking by sorting all mentees by score.

VALIDATION:
- Execute `bun run typecheck`
- Verify that imports in other files do not break
```

**Validation:**

- `grep -n "neon_estrutura\|neon_escala" client/src/lib/data.ts` returns no results
- `bun run typecheck` passes

---

#### AT-010: Update Playbook Seeding Script

**Priority:** Low
**Dependencies:** `[AT-001]`
**Parallel Safe:** Yes

**Description:** The seeding script creates modules separated by cohort that must be unified.

**Files to Modify:**

1. `server/seed-playbook.ts`

**Implementation Prompt:**

```
You are a TypeScript and Drizzle ORM expert. Execute the following modifications on `server/seed-playbook.ts`:

1. LOCATE all references to `turma: "neon_estrutura"` and `turma: "neon_escala"`.

2. REPLACE all with `turma: "neon"`.

3. CONSIDER unifying duplicate modules (e.g.: if there is "Phase 1" for both cohorts, keep only one).

4. EXAMPLE of final structure:

   const [mod1] = await db
     .insert(playbookModules)
     .values({
       title: "Phase 1: Onboarding and Diagnostic",
       description: "First steps in the NEON methodology.",
       order: 1,
       turma: "neon", // Unified cohort
     })
     .returning();

VALIDATION:
- Execute `bun run seed:playbook` in the development environment
- Verify in the database that modules were created with cohort "neon"
```

**Validation:**

- `grep -n "neon_estrutura\|neon_escala" server/seed-playbook.ts` returns no results

---

### Phase 5: Validation

#### AT-011: Refactor or Remove TurmaView

**Priority:** Medium
**Dependencies:** `[AT-005, AT-009]`
**Parallel Safe:** Yes

**Description:** The TurmaView component was designed to display data for a specific cohort. With the unification, it must be refactored to a general view or removed.

**Files to Modify:**

1. `client/src/components/dashboard/TurmaView.tsx`

**Implementation Prompt:**

```
You are a React expert. Execute one of the following options for `client/src/components/dashboard/TurmaView.tsx`:

### Option A: Refactor to MentoradosUnifiedView

1. RENAME the file to `MentoradosUnifiedView.tsx`.

2. REMOVE the `type` prop from the interface.

3. UPDATE to use `analiseData.neon` directly:

   export function MentoradosUnifiedView() {
     const data = analiseData.neon;
     // ... rest of the logic
   }

4. REMOVE all conditional logic based on cohort type.

5. UPDATE the title to "NEON Overview".

### Option B: Remove Completely

1. DELETE the file `TurmaView.tsx`.

2. UPDATE `client/src/pages/Home.tsx` to not import this component.

3. CREATE a new inline section in Home.tsx to display the mentees.

VALIDATION:
- Execute `bun run dev` and verify that the application loads without errors
- Verify that mentee data is displayed correctly
```

**Validation:**

- Application loads without errors
- Mentee data is displayed in a unified view

---

#### AT-012: Final Cleanup and Complete Validation

**Priority:** Low
**Dependencies:** `[AT-001 through AT-011]`
**Parallel Safe:** No

**Description:** Perform a global search to ensure all references have been removed and run complete tests.

**Implementation Prompt:**

```
You are a code quality expert. Execute the following final verifications:

1. GLOBAL SEARCH for remaining references:
   grep -rn "neon_estrutura\|neon_escala\|Neon Estrutura\|Neon Escala" --include="*.ts" --include="*.tsx" --include="*.sql" --include="*.json" .

2. IGNORE results in:
   - node_modules/
   - .git/
   - Old snapshot files (if no longer needed)

3. FOR each result found, assess whether:
   - It is active code that needs to be updated
   - It is a history/backup file that can be ignored
   - It is a test that needs to be updated

4. EXECUTE validation commands:
   bun run typecheck
   bun run lint
   bun run test
   bun run build

5. FIX any errors found.

6. UPDATE the file `drizzle/meta/0000_snapshot.json` if necessary (usually auto-generated).

VALIDATION:
- All validation commands pass without errors
- Global search returns no results in active code
- Application works correctly in the development environment
```

**Validation:**

- `bun run typecheck` — 0 errors
- `bun run lint` — 0 warnings
- `bun run test` — All tests pass
- `bun run build` — Build completes successfully

---

## 4. Dependency Diagram

```
AT-001 (Database Migration)
    |
    |---> AT-002 (Backend Gamification)
    |        |
    |        └---> AT-003 (tRPC Routers)
    |                 |
    |                 |---> AT-005 (Home.tsx)
    |                 |        |
    |                 |        └---> AT-011 (TurmaView)
    |                 |
    |                 |---> AT-006 (RankingView)
    |                 |
    |                 |---> AT-007 (Admin Components)
    |                 |
    |                 └---> AT-008 (Other Components)
    |
    |---> AT-004 (Backend Services)
    |
    |---> AT-009 (data.ts) ---> AT-011
    |
    └---> AT-010 (Seed Playbook)

AT-012 (Final Validation) <-- All previous tasks
```

---

## 5. Rollback Considerations

In case of production issues, rollback should follow reverse order:

1. **Frontend:** Revert React component commits
2. **Backend:** Revert router and service commits
3. **Database:** Execute reverse migration (recreate enum with old values and update data)

**Database Rollback Script:**

```sql
-- Revert cohort enum
ALTER TYPE turma RENAME TO turma_new;
CREATE TYPE turma AS ENUM ('neon_estrutura', 'neon_escala');

-- Assign cohort based on criteria (e.g.: revenue target)
UPDATE mentorados
SET turma = CASE
  WHEN meta_faturamento <= 20000 THEN 'neon_estrutura'::turma
  ELSE 'neon_escala'::turma
END;

-- Update ranking_mensal similarly
UPDATE ranking_mensal SET turma = 'neon_estrutura'::turma;

-- Clean up temporary type
DROP TYPE turma_new;
```

---

## 6. Final Validation Checklist

| Item                         | Command/Action                           | Status |
| ---------------------------- | ---------------------------------------- | ------ |
| TypeScript compiles          | `bun run typecheck`                      |        |
| Lint passes                  | `bun run lint`                           |        |
| Tests pass                   | `bun run test`                           |        |
| Build completes              | `bun run build`                          |        |
| Global search clean          | `grep -rn "neon_estrutura\|neon_escala"` |        |
| Migration tested in dev      | Manual                                   |        |
| UI works correctly           | Manual                                   |        |
| Unified ranking works        | Manual                                   |        |
| Admin area works             | Manual                                   |        |

---

## 7. Next Steps

After approval of this plan:

1. Execute `/implement` to start the implementation
2. Or modify the plan as needed
3. Consider creating a `feature/unify-neon` branch for the changes

---

**Author:** Manus AI
**Date:** January 31, 2026
**Version:** 1.0
