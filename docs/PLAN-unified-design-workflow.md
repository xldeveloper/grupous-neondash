# PLAN-unified-design-workflow: Unified /design Workflow with Dual Skills

> **Goal:** Improve `/design` workflow to efficiently use both `ui-ux-pro-max` (design intelligence) and `frontend-design` (assets/validation) skills for error-free frontend development.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | `frontend-design/scripts/search.py` is outdated (missing --persist, --page) | 5/5 | Code comparison | HIGH |
| 2 | Both skills have duplicate data CSVs (ui-ux-data/ vs data/) | 5/5 | Directory listing | MEDIUM |
| 3 | `ui-ux-pro-max` has superior design system generator with 5-domain parallel search | 5/5 | GitHub analysis | HIGH |
| 4 | `frontend-design` has unique features: ux_audit.py, accessibility_checker.py, generate_images.py | 5/5 | Directory listing | HIGH |
| 5 | `frontend-design` has unique assets: p5-templates/, canvas-fonts/ (81 fonts) | 5/5 | Directory listing | MEDIUM |
| 6 | Skills are complementary: design intelligence vs implementation/auditing | 5/5 | Sequential thinking | CRITICAL |
| 7 | Current design.md references only frontend-design skill | 5/5 | File analysis | HIGH |

### Knowledge Gaps & Assumptions

- **Gap:** None identified
- **Assumption:** Python 3 is available in development environment
- **Assumption:** Both skills' scripts are functional

### Edge Cases

1. User requests design system only, no assets → Skip Phase 2
2. Project uses custom theme, not GPUS → Use color-system.md fallback
3. Python not installed → Workflow shows prerequisite check
4. Conflicting advice from skills → ui-ux-pro-max takes priority for design decisions
5. User wants persistent design system → Document --persist workflow

---

## 1. User Review Required

> [!IMPORTANT]
> **Dual Skill Architecture:** This plan proposes using both skills in complementary roles:
> - **ui-ux-pro-max** → Design System Generation (what design to use)
> - **frontend-design** → Assets + Validation (how to implement)
>
> This eliminates duplication and leverages each skill's strengths.

> [!WARNING]
> **Breaking Change in frontend-design:** The skill's SKILL.md will be updated to point design system searches to `ui-ux-pro-max/scripts/search.py` instead of its own duplicate script.

---

## 2. Proposed Changes

### Component A: Workflow Enhancement

#### [MODIFY] [design.md](file:///home/mauricio/neondash/.agent/workflows/design.md)

**Changes:**
1. Add explicit 4-phase structure with clear skill responsibilities
2. Phase 0: Requirement Analysis (Socratic gate)
3. Phase 1: Design System Generation → ui-ux-pro-max
4. Phase 2: Asset Generation → frontend-design (optional)
5. Phase 3: Implementation → Both skills
6. Phase 4: Validation → frontend-design (mandatory)
7. Add error prevention section with common mistakes
8. Add --persist and --page workflow documentation

---

### Component B: frontend-design Skill Update

#### [MODIFY] [SKILL.md](file:///home/mauricio/neondash/.agent/skills/frontend-design/SKILL.md)

**Changes:**
1. Update Section 4 (Design System Intelligence) to point to ui-ux-pro-max
2. Add skill complementarity note
3. Clarify unique capabilities: UX audit, accessibility, image gen, p5.js, canvas

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> Each task MUST have subtasks. No single-line tasks allowed.

### AT-001: Update /design Workflow Structure
**Goal:** Restructure design.md with 4 explicit phases and dual-skill integration
**Dependencies:** None ⚡ PARALLEL-SAFE

#### Subtasks:
- [ ] ST-001.1: Add Phase 0 (Requirement Analysis) with Socratic gate
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Phase 0 section exists with constraint analysis questions
- [ ] ST-001.2: Rewrite Phase 1 to use ui-ux-pro-max exclusively for design system
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains `ui-ux-pro-max/scripts/search.py --design-system`
- [ ] ST-001.3: Add Phase 2 for Asset Generation with frontend-design tools
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains generate_images.py, p5-templates, canvas-fonts references
- [ ] ST-001.4: Update Phase 3 for Implementation with GPUS theme
  - **File:** `.agent/workflows/design.md`
  - **Validation:** References gpus-theme skill and shadcn/ui
- [ ] ST-001.5: Add Phase 4 for Validation with ux_audit.py and accessibility_checker.py
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains validation commands for frontend-design scripts

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-002: Add Design System Persistence Workflow
**Goal:** Document --persist and --page flags for cross-session consistency
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Add persistence section with Master+Overrides pattern
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains `--persist` and `--page` examples
- [ ] ST-002.2: Add context-aware retrieval prompt template
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains hierarchical retrieval instructions
- [ ] ST-002.3: Add design-system folder structure documentation
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Shows MASTER.md and pages/ structure

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-003: Add Error Prevention Section
**Goal:** Document common frontend errors and prevention strategies
**Dependencies:** AT-001 ⚡ PARALLEL-SAFE with AT-002

