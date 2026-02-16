# Plan: Auto-Creation of Mentee Profile on First Login

## Metadata
- **complexity**: L6 — Involves changes to tRPC context middleware, session cache, synchronization between Clerk and NeonDB, and multiple edge case scenarios
- **estimated_time**: 4-6 hours
- **parallel_safe**: false (context changes affect the entire application)

---

## Objective
**task**: Implement a robust mechanism for auto-creating a mentee profile on first login, ensuring that new users see a functional dashboard immediately without infinite loading screens.

**context**: Neon Dashboard (React 19 + Vite 7 + tRPC 11 + Drizzle ORM + Neon PostgreSQL + Clerk Auth). The current system has basic auto-creation in `createContext`, but suffers from race conditions with the session cache.

**why_this_matters**: New mentees currently see placeholder/skeletons loading indefinitely because the cached context may not contain the newly created mentee, or silent failures occur during creation.

---

## Environment
- **runtime**: Bun 1.x
- **framework**: React 19 + Vite 7
- **backend**: Express + tRPC 11
- **database**: Neon PostgreSQL
- **orm**: Drizzle ORM
- **auth**: Clerk (@clerk/clerk-react + @clerk/express)
- **ui**: shadcn/ui
- **testing**: Bun test + Vitest

---

## Research Summary

### Findings Table

| # | Finding | Confidence (1-5) | Source | Impact |
|---|---------|------------------|--------|--------|
| 1 | Auto-creation of mentee ALREADY EXISTS in `server/_core/context.ts` lines 113-148 | 5 | Code audit | Logic exists but has race condition issues |
| 2 | Session cache in `sessionCache.ts` can return context without mentee | 5 | Code audit | Causes infinite loading on cache hit without mentee |
| 3 | `mentorados.me` query returns `ctx.mentorado` directly | 5 | `server/mentoradosRouter.ts:63-65` | If context has no mentee, query fails |
| 4 | `getOverviewStats` throws FORBIDDEN if `ctx.mentorado` is null | 5 | `server/mentoradosRouter.ts:474-479` | Dashboard fails silently for new users |
| 5 | `AuthSync.tsx` calls `syncUser` only once via `useRef` | 5 | Code audit | If it fails, there is no automatic retry |
| 6 | `upsertUserFromClerk` creates/updates user but does not guarantee mentee | 4 | `server/db.ts:90-137` | Separation of concerns between user and mentee |
| 7 | `mentorados` table has required fields: `nomeCompleto`, `turma` | 5 | `drizzle/schema.ts:115-161` | Default values must be provided during creation |
| 8 | Dashboard expects `stats.financials.chartData` - empty array is valid | 4 | `MenteeOverview.tsx:46-54` | NewMentoradoWelcome is displayed when there is no data |
| 9 | `users` -> `mentorados` relationship is 1:1 via `userId` FK | 5 | `drizzle/relations.ts:25-30` | Important constraint for integrity |
| 10 | `mentoradoProcedure` middleware requires `ctx.mentorado` | 5 | `server/_core/trpc.ts:30-53` | Procedure-level protection |
| 11 | Drizzle supports `onConflictDoNothing()` for idempotent upsert | 5 | Context7 - Drizzle ORM Docs | Eliminates race conditions on INSERT |
| 12 | Clerk webhooks are asynchronous and NOT guaranteed | 5 | Context7 - Clerk Docs | Should not be used for synchronous onboarding |
| 13 | Neon HTTP driver is stateless, ideal for serverless | 4 | Context7 - Drizzle Docs | Limitations with interactive transactions |
| 14 | `SELECT FOR UPDATE` prevents race conditions in PostgreSQL | 4 | Tavily Research | Pessimistic lock for concurrency |

### Knowledge Gaps

1. **Actual failure rate**: We have no metrics on how many users encounter this issue
2. **Cache expiration time**: The TTL of the `sessionCache` is unclear in the code
3. **Concurrency**: Behavior when multiple simultaneous requests attempt to create the same mentee
4. **Required initial data**: Which tables besides `mentorados` need to be populated?
5. **Clerk Webhook**: Does the system use webhooks for synchronization? (not found in the codebase)

