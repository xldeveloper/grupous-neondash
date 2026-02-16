---
description: Multi-source research with cross-validation and atomic task generation (>=95% accuracy)
---

# /research: $ARGUMENTS

This command runs in **Plan Mode** (research + planning). It does **not** implement without explicit approval.

Always use the Skill planning (.agent\skills\planning\SKILL.md)

## Native Antigravity Orchestration Flow

```mermaid
flowchart TD
    A[Start /research] --> B[Phase 1: Discovery (Parallel)]
    B --> C1[Explore: EXP-STRUCT]
    B --> C2[Explore: EXP-TRACE]
    B --> C3[Librarian: LIB-DOCS]
    B --> C4[Librarian: LIB-EXAMPLES]
    B --> C5[Plan Draft: PLAN-1]
    C1 & C2 & C3 & C4 & C5 --> D[Barrier: Synthesis]
    D --> E[Phase 2: Targeted Follow-up]
    E --> F[Oracle: Architecture Review (L4+)]
    F --> G[Generate implementation_plan.md]
    G --> H[Generate task.md]
    H --> I[notify_user: Approval Request]
```

## Task

Follow this systematic approach to create a new feature: $ARGUMENTS

1. **Feature Planning**
   - Use `task_boundary` to indicate the start of the planning phase.
   - Define feature requirements and acceptance criteria.
   - Break down feature into `task.md` using the `[ ]`, `[/]`, `[x]` convention.
   - Identify affected components and potential impact areas.
   - Requirements Matrix
     | Category | Requirement | Priority | Validation Method |
     |-----------|-----------|------------|---------------------|
     | Functional | [REQ_1] | Must | [HOW_TO_TEST] |
     | Non-Functional | [PERF_REQ] | Must | [BENCHMARK] |
   - Current State Assessment

```yaml
existing_architecture: "[DESCRIBE_CURRENT_STATE]"
integration_points: ["[SYSTEM_1]", "[SYSTEM_2]"]
technical_debt: "[RELEVANT_DEBT]"
```

2. **Research and Analysis (Background Tasks)**
   - **Explore Agent**: Contextual grep for codebase patterns and implementations.
   - **Librarian Agent**: Reference grep for official documentation via `context7`.
   - **Sequential Thinking**: Structured problem-solving for architectural decisions.
   - Technology Assessment
     | Option | Pros | Cons | Fit Score |
     |-------|------|---------|-----------|
     | [OPTION_1] | [ADVANTAGES] | [DISADVANTAGES] | [1-5] |
   - Patterns to Consider

```yaml
recommended_patterns:
  - pattern: "[PATTERN_NAME]"
    rationale: "[WHY_IT_FITS]"
    tradeoffs: "[WHAT_WE_GIVE_UP]"
```

3. **Architecture Design**
   - Design feature architecture and data flow.
   - Plan database schema changes if needed (Convex).
   - Define API endpoints and contracts.
   - Solution Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Component   │────▶│ Component   │────▶│ Component   │
│      A      │     │      B      │     │      C      │
└─────────────┘     └─────────────┘     └─────────────┘
```

- Decision Records (ADRs)

```yaml
decision_1:
  context: "[SITUATION_REQUIRING_DECISION]"
  options_considered: ["[OPT_1]", "[OPT_2]"]
  decision: "[CHOSEN_APPROACH]"
  rationale: "[WHY_THIS_CHOICE]"
  consequences: "[IMPLICATIONS]"
```

4. **Implementation Strategy**
   - Generate `implementation_plan.md` in `<appDataDir>/brain/<conversation-id>/`.
   - Follow the official schema: Goal Description, User Review Required, Proposed Changes, Verification Plan.
   - Plan validation with atomic tasks and subtasks (Phase 5).
   - Implementation Roadmap

```yaml
phase_1_foundation:
  duration: "[ESTIMATE]"
  deliverables:
    - "[DELIVERABLE_1]"
    - "[DELIVERABLE_2]"

