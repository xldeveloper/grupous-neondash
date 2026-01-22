# Plan: Enhance Landing Page & Dashboard Visuals

## 1. Research Digest
- **Current Aesthetic**: "Neon Stitch Hybrid Palette" (Navy, Gold, Off-white). High-contrast, premium feel.
- **Current Stack**: React 19, Tailwind v4, shadcn/ui, Recharts.
- **Issues Identify**:
  - Landing page is too sparse (only Hero).
  - Dashboard styling uses generic slate/gray colors instead of brand variables.
  - Hardcoded chart colors.
  - Missing "Wow" factor animations and depth.

## 2. Findings Table

| Area | Current State | Target State | Gap |
|------|---------------|--------------|-----|
| **Color Palette** | Defined in `index.css` but inconsistent usage | strictly enforced CSS vars | High |
| **Landing Page** | Basic Hero + Footer | Hero + Features + Social Proof + CTA | Major |
| **Dashboard** | Generic White Cards | "Neon" Glass/Border Cards | Medium |
| **Charts** | Hardcoded Hex codes | `var(--chart-n)` usage | Low |
| **Animations** | Basic `animate-pulse` | Coordinated entrance animations | Medium |

## 3. Atomic Tasks (Action Plan)

### PHASE 1: Design System Enforcement
- [ ] **AT-001**: Audit and update `index.css` to ensure all primitive colors map to semantic vars correctly.
- [ ] **AT-002**: Create `src/components/ui/neon-card.tsx` - a wrapper for Card with brand styling.

### PHASE 2: Landing Page Overhaul
- [ ] **AT-003**: Implement "Features Section" with 3-column grid and icons.
- [ ] **AT-004**: Implement "Social Proof/Testimonials" section.
- [ ] **AT-005**: Enhance "Hero Section" with better typography and micro-interactions.
- [ ] **AT-006**: Add "FAQ" or "About" section to flesh out the page.

### PHASE 3: Dashboard Refinement
- [ ] **AT-007**: Refactor `MyDashboard.tsx` to use `NeonCard` or updated generic Cards.
- [ ] **AT-008**: Update Recharts configuration to use `currentColor` or CSS vars.
- [ ] **AT-009**: Improve "Empty State" visuals with a better illustration or icon.

## 4. Verification
- **Visual Check**: Ensure no "slate-500" hardcoded grays remain where brand colors should be.
- **Responsiveness**: Verify Mobile vs Desktop layouts.
- **Theme**: Check Dark Mode fallbacks (even if Light mode is primary).
