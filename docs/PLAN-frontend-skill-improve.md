# PLAN-frontend-skill-improve: Refactor Frontend Design Skill

> **Goal:** Upgrade `.agent/skills/frontend-design/SKILL.md` by integrating Vercel's React Best Practices and Web Design Guidelines, while significantly simplifying the file structure and removing bureaucratic rules.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | Vercel's `react-best-practices` prioritizes eliminating waterfalls and bundle optimization. | 5/5 | Vercel Repo | Core performance principles to adopt. |
| 2 | Vercel's `web-design-guidelines` emphasize accessibility (focus states, semantic HTML) and animation performance. | 5/5 | Vercel Repo | Critical UX/A11y rules to adopt. |
| 3 | Current `frontend-design` skill is "heavy" with meta-rules ("Read this first", "Ask before assuming"). | 5/5 | Local File | User requested removal of this clutter. |
| 4 | Stitch & Nano Banana Pro integration is already present but needs to fit the new cleaner format. | 5/5 | Local File | Must preserve this functionality. |

### Knowledge Gaps & Assumptions
- **Assumption:** The user prefers a "Reference Sheet" style over a "Rulebook" style.
- **Assumption:** We don't need to copy *every* rule from Vercel, but the high-impact ones (Critical/High).

---

## 2. Proposed Changes

### Phase 1: Skill Refactoring

#### [MODIFY] [.agent/skills/frontend-design/SKILL.md](file:///home/mauricio/neondash/.agent/skills/frontend-design/SKILL.md)
- **Action:** Complete rewrite.
- **Structure:**
    1.  **Philosophy**: One separate line.
    2.  **Tech Stack**: Tailwind v4, React 19, Shadcn.
    3.  **Core React Patterns** (From Vercel):
        - `async-defer-await`: Move await to usage.
        - `async-parallel`: Promise.all for independent.
        - `server-components`: Default to server, client only for interactivity.
        - `client-boundary`: Keep client components at leaves.
    4.  **Web Design Standards** (From Vercel):
        - A11y: Contrast 4.5:1, Focus rings visible, Semantic HTML.
        - Animation: `transform`/`opacity` only, `prefers-reduced-motion`.
        - Forms: `autocomplete`, `inputmode`, inline errors.
    5.  **Tools**: Stitch & Nano Banana Pro (Consolidated usage).
    6.  **Assets**: Simple table of available assets.
- **Removed:** "Selective Reading Rule", "Ask Before Assuming", "Anti-Patterns" (unless specific), "Dual Skill Architecture" warning (implied).

---

## 3. Atomic Implementation Tasks

### AT-001: Rewrite Frontend Design Skill
**Goal:** Replace the current verbose skill file with a clean, high-density reference file.
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Overwrite `SKILL.md` with new content
  - **File:** `.agent/skills/frontend-design/SKILL.md`
  - **Validation:** `view_file` to verify clean structure and content inclusion.

---

## 4. Verification Plan

### Manual Verification
1.  **Content Check**: Verify React Patterns (Waterfalls, Server Components) are present.
2.  **Content Check**: Verify Web Design Guidelines (A11y, Animation) are present.
3.  **Content Check**: Verify Stitch and Nano Banana Pro instructions are preserved.
4.  **Brevity Check**: Ensure no "Mandatory Reading" tables or "Review Checklist" sections remain.

---

## 5. Rollback Plan

- Restore previous `SKILL.md` from git history or backup.