phase_2_core:
  duration: "[ESTIMATE]"
  deliverables:
    - "[DELIVERABLE_3]"
  dependencies: ["phase_1_foundation"]
```

    - File Structure

```
src/
├── [module_1]/
│   ├── [component].ts       # [PURPOSE]
│   ├── [service].ts         # [PURPOSE]
│   └── [types].ts           # [PURPOSE]
└── shared/
    └── ...
```

## ANTIGRAVITY-NATIVE PROMPT TEMPLATE

```yaml
role: "[SPECIFIC EXPERTISE] Developer"
objective:
  task: "[DESCRIBE WHAT NEEDS TO BE DONE]"
  context: "[PROJECT TYPE, STACK, CONSTRAINTS]"
chain_of_thought_process:
  analyze:
    checklist:
      - "Core requirement: _________"
      - "Technical constraints: _________"
      - "Expected output: _________"
      - "Edge cases to consider: _________"
  research:
    checklist:
      - "Framework/library documentation needed: _________"
      - "Patterns to apply: _________"
      - "Security and compliance (LGPD): _________"
  think:
    step_by_step:
      - "First: _________  # initial setup/analysis"
      - "Then: _________   # core design/specification"
      - "Next: _________   # validation strategy"
      - "Finally: _________ # cleanup/polish"
```

## Background Task Orchestration

```yaml
orchestration:
  limits:
    max_concurrent: 5
    timeout: 180000

  phases:
    - id: "P1"
      name: "Discovery"
      parallel: true
      tasks:
        - id: "EXP-STRUCT"
          agent: "explore"
          prompt: "Map file structure + entrypoints + patterns (routes, hooks, Convex)"
        - id: "EXP-TRACE"
          agent: "explore"
          prompt: "Trace references (api.*, route usage, component composition)"
        - id: "LIB-DOCS"
          agent: "librarian"
          prompt: "Official docs via Context7 (Convex, Clerk, TanStack, shadcn)"
        - id: "LIB-EXAMPLES"
          agent: "librarian"
          prompt: "GitHub/OSS examples for complex patterns"
        - id: "PLAN-1"
          agent: "apex-researcher"
          prompt: "Initial implementation_plan.md draft"
      barrier:
        {
          require_done:
            ["EXP-STRUCT", "EXP-TRACE", "LIB-DOCS", "LIB-EXAMPLES", "PLAN-1"],
        }

    - id: "P2"
      name: "Targeted Refinement"
      parallel: true
      tasks:
        - id: "REV-1"
          agent: "architect-reviewer"
          prompt: "Validate P1 findings against architecture rules"
          gate: "informational"
        - id: "PLAN-REFINE"
          agent: "apex-researcher"
          prompt: "Finalize implementation_plan.md and task.md based on Wave 1 evidence"
          dependencies: ["P1"]

  collection:
    - action: "Write implementation_plan.md to <appDataDir>/brain/<conversation-id>/"
    - action: "Write task.md to <appDataDir>/brain/<conversation-id>/"

  approval_gate:
    - action: "notify_user(BlockedOnUser=true) with Implementation Plan and Task List"

  cleanup:
    - action: "background_cancel(all=true)"
```

## Instructions for @apex-researcher

1. **Detect complexity (L1-L10)** with justification.
2. **Prioritize repo-first** using `find_by_name` and `grep_search`.
3. **Use context7** for official framework documentation (Convex, Clerk, etc.).
4. **Coordination**: Use `task_boundary` to reflect research status to the user.
5. **Output**: Generate the `implementation_plan.md` strictly following the official format.
6. **Task List**: Create the `task.md` with atomic tasks (Phase 1-5).
7. **NOTIFY**: Call `notify_user` to block execution until the plan is approved.

## References

- Principles: `code-principles.md`
- Implementation: `implement.md`
