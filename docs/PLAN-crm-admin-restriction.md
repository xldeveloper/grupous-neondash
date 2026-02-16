# PLAN-crm-admin-restriction: Restrict Admin View in CRM

> **Goal:** Ensure that the "ADMIN VIEW" section in the CRM is visible only to administrators, and that mentees see only their own data.

---

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | Frontend check `isAdmin` is correct: `user?.role === "admin"` | 5/5 | [LeadsPage.tsx:23](file:///home/mauricio/neondash/client/src/pages/crm/LeadsPage.tsx#L23) | Correct frontend check |
| 2 | Admin selector only renders if `isAdmin === true` | 5/5 | [LeadsPage.tsx:128](file:///home/mauricio/neondash/client/src/pages/crm/LeadsPage.tsx#L128) | Correct condition |
| 3 | Backend validates `ctx.user.role !== "admin"` before allowing access to other mentees | 5/5 | [leadsRouter.ts:29-31](file:///home/mauricio/neondash/server/leadsRouter.ts#L29-L31) | Backend security OK |
| 4 | Role is determined by the email being in the `ADMIN_EMAILS` env var | 5/5 | [db.ts:107-117](file:///home/mauricio/neondash/server/db.ts#L107-L117) | Configuration via env |
| 5 | There is no additional verification in `adminProcedure` for sensitive routes | 3/5 | Codebase | Potential improvement |
| 6 | There is no tool to audit users with admin role | 4/5 | Codebase | Hinders diagnosis |

### Knowledge Gaps & Assumptions

- **Gap:** There are no admin access logs for auditing
- **Assumption:** The reported issue is a specific user with an incorrectly assigned "admin" role
- **Assumption:** The `ADMIN_EMAILS` env var is configured correctly

---

## 1. User Review Required

> [!IMPORTANT]
> **Data Verification Required**
>
> The code is implemented correctly. If a mentee is seeing the "ADMIN VIEW", it means:
> 1. Their email is in the `ADMIN_EMAILS` list (check the env var)
> 2. OR their `role` in the database was manually changed to "admin"
>
> **Recommended action:** Run the audit query in AT-001 to identify all admin users.

---

## 2. Proposed Changes

### Component: Audit (New)

#### [NEW] SQL Query for Admin Audit
**Purpose:** Identify all users with the "admin" role in the database.

```sql
SELECT id, email, name, role, "clerkId", "createdAt"
FROM users
WHERE role = 'admin';
```

---

### Component: Backend Security

#### [MODIFY] [adminRouter.ts](file:///home/mauricio/neondash/server/adminRouter.ts)
- **Action:** Add audit endpoint to list admin users
- **Details:** New `listAdminUsers` procedure protected by `adminProcedure`

---

### Component: Environment Verification

#### [VERIFY] Environment Variable
- **Action:** Verify value of `ADMIN_EMAILS` in production
- **Details:** Ensure that only real admin emails are listed

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> This is a **low complexity (L2)** issue. The code is already correct. The tasks below are for verification and audit improvements.

### AT-001: Audit Admin Users in the Database
**Goal:** Identify all users with the "admin" role to check for incorrect assignments
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Run audit query in Neon console
  - **Query:** `SELECT id, email, name, role FROM users WHERE role = 'admin';`
  - **Validation:** List all admins and verify they are expected
- [ ] ST-001.2: Remove admin role from users who should not be admin
  - **Query:** `UPDATE users SET role = 'user' WHERE email = '...' AND role = 'admin';`
  - **Validation:** Verify that only correct admins remain
- [ ] ST-001.3: Verify `ADMIN_EMAILS` env var
  - **File:** `.env` or deployment platform
  - **Validation:** Confirm that the list contains only admin emails

**Rollback:** `UPDATE users SET role = 'admin' WHERE email = '...'` to restore

---

### AT-002: Add Admin Audit Endpoint
**Goal:** Allow admins to list all users with administrative access
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Create `admin.listAdminUsers` procedure
  - **File:** `server/adminRouter.ts`
  - **Validation:** Only admins can access
- [ ] ST-002.2: Return list of users with role="admin"
  - **File:** `server/adminRouter.ts`
  - **Validation:** Query executes correctly
- [ ] ST-002.3: Add UI in admin panel (optional)
  - **File:** `client/src/components/admin/AdminPanelView.tsx`
  - **Validation:** List visible in the panel

**Rollback:** Revert adminRouter.ts commits

---

### AT-003: Improve Admin Access Logs
**Goal:** Log when an admin accesses another mentee's data for auditing
**Dependencies:** None

#### Subtasks:
- [ ] ST-003.1: Add log when admin views another mentee
  - **File:** `server/leadsRouter.ts`
  - **Validation:** Log appears on the server
- [ ] ST-003.2: Include timestamp, adminId, targetMentoradoId in the log
  - **File:** `server/leadsRouter.ts`
  - **Validation:** Complete information in the log

**Rollback:** Remove log calls

---

## 4. Verification Plan

### Automated Tests
- `bun run check` - TypeScript validation
- `bun run lint` - Code formatting
- `bun test` - Unit tests

### Manual Verification
1. [ ] Log in as a mentee (non-admin) and verify that "ADMIN VIEW" does NOT appear
2. [ ] Log in as admin and verify that "ADMIN VIEW" appears
3. [ ] Admin selects another mentee -> selected mentee's data is displayed
4. [ ] Mentee tries to access API with another user's `mentoradoId` -> 403 FORBIDDEN error

---

## 5. Rollback Plan

```bash
# If code changes are needed
git revert HEAD

# If role was changed incorrectly
UPDATE users SET role = 'admin' WHERE email = 'real-admin-email@example.com';
```

---

## 6. Edge Cases Considered

| # | Edge Case | Handling |
|---|-----------|----------|
| 1 | Admin email removed from ADMIN_EMAILS but role was already admin | Role persists until next login |
| 2 | Multiple emails in env var separated incorrectly | Use `,` as separator |
| 3 | User tries to manipulate request to appear as admin | Backend validates ctx.user.role |
| 4 | Authentication cache shows old role | staleTime of 5min in useAuth |
| 5 | Mentee with email equal to admin email | Check for duplicates in the database |

---

## 7. Summary

**The code is correct.** The reported issue is likely a data problem:
1. A user has `role = "admin"` when they should not
2. OR the user's email is in the `ADMIN_EMAILS` list

**Immediate action:** Run AT-001 (audit) to identify the problem.

**Optional improvements:** AT-002 and AT-003 to facilitate future auditing.
