# PLAN-stitch-redesign: Neon Dash Design Overhaul (Enhanced)

> **Goal:** Align "neondash" with the "Neon Admin Insights Dashboard" design from Stitch project, utilizing `Manrope` typography and `#ec1380` (Neon Pink) primary branding across **all** pages.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | **Primary Color:** `#ec1380` (Neon Pink) | 5/5 | Stitch API | Replaces current Slate/Blue primary. |
| 2 | **Typography:** `Manrope` | 5/5 | Stitch API | Replaces `Outfit` and `Inter`. |
| 3 | **Roundness:** `ROUND_EIGHT` (~8px/0.5rem) | 4/5 | Stitch API | Matches current defaults. |
| 4 | **Legacy Colors:** 60+ files still use `neon-gold`, `neon-blue` | 5/5 | grep_search | Major refactoring needed. |
| 5 | **Tech Stack:** React 19 + Tailwind v4 + shadcn/ui | 5/5 | GEMINI.md | Constraints for implementation. |

### Knowledge Gaps & Assumptions
- **Gap:** Some `neon-gold` uses are semantic (e.g., "gold" indicators), may need case-by-case review.
- **Assumption:** `neon-blue` and `neon-gold` should map to `primary` or be replaced with semantic tokens.

---

## 1. User Review Required

> [!IMPORTANT]
> **Scope Expansion:** The original plan covered 4 atomic tasks. Verification revealed **60+ files** still using legacy `neon-gold` and `neon-blue` tokens.
>
> **Decision Needed:**
> 1. **Full Refactor** (Phase 2): Replace all legacy tokens across all files.
> 2. **Core Pages Only**: Keep legacy tokens for now in less critical components.

---

## 2. Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)

