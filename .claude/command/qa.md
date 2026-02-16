---
description: Integrated QA pipeline with auto-research and auto-fix
---

# /qa - Quality Assurance Pipeline

Integrated pipeline: **Verification → Auto-Research → Auto-Fix**

## Integrated Flow

```mermaid
flowchart TD
    A[/qa] --> B[Phase 1: Local Checks]
    B --> C{Errors?}
    C -->|No| D[Phase 2: Deploy]
    D --> E{Errors?}
    E -->|No| F[✅ QA PASS]

    C -->|Yes| G[Aggregation Protocol]
    E -->|Yes| G

    G --> H["/research (Docs & Best Practices)"]
    H --> I[Atomic Implementation Plan]
    I --> J[Approval Gate]
    J --> K[/implement]
    K --> L[Re-run /qa]

    subgraph "Research & Planning"
    H
    I
    end

    subgraph "Implementation"
    K
    end
```

## Behavior

### Generate Tests

When asked to test a file or feature:

1. **Analyze the code**
   - Identify functions and methods
   - Find edge cases
   - Detect dependencies to mock

2. **Generate test cases**
   - Happy path tests
   - Error cases
   - Edge cases
   - Integration tests (if needed)

3. **Write tests**
   - Use project's test framework (Jest, Vitest, etc.)
   - Follow existing test patterns
   - Mock external dependencies

---

## Output Format

### For Test Generation

```markdown
## 🧪 Tests: [Target]

### Test Plan

| Test Case                   | Type | Coverage   |
| --------------------------- | ---- | ---------- |
| Should create user          | Unit | Happy path |
| Should reject invalid email | Unit | Validation |
| Should handle db error      | Unit | Error case |

### Generated Tests

`tests/[file].test.ts`

[Code block with tests]

---

Run with: `npm test`
```

### For Test Execution

```
🧪 Running tests...

✅ auth.test.ts (5 passed)
✅ user.test.ts (8 passed)
❌ order.test.ts (2 passed, 1 failed)

Failed:
  ✗ should calculate total with discount
    Expected: 90
    Received: 100

Total: 15 tests (14 passed, 1 failed)
```

---

## Examples

```
/test src/services/auth.service.ts
/test user registration flow
/test coverage
/test fix failed tests
```

---

## Test Patterns

### Unit Test Structure

```typescript
describe("AuthService", () => {
  describe("login", () => {
    it("should return token for valid credentials", async () => {
      // Arrange
      const credentials = { email: "test@test.com", password: "pass123" };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.token).toBeDefined();
    });

    it("should throw for invalid password", async () => {
      // Arrange
      const credentials = { email: "test@test.com", password: "wrong" };

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });
});
```

---

## Key Principles

- **Test behavior not implementation**
- **One assertion per test** (when practical)
- **Descriptive test names**
- **Arrange-Act-Assert pattern**
- **Mock external dependencies**

# Code Quality Review

Perform comprehensive code quality review: $ARGUMENTS

## Task

You are an expert debugger specializing in root cause analysis.

When invoked:

1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:

- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:

- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not just symptoms.

Follow these steps to conduct a thorough code review:

1. **Code Quality Assessment**
   - Scan for code smells, anti-patterns, and potential bugs
   - Check for consistent coding style and naming conventions
   - Identify unused imports, variables, or dead code
   - Review error handling and logging practices

2. **Security Review**
   - Look for common security vulnerabilities (SQL injection, XSS, etc.)
   - Check for hardcoded secrets, API keys, or passwords
   - Review authentication and authorization logic
   - Examine input validation and sanitization

3. **Performance Analysis**
   - Identify potential performance bottlenecks
   - Check for inefficient algorithms or database queries
   - Review memory usage patterns and potential leaks
   - Analyze bundle size and optimization opportunities

4. **Architecture & Design**
   - Evaluate code organization and separation of concerns
   - Check for proper abstraction and modularity
   - Review dependency management and coupling
   - Assess scalability and maintainability

5. **Testing Coverage**
   - Check existing test coverage and quality
   - Identify areas lacking proper testing
   - Review test structure and organization
   - Suggest additional test scenarios

6. **Documentation Review**
   - Evaluate code comments and inline documentation
   - Check API documentation completeness
   - Review README and setup instructions
   - Identify areas needing better documentation

7. **Recommendations**
   - Prioritize issues by severity (critical, high, medium, low)
   - Provide specific, actionable recommendations
   - Suggest tools and practices for improvement
   - Create a summary report with next steps

Remember to be constructive and provide specific examples with file paths and line numbers where applicable.

## Phase 1: Local Quality Checks

> **CRITICAL GATE**: Do not proceed if any check fails

```bash
# Code quality & linting
bun run lint:check

# Type safety & build verification
bun run build

# Test coverage
bun run test:coverage
```

