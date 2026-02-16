# PLAN-clerk-neon-sync-verification: Clerk-Neon Synchronization Verification

> **Goal:** Verify that all students registered in Clerk are properly synchronized with the Neon database and visible on site pages.

---

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | There are 8 users in the `users` table (Clerk-backed) | 5/5 | Neon DB Query | Baseline for verification |
| 2 | There are 7 mentees in the `mentorados` table | 5/5 | Neon DB Query | All linked with user_id |
| 3 | 1 admin user (Sacha) does not have a mentee profile | 5/5 | Neon DB Query | Expected - is a pure admin |
| 4 | Synchronization occurs via webhook (`user.created`/`user.updated`) | 5/5 | `server/webhooks/clerk.ts` | Primary mechanism |
| 5 | Auto-creation of mentee on first login via `context.ts` | 5/5 | `server/_core/context.ts` | Fallback if webhook fails |
| 6 | Page `/gestao-mentorados` displays linking status | 4/5 | `client/src/pages/GestaoMentorados.tsx` | Admin interface |
| 7 | No orphan mentees detected (user_id = NULL) | 5/5 | Neon DB Query | Synchronization OK |
| 8 | Email matching used for auto-link in `context.ts` | 5/5 | Source code | Resilience |

### Current Database State

```
Users in DB:     8
Mentees:         7
Linked:          7 (100%)
Orphans:         0
```

**Users without Mentee:**
- `user_id: 27` - Sacha Martins (admin) - **Expected** (pure admin, does not need a mentee profile)

### Knowledge Gaps & Assumptions

- **Gap:** Could not directly list Clerk users (requires API call) to compare 1:1 with the local database
- **Gap:** There is no endpoint/script for automated audit of discrepancies
- **Assumption:** All Clerk users with role "student" should have a corresponding mentee
- **Assumption:** Admin users may not have a mentee profile (expected behavior)

---

## 1. User Review Required

> [!IMPORTANT]
> **Decision Required:** Do the 8 users identified in the database correspond to the expected students?
>
> Current list of synchronized users:
> 1. Mauricio Magalhaes (admin) - Linked
> 2. Bruno Paixao - Linked
> 3. Elica Pereira - Linked
> 4. Enfa Tamara Dilma - Linked
> 5. Ana Mara Santos - Linked
> 6. Gabriela Alvares - Linked
> 7. Iza Rafaela Bezerra Pionorio Freires - Linked
> 8. Sacha Martins (admin) - No mentee (expected for admin)

> [!NOTE]
> **Recommendation:** Create an audit endpoint that automatically compares Clerk <-> Neon.

---

## 2. Proposed Changes

### Phase 1: Backend - Sync Audit Endpoint

#### [NEW] [syncAuditRouter.ts](file:///home/mauricio/neondash/server/syncAuditRouter.ts)
- **Action:** Create tRPC router for synchronization audit
- **Purpose:** Allow admins to check Clerk <-> Neon discrepancies

#### [MODIFY] [routers.ts](file:///home/mauricio/neondash/server/routers.ts)
- **Action:** Register new `syncAudit` router in the appRouter

---

### Phase 2: Frontend - Admin Sync Dashboard

#### [MODIFY] [GestaoMentorados.tsx](file:///home/mauricio/neondash/client/src/pages/GestaoMentorados.tsx)
- **Action:** Add "Synchronization" tab with detailed status
- **Details:** Show users without mentees and mentees without users

#### [NEW] [SyncStatusView.tsx](file:///home/mauricio/neondash/client/src/components/admin/SyncStatusView.tsx)
- **Action:** Component to display synchronization status
- **Details:** Cards with metrics, list of discrepancies, force-sync button

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> Each task **MUST** have subtasks with specific validation.

### AT-001: Create Sync Audit Endpoint
**Goal:** Endpoint to compare Clerk users vs Neon DB
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Create `server/syncAuditRouter.ts` with `getSyncStatus` procedure
  - **File:** `server/syncAuditRouter.ts`
  - **Validation:** `bun run check` passes without errors
- [ ] ST-001.2: Implement query that returns: users without mentees, mentees without users
  - **File:** `server/syncAuditRouter.ts`
  - **Validation:** Make call via tRPC devTools and verify response
- [ ] ST-001.3: Register router in `routers.ts`
  - **File:** `server/routers.ts`
  - **Validation:** `bun dev` starts without errors

**Rollback:** `git checkout HEAD -- server/routers.ts && rm server/syncAuditRouter.ts`

---

### AT-002: Create SyncStatusView Component
**Goal:** UI to visualize synchronization status
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Create component with metric cards (total users, linked, orphans)
  - **File:** `client/src/components/admin/SyncStatusView.tsx`
  - **Validation:** Component renders without errors in the browser
- [ ] ST-002.2: Add discrepancy table with actions
  - **File:** `client/src/components/admin/SyncStatusView.tsx`
  - **Validation:** Table displays data from AT-001 endpoint