| File | Action | Status |
|------|--------|--------|
| [index.html](file:///home/mauricio/neondash/client/index.html) | Replace Google Fonts to Manrope | ✅ Done |
| [index.css](file:///home/mauricio/neondash/client/src/index.css) | Update `--primary` to Pink, add Manrope | ✅ Done |
| [button.tsx](file:///home/mauricio/neondash/client/src/components/ui/button.tsx) | Verified uses `bg-primary` | ✅ Done |
| [sidebar.tsx](file:///home/mauricio/neondash/client/src/components/ui/sidebar.tsx) | Uses `bg-sidebar` tokens | ✅ Done |

### ✅ Phase 1.5: Core Pages (COMPLETE)

| File | Action | Status |
|------|--------|--------|
| [MyDashboard.tsx](file:///home/mauricio/neondash/client/src/pages/MyDashboard.tsx) | Replace `neon-*` with semantic tokens | ✅ Done |
| [Home.tsx](file:///home/mauricio/neondash/client/src/pages/Home.tsx) | Replace `neon-*` with semantic tokens | ✅ Done |
| [Agenda.tsx](file:///home/mauricio/neondash/client/src/pages/Agenda.tsx) | Replace `neon-*` with semantic tokens | ✅ Done |
| [LeadsPage.tsx](file:///home/mauricio/neondash/client/src/pages/crm/LeadsPage.tsx) | Replace avatar color | ✅ Done |

### ⏳ Phase 2: Full Refactor (PENDING)

Components with remaining legacy colors:

| Category | Files | Example Tokens |
|----------|-------|----------------|
| Charts | `ComparativoView.tsx`, `EvolutionChart.tsx` | `var(--color-neon-gold)` |
| Dashboard | `TaskBoard.tsx`, `NeonCRM.tsx`, `ClassList.tsx`, `PlaybookView.tsx` | `text-neon-gold`, `bg-neon-blue` |
| Admin | `MenteeManagementView.tsx`, `LinkEmailsView.tsx`, `AdminDiagnosticoView.tsx` | `border-neon-blue/20` |
| Landing | `LandingPage.tsx`, `MentorshipContent.tsx` | Heavy `neon-gold`/`neon-blue` usage |
| Onboarding | `PrimeiroAcesso.tsx`, `VincularEmails.tsx` | `bg-neon-gold/5` |
| UI Primitives | `card.tsx`, `animated-tooltip.tsx`, `floating-dock-tabs.tsx` | `hover:border-neon-gold` |
| Forms | `DiagnosticoForm.tsx`, `SubmitMetricsSheet.tsx` | `bg-neon-blue`, `text-neon-gold` |

---

## 3. Atomic Tasks (Phase 2)

### AT-005: Refactor Dashboard Components ⚡
**Goal:** Replace legacy tokens in dashboard widgets.
**Files:**
- `TaskBoard.tsx` (5 occurrences)
- `NeonCRM.tsx` (4 occurrences)
- `ClassList.tsx` (2 occurrences)
- `PlaybookView.tsx` (1 occurrence)
- `DiagnosticoForm.tsx` (4 occurrences)
- `SubmitMetricsSheet.tsx` (1 occurrence)

**Subtasks:**
- [ ] ST-005.1: Replace `text-neon-gold` → `text-primary`
- [ ] ST-005.2: Replace `bg-neon-gold` → `bg-primary`
- [ ] ST-005.3: Replace `text-neon-blue` → `text-foreground` or `text-muted-foreground`
- [ ] ST-005.4: Replace `border-neon-blue/20` → `border-border`
- [ ] ST-005.5: Validate with `bun run check`

---

### AT-006: Refactor Chart Components ⚡
**Goal:** Update chart colors to use CSS variables.
**Files:**
- `ComparativoView.tsx` (6 occurrences)
- `EvolutionChart.tsx` (2 occurrences)

**Subtasks:**
- [ ] ST-006.1: Replace `var(--color-neon-gold)` → `var(--primary)` or `hsl(var(--primary))`
- [ ] ST-006.2: Replace `var(--color-neon-blue)` → `hsl(var(--chart-2))` or appropriate chart token
- [ ] ST-006.3: Validate charts render correctly

---

### AT-007: Refactor Admin Components ⚡
**Goal:** Replace legacy tokens in admin views.
**Files:**
- `MenteeManagementView.tsx` (8 occurrences)
- `LinkEmailsView.tsx` (10 occurrences)
- `AdminDiagnosticoView.tsx` (3 occurrences)

**Subtasks:**
- [ ] ST-007.1: Replace `bg-neon-blue` buttons → `bg-primary`
- [ ] ST-007.2: Replace `text-neon-blue-dark` → `text-foreground`
- [ ] ST-007.3: Replace `border-neon-gold/30` → `border-primary/30`
- [ ] ST-007.4: Validate admin flows

---

### AT-008: Refactor Landing Page ⚡
**Goal:** Update landing page to new brand colors.
**Files:**
- `LandingPage.tsx` (~20 occurrences)
- `MentorshipContent.tsx` (~30 occurrences)

**Subtasks:**
- [ ] ST-008.1: Replace `bg-neon-gold` CTAs → `bg-primary`
- [ ] ST-008.2: Replace `text-neon-blue-dark` headings → `text-foreground`
- [ ] ST-008.3: Replace gradient references
- [ ] ST-008.4: Validate visual hierarchy maintained

---

### AT-009: Refactor Onboarding Pages ⚡
**Goal:** Update onboarding to new brand.
**Files:**
- `PrimeiroAcesso.tsx` (10 occurrences)
- `VincularEmails.tsx` (1 occurrence)

**Subtasks:**
- [ ] ST-009.1: Replace `bg-neon-gold/5` → `bg-primary/5`
- [ ] ST-009.2: Replace `text-neon-gold` → `text-primary`
- [ ] ST-009.3: Validate onboarding flow

---

### AT-010: Refactor UI Primitives ⚡
**Goal:** Update shared UI components.
**Files:**
- `card.tsx` (1 occurrence)
- `animated-tooltip.tsx` (2 occurrences)
- `floating-dock-tabs.tsx` (1 occurrence)

**Subtasks:**
- [ ] ST-010.1: Replace `hover:border-neon-gold` → `hover:border-primary`
- [ ] ST-010.2: Replace `ring-neon-gold-bright` → `ring-primary`
- [ ] ST-010.3: Validate component usage across app

---

## 4. Verification Plan

### Automated
- `bun run check` - TypeScript validation
- `bun run lint` - Biome linting

### Manual
1. Open `http://localhost:3000` in browser
2. Toggle light/dark mode
3. Verify primary color is Pink (#ec1380)
4. Verify font is Manrope
5. Check charts render with new colors
6. Check landing page visual consistency

---

## 5. Rollback Plan

```bash
# Revert font changes
git checkout client/index.html client/src/index.css

# Revert component changes (atomic per file)
git checkout client/src/components/...
git checkout client/src/pages/...
```
