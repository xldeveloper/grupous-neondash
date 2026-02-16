# PLAN-mentorados-evolucao-dezembro: Import December 2025 Data and Improve Evolution Page

> **Goal:** Import the December 2025 data from the `seed-dezembro.mjs` file into the Neon database and improve the evolution page to display month-over-month comparison.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | File `seed-dezembro.mjs` contains data for 14 mentees (5 Estrutura + 9 Escala) | 5/5 | Codebase | High - data already exists |
| 2 | Script incorrectly uses MySQL driver (`drizzle-orm/mysql2`) | 5/5 | Codebase | High - needs correction |
| 3 | Current database has 8 mentees, names do not match the seed | 5/5 | Neon DB | High - needs mapping |
| 4 | Only Mauricio Magalhaes has metrics (Jan/Feb 2026) | 5/5 | Neon DB | Medium - database almost empty |
| 5 | Page `EvolucaoView.tsx` already works with chart and table | 5/5 | Codebase | Low - already implemented |
| 6 | `SubmitMetricsForm.tsx` allows submitting metrics by month/year | 5/5 | Codebase | Low - already implemented |
| 7 | Cohort enum only has value "neon" (does not have "neon_estrutura"/"neon_escala") | 5/5 | Schema | Medium - data needs adaptation |

### Knowledge Gaps & Assumptions

- **Gap:** It is unclear whether the 8 current mentees correspond to the 14 in the seed or are different
- **Assumption:** The seed mentees need to be created as new records
- **Assumption:** The user wants mentees to be able to fill in January 2026 and see the comparison with December 2025

---

## 1. User Review Required

> [!IMPORTANT]
> **Mentee Discrepancy**
>
> The current database has 8 mentees:
> - Ana Mara Santos, Bruno Paixao, Elica Pereira, Enfa Tamara Dilma
> - Gabriela Santiago, Gabriela Alvares, Iza Rafaela, Mauricio Magalhaes
>
> The `seed-dezembro.mjs` file has 14 mentees with **different names**:
> - **Estrutura:** Ana Scaravate, Tamara Martins, Elica Pires, Ana Claudia, Iza Nunes
> - **Escala:** Lana Maximo, Thais Olimpia, Kleber Oliveira, Jessica Borges, Carmen Lucia, Alina Souza, Dra. Milena, Dra. Bruna, Dra. Jessica
>
> **Options:**
> 1. **Map similar names** (e.g.: "Elica Pereira" -> "Elica Pires")
> 2. **Create new mentees** for the 14 in the seed
> 3. **Insert data only for existing mentees** that have a match

> [!WARNING]
> The `seed-dezembro.mjs` script uses **MySQL driver** but the project uses **PostgreSQL/Neon**. It needs to be completely rewritten.

---

## 2. Proposed Changes

### Phase 1: Fix Seed Script

#### [MODIFY] [seed-dezembro.mjs](file:///home/mauricio/neondash/server/seed-dezembro.mjs)
- **Action:** Rewrite script to use PostgreSQL/Neon
- **Details:**
  - Replace `drizzle-orm/mysql2` with `@neondatabase/serverless`
  - Use existing `upsertMetricaMensal`
  - Map mentees by email or create direct SQL insertion

---

#### [NEW] [seed-dezembro-neon.ts](file:///home/mauricio/neondash/server/seed-dezembro-neon.ts)
- **Action:** Create new seed script compatible with Neon
- **Details:**
  - TypeScript with proper typing
  - Use Neon connection pool
  - Insert December 2025 metrics for existing mentees or create new ones

---

### Phase 2: Improve Evolution Page

#### [MODIFY] [EvolucaoView.tsx](file:///home/mauricio/neondash/client/src/components/dashboard/EvolucaoView.tsx)
- **Action:** Add highlighted month-over-month comparison
- **Details:**
  - Card with percentage variation vs previous month
  - Visual highlight (green/red) for growth/decline
  - Pre-select January 2026 in the metrics form

---

#### [MODIFY] [EvolutionChart.tsx](file:///home/mauricio/neondash/client/src/components/dashboard/EvolutionChart.tsx)
- **Action:** Improve visualization with variation indicators
- **Details:**
  - Add percentage variation labels on data points
  - Highlight current month vs previous

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> Each task has subtasks. Do not execute phase 2 tasks before completing phase 1.

