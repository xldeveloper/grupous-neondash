# PLAN-stitch-redesign: Neon Dash Design Overhaul

> **Goal:** Align "neondash" with the "Neon Admin Insights Dashboard" design from Stitch project `18341352454972768903`, utilizing `Manrope` typography and `#ec1380` (Neon Pink) primary branding across all pages.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | **Primary Color:** `#ec1380` (Neon Pink) | 5/5 | Stitch API | Replaces current Slate/Blue primary. Needs HSL conversion for CSS variables. |
| 2 | **Typography:** `Manrope` | 5/5 | Stitch API | Replaces `Outfit` and `Inter` throughout the app. |
| 3 | **Roundness:** `ROUND_EIGHT` (~8px/0.5rem) | 4/5 | Stitch API | Matches current defaults (`0.5rem`), minimal change needed here. |
| 4 | **Style:** "Admin Insights" / Text-to-UI Pro | 4/5 | Stitch API | Implies clean, data-heavy but visually distinct dashboard. |
| 5 | **Tech Stack:** React 19 + Tailwind v4 + shadcn/ui | 5/5 | `GEMINI.md` | Constraints for implementation. |

### Knowledge Gaps & Assumptions
- **Gap:** Exact layout of the Stitch screens is not visible (no screenshot access).
- **Assumption:** "Admin Insights" implies a sidebar layout (which we have) + top cards + charts.
- **Assumption:** The "Avant-Garde" / "Intentional Minimalism" rule from `AGENTS.md` applies to *how* we interpret the Stitch design (cleaner, bolder).

---

## 1. User Review Required (Critical)

> [!IMPORTANT]
> **Design Pivot:** We are shifting from a generic "Slate/Blue" theme to a bold "**Neon Pink (#ec1380)**" brand. This will affect **all** buttons, links, and active states.
>
> **Font Change:** Switching globally to **Manrope**.

---

## 2. Proposed Changes

### Phase 1: Foundation (Fonts & Token System)

#### [MODIFY] [index.html](file:///home/mauricio/neondash/client/index.html)
- **Action:** Replace Google Fonts link.
- **Remove:** `Outfit` and `JetBrains Mono`
- **Add:** `Manrope:wght@200..800`

#### [MODIFY] [index.css](file:///home/mauricio/neondash/client/src/index.css)
- **Action:** Update Global CSS Variables.
- **Font:** Set `--font-sans: "Manrope", sans-serif;`
- **Primary Color:** Update `--primary` and brand extension vars to `#ec1380`.
  - *Conversion:* `#ec1380` -> HSL `330 85% 50%` (Approx, will verify).
- **Dark Mode:** Retune dark mode to work with high-contrast Neon Pink.

### Phase 2: Component Refinement

#### [MODIFY] [sidebar.tsx](file:///home/mauricio/neondash/client/src/components/ui/sidebar.tsx)
- **Action:** Ensure sidebar styling aligns with the new brand color (active states).

#### [MODIFY] [button.tsx](file:///home/mauricio/neondash/client/src/components/ui/button.tsx)
- **Action:** Verify hover states for the new pink primary.

### Phase 3: Page Layout Alignment

#### [MODIFY] [Dashboard.tsx](file:///home/mauricio/neondash/client/src/pages/Dashboard.tsx) (and others)
- **Action:** Audit semantic class usage. Ensure generic `text-slate-X` are replaced with semantic `text-muted-foreground` to respect the new theme.

---

## 3. Atomic Implementation Tasks

| Task ID | Description | Dependencies | Verification |
|---------|-------------|--------------|--------------|
| **AT-001** | **Setup Typography:** Replace `index.html` fonts and `index.css` font-family var with Manrope. | None | `agent-browser get computed-style --font-family` |
| **AT-002** | **Update Color Palette:** Inject `#ec1380` (Neon Pink) into `index.css` as main primary HSL. Adjust generic brand vars. | AT-001 | Visual Check |
| **AT-003** | **Refine Dark Mode:** Adjust `--background` and `--card` to deep slate/black to pop with Neon Pink. | AT-002 | Visual Check |
| **AT-004** | **Component Polish:** Audit `Button`, `Badge`, `Card` for primary color usage. | AT-003 | `bun test` |

---

## 4. Verification Plan

### Automated
- **Lint:** `bun run check && bun run format`
- **Build:** `bun run build` to ensure CSS compiles with Tailwind v4.

### Manual (Browser Agent)
1. Open `http://localhost:3000`
2. Inspect `<body>` font-family (Must be Manrope).
3. Check "Primary Button" color (Must be Pink #ec1380).
4. Toggle Dark Mode -> Verify contrast.

---

## 5. Rollback Plan
- Revert `client/index.html` and `client/src/index.css` via git.