### Assumptions to Validate

1. **Assumption**: The problem only occurs when the user exists but the mentee was not created
   - **Validation**: Check logs for `mentorado_creation_failed`

2. **Assumption**: Session cache is the main cause of infinite loading
   - **Validation**: Add logging to distinguish cache hit vs miss

3. **Assumption**: A mentee with minimal data is sufficient for the dashboard to work
   - **Validation**: Test dashboard with a mentee without metrics/diagnostic

---

## MCP Research Insights

### Clerk Best Practices (Context7)
- **Webhook Limitations**: Webhooks are asynchronous, eventually consistent, and NOT guaranteed. They should not be used for synchronous onboarding flows.
- **Recommended Synchronization**: Create/update profile during the authentication flow (in `createContext` or a dedicated endpoint), do not depend on webhooks.
- **Webhook Verification**: If implementing webhooks in the future, use `verifyWebhook` from `@clerk/backend/webhooks` with a signing secret.

### Drizzle ORM Patterns (Context7)
- **Idempotent Upsert**: Use `onConflictDoNothing()` or `onConflictDoUpdate()` for idempotent operations:
  ```typescript
  await db.insert(mentorados).values(data).onConflictDoNothing();
  ```
- **Transactions**: Neon HTTP driver has limitations with interactive transactions. Use `onConflict` pattern for atomicity in simple operations.
- **Constraints**: Adding a UNIQUE constraint on `mentorados.userId` enables safe upsert.

### Race Condition Prevention (Tavily Research)
- **Database-Level Locks**: Use `SELECT FOR UPDATE` for pessimistic locking when needed.
- **Cache Patterns**: Implement versioned keys or compare-and-swap for cache.
- **Distributed Locks**: Redlock pattern for critical operations (use Redis or similar).

### tRPC Middleware (Context7)
- **Composition**: Use `t.procedure.use(middleware)` for composition.
- **Context Enrichment**: Pass enriched data via `return next({ ctx: { ...ctx, user } })`.
- **Error Handling**: Use `TRPCError` with appropriate codes.

---

## Relevant Files

### Must Read
- **path**: `server/_core/context.ts`
  - **relevance**: Contains mentee auto-creation logic and session cache
- **path**: `server/_core/sessionCache.ts`
  - **relevance**: Manages session cache that causes race condition
- **path**: `server/routers/auth.ts`
  - **relevance**: `syncUser` endpoint called by the frontend
- **path**: `server/mentoradosRouter.ts`
  - **relevance**: `me` and `getOverviewStats` queries used by the dashboard
- **path**: `client/src/components/auth/AuthSync.tsx`
  - **relevance**: Component that triggers synchronization on login

### May Reference
- **path**: `client/src/pages/MyDashboard.tsx`
  - **relevance**: Page that displays loading skeletons
- **path**: `client/src/components/dashboard/MenteeOverview.tsx`
  - **relevance**: Component that decides between dashboard or welcome screen
- **path**: `server/_core/trpc.ts`
  - **relevance**: Definition of `protectedProcedure` and `mentoradoProcedure`
- **path**: `server/db.ts`
  - **relevance**: `upsertUserFromClerk` function
- **path**: `drizzle/schema.ts`
  - **relevance**: Complete table schema

---

## Existing Patterns

### naming
- tRPC procedures: camelCase (e.g.: `getOverviewStats`, `syncUser`)
- Drizzle tables: snake_case in DB, camelCase in code
- Context variables: `ctx.user`, `ctx.mentorado`

### file_structure
- tRPC routers: `server/*Router.ts` or `server/routers/*.ts`
- React components: `client/src/components/**/*.tsx`
- Pages: `client/src/pages/*.tsx`
- Core/Utils: `client/src/_core/` and `server/_core/`

