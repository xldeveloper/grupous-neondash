# PLAN-design-workflow-enhancement: Improve /design Workflow

> **Goal:** Enhance `.agent/workflows/design.md` to efficiently leverage `ui-ux-pro-max` skill based on GitHub reference implementation.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | Local `ui-ux-pro-max` skill has full v2.0 features (design-system, persist, page) | 5/5 | Local `search.py` analysis | HIGH |
| 2 | Current `design.md` references `frontend-design` skill, not `ui-ux-pro-max` | 5/5 | `design.md` line 50 | CRITICAL |
| 3 | GitHub v2.0 uses 5-domain parallel search via `--design-system` flag | 5/5 | GitHub README | HIGH |
| 4 | Master+Overrides pattern available via `--persist` and `--page` flags | 5/5 | GitHub/local scripts | MEDIUM |
| 5 | Pre-delivery checklist integrated into design system output | 5/5 | GitHub README | MEDIUM |
| 6 | 100 industry-specific reasoning rules in `ui-reasoning.csv` | 5/5 | Local data files | HIGH |
| 7 | Available stacks include `shadcn` which is relevant to this project | 5/5 | Local `search.py` | MEDIUM |

### Knowledge Gaps & Assumptions

- **Gap:** None identified - local skill matches GitHub implementation
- **Assumption:** Python 3 is available in development environment

---

## 1. User Review Required

> [!IMPORTANT]
> **Path Change:** The workflow currently references `frontend-design` skill. This plan proposes switching to `ui-ux-pro-max` as the primary design skill while keeping `frontend-design` for asset generation (p5.js, canvas, images).

---

## 2. Proposed Changes

### Component: Workflow Enhancement

#### [MODIFY] [design.md](file:///home/mauricio/neondash/.agent/workflows/design.md)

**Key Changes:**

1. **Skill Reference Update:** Change from `frontend-design` to `ui-ux-pro-max`
2. **Script Path Fix:** Update script paths to point to `ui-ux-pro-max/scripts/`
3. **Add Master+Overrides Pattern:** Include persistence workflow for cross-session design consistency
4. **Add Stack-Specific Guidance:** Include `--stack shadcn` for this project's tech stack
5. **Add Context-Aware Retrieval:** Document hierarchical design system retrieval
6. **Simplify Anti-Safe Harbor:** Move detailed anti-patterns to skill, keep summary in workflow
7. **Add Priority Categories:** Reference the CRITICAL/HIGH/MEDIUM priority system from skill

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> Each task MUST have subtasks. No single-line tasks allowed.

### AT-001: Update Skill References and Script Paths
**Goal:** Change all references from `frontend-design` to `ui-ux-pro-max`
**Dependencies:** None ⚡ PARALLEL-SAFE

#### Subtasks:
- [ ] ST-001.1: Replace `.agent/skills/frontend-design/scripts/` with `.agent/skills/ui-ux-pro-max/scripts/`
  - **File:** `.agent/workflows/design.md`
  - **Validation:** `grep -c "ui-ux-pro-max" .agent/workflows/design.md` returns > 0
- [ ] ST-001.2: Update Skill References section to prioritize `ui-ux-pro-max/SKILL.md`
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Line 180+ references correct skill path

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-002: Add Design System Persistence Workflow
**Goal:** Document the Master+Overrides pattern for cross-session consistency
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Add new "Phase 2b: Persist Design System" section after "Phase 2: Design Commitment"
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Section exists with `--persist` and `--page` examples
- [ ] ST-002.2: Add hierarchical retrieval prompt example
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains context-aware retrieval prompt template
- [ ] ST-002.3: Add verification step for design-system folder creation
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Checklist item exists

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-003: Add Stack-Specific Guidance for shadcn
**Goal:** Include project-specific stack guidelines
**Dependencies:** AT-001 ⚡ PARALLEL-SAFE with AT-002

#### Subtasks:
- [ ] ST-003.1: Add shadcn stack search example to Phase 3
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains `--stack shadcn` example
- [ ] ST-003.2: Update Prerequisites to reference Bun runtime
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Mentions project uses Bun + shadcn/ui

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-004: Add Priority Categories and Quick Reference
**Goal:** Include the CRITICAL/HIGH/MEDIUM priority system from ui-ux-pro-max
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-004.1: Add "Priority Categories" summary section
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains priority table (Accessibility=CRITICAL, etc.)
- [ ] ST-004.2: Add Quick Reference for common UX rules
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains touch-target-size, color-contrast, etc.

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-005: Simplify Anti-Safe Harbor and Update Checklist
**Goal:** Streamline anti-patterns, add design-system-specific validation
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-005.1: Keep only top 4 anti-patterns in workflow (reference skill for full list)
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Anti-Safe Harbor section is concise
- [ ] ST-005.2: Add design-system persistence verification to Pre-Delivery Checklist
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Checklist includes "design-system/MASTER.md exists" item
- [ ] ST-005.3: Add stack-specific checklist items for shadcn
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Checklist includes shadcn component usage item

**Rollback:** `git checkout .agent/workflows/design.md`

---

## 4. Verification Plan

### Automated Tests

```bash
# Validate Python script works
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "test query" --design-system -p "Test"

# Verify skill paths in workflow
grep -c "ui-ux-pro-max/scripts" .agent/workflows/design.md
# Expected: 3+

# Verify persistence examples exist
grep -c "\-\-persist" .agent/workflows/design.md
# Expected: 2+

# Verify stack examples
grep -c "\-\-stack" .agent/workflows/design.md
# Expected: 2+
```

### Manual Verification

1. **Run the design system generator:**
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "saas dashboard dark mode" --design-system -p "Neondash"
   ```
   - Verify: Output shows complete design system with pattern, style, colors, typography

2. **Test persistence:**
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "saas dashboard" --design-system --persist -p "Neondash"
   ```
   - Verify: `design-system/neondash/MASTER.md` is created

3. **Test page override:**
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "metrics analytics" --design-system --persist -p "Neondash" --page "dashboard"
   ```
   - Verify: `design-system/neondash/pages/dashboard.md` is created

4. **Review updated workflow:**
   - Read `.agent/workflows/design.md`
   - Verify all sections reference correct skill paths
   - Verify persistence workflow is documented

---

## 5. Rollback Plan

```bash
# Revert workflow changes
git checkout .agent/workflows/design.md

# Clean up test design-system files (if created)
rm -rf design-system/
```

---

## Pre-Submission Checklist

### File Creation
- [x] Created docs/PLAN-design-workflow-enhancement.md file
- [x] File follows template structure
- [x] File is readable and complete

### Research
- [x] Codebase patterns searched and documented
- [x] GitHub reference implementation analyzed
- [x] Local skill feature parity confirmed
- [x] Script paths verified

### Context
- [x] Findings Table with 7 entries and confidence scores
- [x] Knowledge Gaps: None significant
- [x] Assumptions: Python 3 available
- [x] Edge cases: Skill path differences noted

### Tasks
- [x] All tasks have AT-XXX IDs (5 tasks)
- [x] All tasks have subtasks (ST-XXX.N)
- [x] Each subtask has validation
- [x] Dependencies mapped
- [x] Rollback steps defined
- [x] Parallel-safe marked with ⚡

### Quality
- [x] Mode: CONSERVATIVE (plan only)
- [x] Output format explicit
- [x] Success criteria measurable
- [x] Failure handling: git checkout