### AT-001: Create Seed Script for Neon
**Goal:** Create TypeScript script that inserts December 2025 data into the Neon database
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Create file `server/seed-dezembro-neon.ts`
  - **File:** `server/seed-dezembro-neon.ts`
  - **Validation:** `bun run check` passes without errors
- [ ] ST-001.2: Implement connection to Neon using `@neondatabase/serverless`
  - **File:** `server/seed-dezembro-neon.ts`
  - **Validation:** Script connects to the database
- [ ] ST-001.3: Map seed data to existing mentees or create new ones
  - **File:** `server/seed-dezembro-neon.ts`
  - **Validation:** Query confirms mentees in the database
- [ ] ST-001.4: Insert December 2025 metrics
  - **File:** `server/seed-dezembro-neon.ts`
  - **Validation:** `SELECT * FROM metricas_mensais WHERE ano = 2025 AND mes = 12` returns data

**Rollback:** `DELETE FROM metricas_mensais WHERE ano = 2025 AND mes = 12;`

---

### AT-002: Execute Seed and Validate Data
**Goal:** Run the script and confirm data was inserted correctly
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Execute seed script
  - **File:** Terminal
  - **Validation:** Output shows "Migration completed"
- [ ] ST-002.2: Validate data in the database via SQL
  - **File:** Neon Console
  - **Validation:** Query returns 14+ records for December 2025
- [ ] ST-002.3: Validate in the UI that data appears
  - **File:** Browser
  - **Validation:** Evolution page shows December data

**Rollback:** `DELETE FROM metricas_mensais WHERE ano = 2025 AND mes = 12;`

---

### AT-003: Improve EvolucaoView with Month-over-Month Comparison
**Goal:** Add variation visualization between months on the evolution page
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-003.1: Create `MonthComparison` component to display variation
  - **File:** `client/src/components/dashboard/MonthComparison.tsx`
  - **Validation:** Component renders without errors
- [ ] ST-003.2: Calculate percentage variation between consecutive months
  - **File:** `client/src/components/dashboard/EvolucaoView.tsx`
  - **Validation:** Correct variation calculation
- [ ] ST-003.3: Add visual indicators (green/red)
  - **File:** `client/src/components/dashboard/EvolucaoView.tsx`
  - **Validation:** UI shows correct colors

**Rollback:** Git revert the file

---

### AT-004: Pre-select January 2026 in the Form
**Goal:** Facilitate January 2026 entry by mentees
**Dependencies:** None

#### Subtasks:
- [ ] ST-004.1: Detect if mentee already has December 2025 data
  - **File:** `client/src/components/dashboard/SubmitMetricsForm.tsx`
  - **Validation:** Hook returns correct boolean
- [ ] ST-004.2: If yes, pre-select January 2026 automatically
  - **File:** `client/src/components/dashboard/SubmitMetricsForm.tsx`
  - **Validation:** Form opens with January 2026 selected
- [ ] ST-004.3: Add informational message about comparison
  - **File:** `client/src/components/dashboard/SubmitMetricsForm.tsx`
  - **Validation:** Message appears when there is previous data

**Rollback:** Git revert the file

---

## 4. Verification Plan

### Automated Tests
- `bun run check` - TypeScript validation
- `bun run lint` - Code formatting
- `bun test` - Unit tests

### Manual Verification
1. Execute seed script and verify logs
2. Query Neon database to confirm insertion
3. Access `/meu-dashboard` -> Evolution
4. Verify that chart shows December 2025
5. Verify that table shows December 2025
6. Fill in January 2026 data
7. Verify month-over-month comparison

---

## 5. Rollback Plan

```bash
# If database data needs to be reverted:
DELETE FROM metricas_mensais WHERE ano = 2025 AND mes = 12;
DELETE FROM feedbacks WHERE ano = 2025 AND mes = 12;

# If code needs to be reverted:
git checkout HEAD -- client/src/components/dashboard/EvolucaoView.tsx
git checkout HEAD -- client/src/components/dashboard/SubmitMetricsForm.tsx
```