## Phase 2: Deployment Validation

> **PREREQUISITE**: Phase 1 must pass completely

### 2.1 Deploy Status Check

```bash
# Railway deployment status
railway status

# Convex backend deployment
bunx convex deploy --prod
```

### 2.2 Deploy Logs Verification

> **CRITICAL**: Inspect logs to identify runtime/deploy errors

```bash
# Railway: Check recent deploy logs (last 100 lines)
railway logs --latest -n 100

# Convex: Check production logs
bunx convex logs --prod --success --failure
```

### 2.3 Deploy Error Analysis

If errors are found in the logs:

1. **Railway Errors** - Identify:
   - Build failures (dependencies, TypeScript, bundling)
   - Runtime errors (crashes, memory, timeouts)
   - Environment variable issues
   - Network/connection problems

2. **Convex Errors** - Identify:
   - Function execution errors
   - Schema validation failures
   - Authentication/authorization issues
   - Query/mutation timeouts

3. **Action**: Aggregate all errors and proceed to Phase 3

## Phase 3: Error Aggregation & Auto-Research

If errors are detected in any phase:

1. **Aggregation Protocol**: Collect complete context:
   - Full stack trace.
   - Versions of involved libraries.
   - Source code of affected files.
   - Error logs from terminal and dashboard (Railway/Convex).
2. **Automatically invoke** the research workflow:
   > `/research "QA Fix: [summary]. Context: [logs/traces]. GOAL: Research docs/best practices and plan atomic fixes."`
3. **Generate Atomic Tasks**: The plan MUST break each fix into:
   - `[ ] Research API/pattern (if unknown)`
   - `[ ] Apply fix to [file]`
   - `[ ] Verify fix (unit/build/lint)`

4. **Await Approval**: The user must approve the generated `implementation_plan.md` and `task.md`.

### Research Strategy (Docs & Best Practices)

The `/research` workflow will ensure:

- **Official Docs Consultation**: Mandatory use of `context7` and `librarian` to find the source of truth (Convex, Clerk, TanStack, etc.).
- **Atomic Tasks**: Decomposition of the fix into verifiable atomic subtasks in `task.md` (e.g., "Research Error X", "Fix Component Y", "Verify Z").
- **Best Practices**: Ensuring the fix follows recommended patterns, not just "workarounds".

### Skill Integration Strategy

MUST incorporate the following skills in the fix plan:

**A. For Backend / Database Errors (Convex):**

> **USE SKILL**: `ai-data-analyst`
>
> - **Objective**: Analyze data consistency, schemas, and query logs.
> - **Action**: Create Python scripts to validate database state vs. expectations.
> - **Example Command**: "Use ai-data-analyst to verify that all users have a valid 'stripeId' in the 'users' table in Convex."

**B. For Frontend / UI Errors (React/TanStack):**

> **USE SKILL**: `webapp-testing`
>
> - **Objective**: Reproduce visual bugs, test interaction flows, and validate fixes.
> - **Action**: Create Playwright scripts (using `scripts/with_server.py`) for controlled reproduction.
> - **Example Command**: "Use webapp-testing to create a test that simulates clicking the 'Checkout' button and captures the console error."

## Phase 4: Auto-Implementation

After the fix plan and tasks are approved:

1. **Invoke `/implement`** to execute the plan:
   - Consumes `implementation_plan.md` and `task.md`.
   - Executes atomic tasks and subtasks generated by `/research`.

2. **Re-run `/qa`** for final validation (Feedback Loop):
   - If it passes: Success.
   - If it fails: Return to Phase 3 with new errors.

## Success Metrics

| Gate         | Command                             | Expected Result   |
| ------------ | ----------------------------------- | ----------------- |
| Lint         | `bun run lint:check`                | 0 errors          |
| Build        | `bun run build`                     | Clean build       |
| Tests        | `bun run test:coverage`             | All tests pass    |
| Deploy       | `railway status`                    | Healthy           |
| Backend      | `bunx convex deploy --prod`         | Success           |
| Railway Logs | `railway logs --latest -n 100`      | No errors in logs |
| Convex Logs  | `bunx convex logs --prod --failure` | No failures       |

## Quick Reference

| Task                     | Command            |
| ------------------------ | ------------------ |
| Run QA pipeline          | `/qa`              |
| Fix errors automatically | `/qa --auto-fix`   |
| Debug specific phase     | `/qa --phase=lint` |

## Technical Notes

- **Auto-research**: Automatically triggered when errors are detected
- **Auto-implementation**: Executed after the plan is approved
- **Automatic re-run**: `/qa` re-runs after `/implement` completes
- **Preserve tasks**: New fix tasks are added to the existing TodoWrite

---

**Full pipeline: `/qa` → detects errors → `/research` → `/implement` → `/qa` (re-run)**