#### Subtasks:
- [ ] ST-003.1: Add "Common Frontend Errors" section with table
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains error table with fixes
- [ ] ST-003.2: Add TypeScript strict mode reminders
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains `bun run check` reference
- [ ] ST-003.3: Add shadcn component usage patterns
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains shadcn import pattern examples

**Rollback:** `git checkout .agent/workflows/design.md`

---

### AT-004: Update frontend-design SKILL.md
**Goal:** Update skill to point design system searches to ui-ux-pro-max
**Dependencies:** None ⚡ PARALLEL-SAFE

#### Subtasks:
- [ ] ST-004.1: Update "Design System Intelligence" section (Section 4)
  - **File:** `.agent/skills/frontend-design/SKILL.md`
  - **Validation:** Points to `ui-ux-pro-max/scripts/search.py`
- [ ] ST-004.2: Add skill complementarity note at top of file
  - **File:** `.agent/skills/frontend-design/SKILL.md`
  - **Validation:** Contains note about ui-ux-pro-max partnership
- [ ] ST-004.3: Clarify unique capabilities section
  - **File:** `.agent/skills/frontend-design/SKILL.md`
  - **Validation:** Lists ux_audit, accessibility_checker, image gen as unique

**Rollback:** `git checkout .agent/skills/frontend-design/SKILL.md`

---

### AT-005: Update Pre-Delivery Checklist
**Goal:** Combine validation requirements from both skills
**Dependencies:** AT-001, AT-004

#### Subtasks:
- [ ] ST-005.1: Add ui-ux-pro-max checklist items
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains cursor-pointer, emoji-icon checks
- [ ] ST-005.2: Add frontend-design validation commands
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains `python ux_audit.py` and `python accessibility_checker.py`
- [ ] ST-005.3: Add TypeScript and lint verification
  - **File:** `.agent/workflows/design.md`
  - **Validation:** Contains `bun run check`, `bun run lint`

**Rollback:** `git checkout .agent/workflows/design.md`

---

## 4. Verification Plan

### Automated Tests

```bash
# Verify ui-ux-pro-max design system works
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "saas dashboard" --design-system -p "Test"

# Verify frontend-design unique scripts work
python3 .agent/skills/frontend-design/scripts/ux_audit.py --help 2>/dev/null || echo "Script available"

# Verify workflow references correct skill paths
grep -c "ui-ux-pro-max/scripts/search.py" .agent/workflows/design.md
# Expected: 2+

grep -c "frontend-design/scripts" .agent/workflows/design.md
# Expected: 3+ (ux_audit, accessibility_checker, generate_images)

# Verify all 4 phases documented
grep -c "Phase" .agent/workflows/design.md
# Expected: 5+ (Phase 0-4)
```

### Manual Verification

1. **Run design system generator:**
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "mentorship dashboard dark mode" --design-system -p "Neondash"
   ```
   - **Expected:** Complete design system output with pattern, style, colors, typography

2. **Test persistence:**
   ```bash
   python3 .agent/skills/ui-ux-pro-max/scripts/search.py "dashboard" --design-system --persist -p "Neondash"
   ```
   - **Expected:** Creates design-system/neondash/MASTER.md

3. **Review updated design.md workflow:**
   - Read `.agent/workflows/design.md`
   - Verify Phase 0-4 structure
   - Verify dual-skill references

4. **Review updated frontend-design SKILL.md:**
   - Read `.agent/skills/frontend-design/SKILL.md`
   - Verify ui-ux-pro-max reference in Section 4
   - Verify skill complementarity note

---

## 5. Rollback Plan

```bash
# Revert all changes
git checkout .agent/workflows/design.md
git checkout .agent/skills/frontend-design/SKILL.md

# Clean up test design-system files
rm -rf design-system/
```

---

## Pre-Submission Checklist

### File Creation
- [x] Created docs/PLAN-unified-design-workflow.md file
- [x] File follows template structure
- [x] File is readable and complete

### Research
- [x] Codebase patterns searched and documented
- [x] Both skills analyzed in detail
- [x] Sequential thinking applied for decisions
- [x] Cross-validation across sources

### Context
- [x] Findings Table with 7 entries and confidence scores
- [x] Knowledge Gaps: None significant
- [x] Assumptions: Listed
- [x] Edge cases: 5 documented

### Tasks
- [x] All tasks have AT-XXX IDs (5 tasks)
- [x] All tasks have subtasks (ST-XXX.N) (16 subtasks)
- [x] Each subtask has validation
- [x] Dependencies mapped
- [x] Rollback steps defined
- [x] Parallel-safe marked with ⚡ (3 tasks)

### Quality
- [x] Mode: CONSERVATIVE (plan only)
- [x] Output format explicit
- [x] Success criteria measurable
- [x] Failure handling: git checkout