### error_handling
- TRPCError with specific codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`
- User-facing messages in Portuguese
- Logging via `createLogger` in `_core/logger.ts`

### state_management
- TanStack Query (React Query) for data caching on the frontend
- tRPC as transport layer
- tRPC context with `user` and `mentorado` resolved per request

---

## Constraints

### non_negotiable
- DO NOT break existing authentication
- Maintain compatibility with admin users
- Preserve session cache for performance
- Auto-creation must be transactional (user + mentee)
- Respect Clerk rate limits

### preferences
- Detailed logging for debugging
- Automatic retry with exponential backoff
- Metrics/alerts for creation failures
- Graceful fallback when mentee does not exist

---

## Chain of Thought

### Research
- **Codebase patterns**: Auto-creation exists in `context.ts` but is vulnerable to race conditions
- **Docs consulted**: Clerk Express SDK, Drizzle ORM docs (implicit knowledge)
- **Security**: Context protects routes, but cache may expose stale data
- **Edge cases**: Cache hit without mentee, multiple simultaneous requests, DB failure

### Analyze
- **Core requirement**: Ensure every authenticated user has a valid mentee
- **Technical constraints**: Session cache is necessary for performance
- **Integration points**: Clerk <-> tRPC context <-> Drizzle ORM <-> NeonDB

### Think
**step_by_step**:
1. First: Fix race condition in session cache (invalidate/refresh when mentee is created)
2. Then: Add retry in `AuthSync` to handle transient failures
3. Then: Create dedicated `ensureMentorado` endpoint for explicit verification
4. Then: Add frontend fallback for "no mentee" state
5. Finally: Implement metrics and monitoring

**tree_of_thoughts**:

**approach_a**: Modify `createContext` to always verify/create mentee (current)
- **pros**: Simple, centralized
- **cons**: Race condition with cache, performance impacts all requests
- **score**: 6/10

**approach_b**: Dedicated `auth.ensureMentorado` endpoint called by the frontend
- **pros**: Explicit control, better error handling, can retry
- **cons**: Requires frontend change, one extra call on login
- **score**: 8/10

**approach_c**: Clerk Webhook + background job
- **pros**: Asynchronous, does not affect login
- **cons**: Complex, requires job infrastructure, delay on first access
- **score**: 5/10

**selected**: approach_b with improvements to existing context
**rationale**: Balances simplicity with robustness, allows retry on the frontend, and resolves the race condition issue without rewriting everything

---

## Edge Cases / Failure Modes

| # | Edge Case | Impact | Mitigation |
|---|-----------|--------|------------|
| 1 | User performs multiple simultaneous logins (different devices) | Race condition on mentee creation | Use `ON CONFLICT` or transaction with `SELECT FOR UPDATE` |
| 2 | Session cache returns user without mentee | Infinite loading on dashboard | Invalidate cache when mentee is created; add verification on cache hit |
| 3 | Network failure during mentee creation | User without mentee, retries fail | Exponential retry on frontend; idempotent endpoint |
| 4 | Clerk returns user without email | Cannot link by email | Create mentee without email, associate only by userId |
| 5 | Database unavailable | 500 error, user cannot use app | Fallback to "read-only" mode or appropriate message |
| 6 | User exists, mentee exists but with `userId` null | Link was not made | Detect and auto-link in `syncUser` |
| 7 | Multiple mentees with the same email | Ambiguity in linking | Log alert, do not auto-link |
| 8 | `syncUser` called before `createContext` completes | Inconsistent state | Ensure execution order via React dependencies |
| 9 | Admin creates mentee manually while user logs in | Creation conflict | Check existence before inserting |
| 10 | Session cache expires between creation and first use | Unnecessary re-creation | Adequate TTL, idempotency in creation |

---

## Atomic Tasks

### Phase 1: Foundation (Fix Core Logic)

#### AT-001: Fix race condition in session cache
- **id**: AT-001
- **title**: Invalidate session cache when mentee is created
- **phase**: 1
- **priority**: critical
- **dependencies**: []
- **parallel_safe**: false
- **files_to_modify**:
  - `server/_core/context.ts`
  - `server/_core/sessionCache.ts`
- **implementation_notes**: |
  After creating the mentee in `context.ts`, invalidate the session cache:
  ```typescript
  // After db.insert(mentorados)...
  await invalidateCachedSession(auth.userId);
  ```

  Add function in `sessionCache.ts`:
  ```typescript
  export async function invalidateCachedSession(clerkId: string): Promise<void> {
    await redis.del(`session:${clerkId}`);
  }
  ```
- **validation**:
  - Test login with a new user
  - Verify that cache is invalidated after creation
  - Confirm that the second request has the mentee
- **rollback**: Revert to previous version of context.ts
- **acceptance_criteria**:
  - [ ] After mentee creation, cache is invalidated or updated
  - [ ] Next request returns the correct mentee
  - [ ] No race conditions in load tests

#### AT-002: Add mentee verification on cache hit
- **id**: AT-002
- **title**: Verify mentee even on cache hit
- **phase**: 1
- **priority**: high
- **dependencies**: [AT-001]
- **parallel_safe**: false
- **files_to_modify**:
  - `server/_core/context.ts`
- **validation**:
  - Simulate cache with user without mentee
  - Verify that the system detects and creates the mentee
- **rollback**: Remove additional verification
- **acceptance_criteria**:
  - [ ] Cache hit with user without mentee triggers creation
  - [ ] No performance degradation >100ms
  - [ ] Logs indicate "cache hit but mentorado missing"

### Phase 2: API & Frontend (Explicit Control)

#### AT-003: Create `auth.ensureMentorado` procedure
- **id**: AT-003
- **title**: Create dedicated endpoint for mentee verification/creation
- **phase**: 2
- **priority**: critical
- **dependencies**: [AT-001, AT-002]
- **parallel_safe**: true
- **files_to_modify**:
  - `server/routers/auth.ts`
- **files_to_create**: []
- **implementation_notes**: |
  Use idempotent upsert pattern with `onConflictDoNothing`:

  ```typescript
  ensureMentorado: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.mentorado) {
      return { success: true, mentorado: ctx.mentorado, created: false };
    }

    const user = ctx.user!;
    const db = getDb();

    // Try to insert, ignore if already exists (race condition safe)
    await db.insert(mentorados)
      .values({
        userId: user.id,
        nomeCompleto: user.name || "New User",
        email: user.email,
        fotoUrl: user.imageUrl,
        turma: "neon",
        ativo: "sim",
        metaFaturamento: 16000,
        metaLeads: 50,
        metaProcedimentos: 10,
        metaPosts: 12,
        metaStories: 60,
      })
      .onConflictDoNothing({ target: mentorados.userId });

    // Fetch the mentee (existing or newly created)
    const mentorado = await db.query.mentorados.findFirst({
      where: eq(mentorados.userId, user.id),
    });

    // Invalidate cache for subsequent requests
    await invalidateCachedSession(user.clerkId);

    return { success: true, mentorado, created: true };
  }),
  ```

  **Note**: Requires UNIQUE constraint on `mentorados.userId` (AT-006).
- **validation**:
  - Test with user without mentee -> should create
  - Test with user with mentee -> should return existing
  - Test idempotency (multiple simultaneous calls)
- **rollback**: Remove procedure
- **acceptance_criteria**:
  - [ ] Endpoint creates mentee if it does not exist
  - [ ] Returns existing mentee if one already exists
  - [ ] Is idempotent (100 simultaneous calls = 1 mentee)
  - [ ] Uses `onConflictDoNothing` for race condition safety

#### AT-004: Update `AuthSync` to use `ensureMentorado`
- **id**: AT-004
- **title**: Modify AuthSync component to use new endpoint with retry
- **phase**: 2
- **priority**: high
- **dependencies**: [AT-003]
- **parallel_safe**: false
- **files_to_modify**:
  - `client/src/components/auth/AuthSync.tsx`
- **implementation_notes**: |
  Use TanStack Query's built-in retry with exponential backoff:

  ```typescript
  export function AuthSync() {
    const { isAuthenticated } = useAuth();
    const hasSynced = useRef(false);
    const utils = trpc.useUtils();

    const { mutate: ensureMentorado, isPending } = trpc.auth.ensureMentorado.useMutation({
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 1s, 2s, 4s
      onSuccess: (data) => {
        if (data.created) {
          toast.success("Profile created successfully!");
        }
        // Invalidate queries to force refetch
        utils.mentorados.me.invalidate();
        utils.auth.me.invalidate();
      },
      onError: (error) => {
        toast.error("Error preparing your profile. Try reloading the page.");
        console.error("ensureMentorado failed:", error);
      },
    });

    useEffect(() => {
      if (isAuthenticated && !hasSynced.current) {
        hasSynced.current = true;
        ensureMentorado();
      }
    }, [isAuthenticated, ensureMentorado]);

    // Optional: Show loading indicator
    if (isPending) {
      return <LoadingToast message="Preparing your profile..." />;
    }

    return null;
  }
  ```
- **validation**:
  - Test login with a new user
  - Verify retry on simulated failure
  - Confirm that toast appears only when appropriate
- **rollback**: Revert to `syncUser`
- **acceptance_criteria**:
  - [ ] Uses `ensureMentorado` instead of `syncUser`
  - [ ] Implements retry with exponential backoff (3 attempts: 1s, 2s, 4s)
  - [ ] Invalidates TanStack queries on success
  - [ ] Shows visual feedback during creation

#### AT-005: Add query invalidation after creation
- **id**: AT-005
- **title**: Invalidate mentee queries after successful creation
- **phase**: 2
- **priority**: medium
- **dependencies**: [AT-004]
- **parallel_safe**: true
- **files_to_modify**:
  - `client/src/components/auth/AuthSync.tsx`
- **validation**:
  - Verify that dashboard loads data after creation
  - Confirm there is no indefinite loading
- **rollback**: Remove invalidation
- **acceptance_criteria**:
  - [ ] Query `mentorados.me` is invalidated after creation
  - [ ] Query `auth.me` is invalidated after creation
  - [ ] Dashboard reloads automatically

### Phase 3: Data Integrity & Validation

#### AT-006: Create unique index on mentorados.userId
- **id**: AT-006
- **title**: Add unique constraint to prevent duplicates
- **phase**: 3
- **priority**: high
- **dependencies**: [AT-003]
- **parallel_safe**: false
- **files_to_modify**:
  - `drizzle/schema.ts`
- **implementation_notes**: |
  Modify schema in `drizzle/schema.ts`:

  ```typescript
  export const mentorados = pgTable(
    "mentorados",
    {
      id: serial("id").primaryKey(),
      userId: integer("user_id")
        .references(() => users.id, { onDelete: "set null" })
        .unique(), // ADD THIS
      // ... rest of fields
    },
    (table) => [
      index("mentorados_user_id_idx").on(table.userId),
      uniqueIndex("mentorados_user_id_unique_idx").on(table.userId), // EXPLICIT INDEX
      // ... other indexes
    ]
  );
  ```

  **Before applying in production:**
  ```sql
  -- Check for existing duplicates
  SELECT user_id, COUNT(*)
  FROM mentorados
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) > 1;
  ```

  Generate migration:
  ```bash
  bun run db:generate
  bun run db:push
  ```
- **validation**:
  - Verify there are no existing duplicates (query above)
  - Generate migration with `bun run db:generate`
  - Apply in staging and test mentee creation
- **rollback**:
  ```bash
  bun run db:migrate:down
  ```
- **acceptance_criteria**:
  - [ ] UNIQUE constraint on `mentorados.userId`
  - [ ] Migration generated and tested in staging
  - [ ] No duplicates in the database
  - [ ] Load tests pass (simultaneous creation)

#### AT-007: Add structured logs for monitoring
- **id**: AT-007
- **title**: Implement detailed logging for mentee creation
- **phase**: 3
- **priority**: medium
- **dependencies**: []
- **parallel_safe**: true
- **files_to_modify**:
  - `server/_core/context.ts`
  - `server/routers/auth.ts`
- **validation**:
  - Verify logs in development
  - Confirm JSON structure of logs
- **rollback**: Remove additional logs
- **acceptance_criteria**:
  - [ ] Success log with userId and mentoradoId
  - [ ] Failure log with error and context
  - [ ] Cache hit/miss log with mentee present/absent
  - [ ] Metrics for creation time

### Phase 4: Error Handling & UX

#### AT-008: Create error state in dashboard for mentee not found
- **id**: AT-008
- **title**: Add specific error screen when mentee does not exist
- **phase**: 4
- **priority**: medium
- **dependencies**: [AT-004]
- **parallel_safe**: true
- **files_to_modify**:
  - `client/src/pages/MyDashboard.tsx`
- **validation**:
  - Test error scenario
  - Verify retry button
- **rollback**: Revert to previous behavior
- **acceptance_criteria**:
  - [ ] Friendly screen when mentee not found
  - [ ] "Try again" button
  - [ ] Link to support contact
  - [ ] Does not show stack trace or technical error

#### AT-009: Add progress toast during creation
- **id**: AT-009
- **title**: Notify user during profile creation process
- **phase**: 4
- **priority**: low
- **dependencies**: [AT-004]
- **parallel_safe**: true
- **files_to_modify**:
  - `client/src/components/auth/AuthSync.tsx`
- **validation**:
  - Test complete flow
  - Verify toast timing
- **rollback**: Remove toasts
- **acceptance_criteria**:
  - [ ] Toast "Preparing your profile..." during creation
  - [ ] Toast "Profile created!" on success
  - [ ] Toast "Error, trying again..." on retry

---

## Validation Gates

### Automated
- **VT-001**: `bun run build` -> Exit 0
- **VT-002**: `bun run check` -> No errors
- **VT-003**: `bun test` -> All pass
- **VT-004**: Load test with 10 simultaneous users -> No race conditions
- **VT-005**: Integration test: complete login flow -> Mentee created

### Manual Review
- **reviewer**: @code-reviewer
- **focus**: Race conditions and transactions in context.ts
- **required_if**: Changes in AT-001 or AT-006

---

## Output

### Format
- **DELIVERABLE**: Modified code + database migration + tests
- **DOCUMENTATION**: This plan + code comments

### Files Created
- No new files needed (modifications only)

### Files Modified
| path | changes |
|------|---------|
| `server/_core/context.ts` | Race condition fix, logging |
| `server/_core/sessionCache.ts` | Invalidation function |
| `server/routers/auth.ts` | New `ensureMentorado` procedure |
| `client/src/components/auth/AuthSync.tsx` | Retry logic, invalidation |
| `drizzle/schema.ts` | Unique constraint on userId |
| `client/src/pages/MyDashboard.tsx` | Error state |

### Success Definition
1. New user logs in -> mentee created in < 2 seconds
2. Dashboard loads without infinite loading
3. Race conditions do not occur in load tests
4. Failures are logged and handled gracefully
5. User receives visual feedback during the process

### Failure Handling
**If**: Mentee is not created after implementation
**Then**:
1. Check logs in `server/_core/context.ts`
2. Check database constraint (AT-006)
3. Validate cache invalidation (AT-001)
**Rollback**:
1. Revert to simple `syncUser`
2. Remove database constraint if causing error
3. Revert `AuthSync.tsx` to previous version

---

## Implementation Notes

### Critical Path
```
AT-001 (cache fix) -> AT-003 (ensureMentorado) -> AT-004 (AuthSync update) -> AT-006 (DB constraint)
```

### Testing Strategy
1. **Unit tests**: `auth.ensureMentorado` procedure
2. **Integration tests**: Complete login -> dashboard flow
3. **E2E tests**: Simulate new user in browser
4. **Load tests**: 50 simultaneous logins

### Monitoring
- Log entries: `mentorado_created`, `mentorado_creation_failed`, `cache_hit_no_mentorado`
- Metrics: Average creation time, success rate, cache hit ratio
- Alerts: Failure rate > 1%, average time > 5s

---

## Rollback Plan

### Complete Rollback
```bash
# 1. Revert code
git revert HEAD~N..HEAD

# 2. Revert migration
bun run db:migrate:down

# 3. Restart service
bun dev
```

### Partial Rollback (feature flag)
If implemented with feature flag:
```typescript
// server/_core/context.ts
const ENABLE_AUTO_CREATE = process.env.ENABLE_AUTO_CREATE !== 'false';
```

Disable via env var without deploy.

---

*Plan created following R.P.I.V workflow (Research -> Plan -> Implement -> Validate)*
*Research completed on: 2026-02-03*
*Complexity: L6 - Medium-High*
