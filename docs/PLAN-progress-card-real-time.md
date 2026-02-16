# PLAN-progress-card-real-time: Connect Overall Progress Card to Activities

> **Goal:** Configure the "Overall Progress" card in the Overview tab of the dashboard to display in real time the progress of activities executed by mentees.

---

## 0. Research Findings

| #   | Finding                                                       | Confidence | Source                         | Impact    |
| --- | ------------------------------------------------------------- | ---------- | ------------------------------ | --------- |
| 1   | "Overall Progress" card displays **75% hardcoded**            | 5/5        | MyDashboard.tsx:247-250        | Bug       |
| 2   | Backend `atividades.getProgress` returns progress map         | 5/5        | atividadesRouter.ts:17-33      | Ready     |
| 3   | `calcularProgresso()` already calculates total/completed/percentage | 5/5   | atividades-data.ts:516-539     | Reusable  |
| 4   | `AtividadesContent.tsx` uses correct fetch + calculation pattern | 5/5     | AtividadesContent.tsx:71-99    | Model     |
| 5   | Admin can view any mentee's progress via ID                   | 5/5        | atividadesRouter.ts:39-57      | Ready     |
| 6   | `targetMentoradoId` is already available in the dashboard     | 5/5        | MyDashboard.tsx:67-68          | Ready     |
| 7   | shadcn `Progress` component available                         | 5/5        | components/ui/progress.tsx     | Use it    |

### Knowledge Gaps

- **None**: All backend infrastructure is implemented.

### Assumptions to Validate

1. Refetch will be automatic when a mentee marks a step as completed (should work via React Query cache invalidation)
2. Progress variation (e.g.: +5%) requires previous month data (optional, can be implemented later)

---

## 1. User Review Required

> [!IMPORTANT]
> **Design Decision**: The percentage variation (`+5%`, currently shown as hardcoded) requires comparison with previous month.
>
> **Options:**
> - **A) Simple**: Show only current progress without variation (immediate implementation)
> - **B) Complete**: Calculate variation vs. previous month (requires additional snapshot logic)
>
> **Recommendation**: Option A for MVP, add B later if needed.

---

## 2. Proposed Changes

### Dashboard Component

#### [MODIFY] [MyDashboard.tsx](file:///home/mauricio/neondash/client/src/pages/MyDashboard.tsx)

**Lines 240-257**: Replace hardcoded values with real query

**Changes:**
1. Add `trpc.atividades.getProgress` query (or `getProgressById` for admin)
2. Import and use `calcularProgresso` from `atividades-data.ts`
3. Display real `percentage`, `completed` and `total`
4. Handle loading state with Skeleton

**Current code (hardcoded):**
```tsx
<span className="text-4xl font-bold text-primary">75%</span>
<span className="text-green-500 flex items-center text-sm">
  <TrendingUp className="w-4 h-4 mr-1" /> +5%
</span>
```

**Proposed code (dynamic):**
```tsx
// Progress query (inside the component)
const progressQuery = isAdmin && selectedMentoradoId
  ? trpc.atividades.getProgressById.useQuery({ mentoradoId: parseInt(selectedMentoradoId, 10) })
  : trpc.atividades.getProgress.useQuery();

const { percentage, completed, total } = calcularProgresso(
  Object.fromEntries(
    Object.entries(progressQuery.data ?? {}).map(([k, v]) => [k, v.completed])
  )
);

// In JSX
{progressQuery.isLoading ? (
  <Skeleton className="h-10 w-20" />
) : (
  <span className="text-4xl font-bold text-primary">{percentage}%</span>
)}
```

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> Each task MUST have subtasks. No single-line tasks allowed.

### AT-001: Add Progress Query to MyDashboard

**Goal:** Fetch real activity progress data
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Import `calcularProgresso` from `@/data/atividades-data`
  - **File:** `client/src/pages/MyDashboard.tsx`
  - **Validation:** No import errors in TypeScript
- [ ] ST-001.2: Add conditional query (getProgress vs getProgressById)
  - **File:** `client/src/pages/MyDashboard.tsx`
  - **Validation:** `bun run check` passes

**Rollback:** `git checkout client/src/pages/MyDashboard.tsx`

---

### AT-002: Update Progress Card with Real Data

**Goal:** Display real progress instead of hardcoded value
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Replace hardcoded `75%` with `{percentage}%`
  - **File:** `client/src/pages/MyDashboard.tsx` (line 247)
  - **Validation:** UI displays dynamic value
- [ ] ST-002.2: Add loading message with Skeleton
  - **File:** `client/src/pages/MyDashboard.tsx`
  - **Validation:** Skeleton appears during fetch
- [ ] ST-002.3: Update descriptive text based on progress
  - **File:** `client/src/pages/MyDashboard.tsx` (line 252-254)
  - **Validation:** Message changes according to progress

**Rollback:** `git checkout client/src/pages/MyDashboard.tsx`

---

### AT-003: Remove Variation Indicator (MVP)

**Goal:** Remove hardcoded "+5%" temporarily
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-003.1: Hide or remove variation span
  - **File:** `client/src/pages/MyDashboard.tsx` (lines 248-250)
  - **Validation:** No more hardcoded "+5%"

**Rollback:** Restore lines 248-250

---

## 4. Verification Plan

### Automated Tests

| Check      | Command         | Expected Result        |
| ---------- | --------------- | ---------------------- |
| TypeScript | `bun run check` | Exit code 0, no errors |
| Build      | `bun run build` | Build succeeds         |
| Lint       | `bun run lint`  | No errors              |

### Manual Verification

1. **Verify zero progress:**
   - Login as a mentee **without** completed activities
   - Access `/meu-dashboard`
   - Card should show `0%` and appropriate message

2. **Verify partial progress:**
   - Go to "Activities" tab
   - Mark 2-3 steps as completed
   - Return to "Overview" tab
   - Card should update automatically (via React Query cache)

3. **Verify admin view:**
   - Login as admin
   - Select a mentee via FloatingDock
   - Card should show the selected mentee's progress

4. **Verify loading state:**
   - Access dashboard
   - Skeleton should appear briefly before data loads

---

## 5. Rollback Plan

```bash
# Revert all changes
git checkout client/src/pages/MyDashboard.tsx
```

---

## Pre-Submission Checklist

- [x] Created docs/PLAN-{slug}.md file
- [x] Codebase patterns searched and documented
- [x] Context7/docs consulted for all technologies
- [x] Findings Table with 7 entries and confidence scores
- [x] Knowledge Gaps explicitly listed
- [x] Assumptions to Validate listed
- [x] Edge cases documented
- [x] All tasks have AT-XXX IDs
- [x] All tasks have subtasks (ST-XXX.N)
- [x] Each subtask has validation
- [x] Dependencies mapped
- [x] Rollback steps defined
- [x] Parallel-safe tasks marked with ⚡