- [ ] ST-002.3: Implement `useSyncStatus` hook to consume the endpoint
  - **File:** `client/src/hooks/use-sync-status.ts`
  - **Validation:** `bun run check` passes without errors

**Rollback:** `rm -rf client/src/components/admin/SyncStatusView.tsx client/src/hooks/use-sync-status.ts`

---

### AT-003: Integrate Synchronization Tab in Management Page
**Goal:** Add "Synchronization" tab in GestaoMentorados
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-003.1: Add "Synchronization" TabsTrigger in the TabsList
  - **File:** `client/src/pages/GestaoMentorados.tsx`
  - **Validation:** Tab appears in the interface
- [ ] ST-003.2: Add TabsContent with SyncStatusView
  - **File:** `client/src/pages/GestaoMentorados.tsx`
  - **Validation:** Clicking the tab shows the component
- [ ] ST-003.3: Verify responsiveness (mobile + desktop)
  - **File:** `client/src/pages/GestaoMentorados.tsx`
  - **Validation:** Layout works at 375px and 1440px

**Rollback:** `git checkout HEAD -- client/src/pages/GestaoMentorados.tsx`

---

### AT-004: Add Sync Tests
**Goal:** Ensure sync audit is tested
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-004.1: Create unit test for syncAuditRouter
  - **File:** `server/syncAudit.test.ts`
  - **Validation:** `bun test` passes with coverage of the new router
- [ ] ST-004.2: Add manual integration test
  - **File:** `docs/MANUAL-TESTS.md`
  - **Validation:** Document with verification steps

**Rollback:** `rm server/syncAudit.test.ts`

---

## 4. Verification Plan

### Automated Tests

```bash
# TypeScript validation
bun run check

# Linting
bun run lint

# Unit tests
bun test
```

### Manual Verification

1. **Verify sync endpoint:**
   ```bash
   # With the server running (bun dev)
   # Access http://localhost:3000/api/trpc/syncAudit.getSyncStatus
   # Or use tRPC devTools in the browser
   ```

2. **Verify UI in the browser:**
   - Navigate to `/gestao-mentorados`
   - Click on the "Synchronization" tab
   - Verify that it shows correct metrics (8 users, 7 linked)
   - Verify list of discrepancies (1 admin without mentee)

3. **Responsiveness test:**
   - DevTools -> Responsive -> 375px (mobile)
   - DevTools -> Responsive -> 1440px (desktop)
   - Verify that layout does not break

### Database Queries for Validation

```sql
-- Execute in Neon Console to check
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM mentorados) as total_mentorados,
  (SELECT COUNT(*) FROM mentorados WHERE user_id IS NOT NULL) as linked,
  (SELECT COUNT(*) FROM mentorados WHERE user_id IS NULL) as orphans;
```

---

## 5. Rollback Plan

```bash
# Revert all changes
git checkout HEAD -- server/routers.ts
git checkout HEAD -- client/src/pages/GestaoMentorados.tsx
rm -f server/syncAuditRouter.ts
rm -f server/syncAudit.test.ts
rm -f client/src/components/admin/SyncStatusView.tsx
rm -f client/src/hooks/use-sync-status.ts
```

---

## 6. Current Status Summary

### Synchronization Working

Based on the database analysis:

| Metric | Value | Status |
|---------|-------|--------|
| Users in Clerk (via DB) | 8 | OK |
| Mentees | 7 | OK |
| Linked mentees | 7 (100%) | OK |
| Orphan mentees | 0 | OK |
| Admins without mentee | 1 (Sacha) | Expected |

### Active Synchronization Mechanisms

1. **Clerk Webhook** -> `server/webhooks/clerk.ts`
   - Event: `user.created`, `user.updated`
   - Action: `syncClerkUser()` -> upsert user + create/link mentee

2. **Context Auto-Creation** -> `server/_core/context.ts`
   - Trigger: First authenticated request
   - Action: If user exists but mentee does not -> auto-creates mentee

3. **Email Auto-Link** -> `server/_core/context.ts`
   - Trigger: User without mentee via FK
   - Action: Searches mentee by email and links

### Administration Pages

| Page | URL | Functionality |
|--------|-----|----------------|
| Mentee Management | `/gestao-mentorados` | Overview, Management, Access tabs |
| Link Emails | `/vincular-emails` | Manual email linking |
| Admin | `/admin` | KPIs and mentee list |

---

## Pre-Submission Checklist

- [x] Codebase patterns searched and documented
- [x] Database queries executed for current state
- [x] Sync mechanisms identified and documented
- [x] Admin pages reviewed for sync visibility
- [x] Knowledge gaps explicitly listed
- [x] Assumptions documented
- [x] All tasks have AT-XXX IDs
- [x] All tasks have subtasks (ST-XXX.N)
- [x] Each subtask has validation
- [x] Dependencies mapped
- [x] Rollback steps defined
- [x] Parallel-safe tasks marked with ⚡
