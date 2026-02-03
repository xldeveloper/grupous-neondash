# PLAN-stitch-integration: Integrate Stitch Design Tool

> **Goal:** Integrate Google Gemini Stitch (AI frontend creator) into the `/design` workflow and `frontend-design` skill to accelerate UI prototyping using Gemini 3.0 models.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | Stitch is an AI UI design tool accessible via MCP | 5/5 | Search/Tools | Enables direct UI generation from user prompt |
| 2 | Supports models `GEMINI_3_PRO` and `GEMINI_3_FLASH` | 5/5 | Tool Defs | High-quality model availability |
| 3 | Core actions: `create_project`, `generate_screen`, `get_screen` | 5/5 | Tool Defs | Defines the workflow steps (Create -> Generate -> Retrieve) |
| 4 | Output is "components" or "suggestions" | 4/5 | Tool Defs | Logic handling needed for suggestions vs code |
| 5 | Best used for prototyping/initial layout | 4/5 | Industry | Complements manual design system work |

### Knowledge Gaps & Assumptions
- **Assumption:** The environment is already authenticated for Stitch MCP.
- **Assumption:** The `output_components` from Stitch will need manual refinement to match our exact stack (Tailwind v4/shadcn) perfectly, though it generates frontend code.
- **Gap:** Exact format of `output_components` (HTML? React? JSON?) - will find out during usage/validation.

---

## 2. Proposed Changes

### Phase 1: Update Frontend Design Skill

#### [MODIFY] [.agent/skills/frontend-design/SKILL.md](file:///home/mauricio/neondash/.agent/skills/frontend-design/SKILL.md)
- **Action:** Add "Stitch AI Prototyping" section.
- **Details:**
    -   Document tool usage (`stitch_generate_screen_from_text`).
    -   Add Prompt Engineering guide for Stitch (Context, Constraints, Aesthetic).
    -   Define integration with `ui-ux-pro-max` (use Design System colors in prompt).

### Phase 2: Update Design Workflow

#### [MODIFY] [.agent/workflows/design.md](file:///home/mauricio/neondash/.agent/workflows/design.md)
- **Action:** Insert "Phase 1.5: AI Prototyping (Stitch)" between Design System and Asset Generation.
- **Details:**
    -   Add step to create project/generate screen.
    -   Add step to review and refine output.

---

## 3. Atomic Implementation Tasks

### AT-001: Update Frontend Design Skill
**Goal:** Document Stitch capabilities and best practices in the skill definition.
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Add "Stitch AI Prototyping" section to `SKILL.md`
  - **File:** `.agent/skills/frontend-design/SKILL.md`
  - **Validation:** `view_file` to confirm markdown structure.

### AT-002: Update Design Workflow
**Goal:** Integrate Stitch tools into the `/design` command flow.
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Add Phase 1.5 to `design.md`
  - **File:** `.agent/workflows/design.md`
  - **Validation:** `view_file` to confirm workflow logic.
- [ ] ST-002.2: Add Output Requirement for `docs/DESIGN-{slug}.md`
  - **File:** `.agent/workflows/design.md`
  - **Details:** 
      - Ensure `DESIGN-{slug}.md` captures the **full Stitch output code** (not just summary).
      - Include "Nano Banana Pro" (`gemini-3-pro`) image generation steps for high-fidelity assets.
      - Mandate checking `output_components` from Stitch and saving them to the design file.

---

## 4. Verification Plan

### Manual Verification
1.  **Read Files**: specific checks on the generated markdown to ensure correct MCP tool names and best practices are recorded.
2.  **Mock Run**: Since I cannot "run" the workflow in this chat without a real design task, I will verify the *documentation* of the workflow is substantial and correct.

---

## 5. Rollback Plan

- Revert changes to `.agent/skills/frontend-design/SKILL.md` and `.agent/workflows/design.md` to previous versions using `git checkout` or `write_to_file`.
