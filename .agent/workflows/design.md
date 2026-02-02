---
description: Unified frontend design workflow using ui-ux-pro-max (design intelligence) and frontend-design (assets + validation) skills. Triggers on /design command.
---

# Command: /design

Comprehensive design workflow for web/mobile applications. Combines design system intelligence from `ui-ux-pro-max` with asset generation and validation from `frontend-design`.

## Trigger

- `/design` or `/design "description"`
- Design-related requests: create UI, build component, design page, improve UX

---

## Dual Skill Architecture

> [!IMPORTANT]
> This workflow uses TWO complementary skills:

| Skill | Role | When Used |
|-------|------|-----------|
| `ui-ux-pro-max` | Design Intelligence | Phase 1 (Design System) |
| `frontend-design` | Assets + Validation | Phase 2-4 (Implementation) |

**Priority:** Design decisions from `ui-ux-pro-max` take precedence over conflicting advice.

---

## Prerequisites

```bash
# Verify Python for design scripts
python3 --version || python --version
```

---

## Phase 0: Requirement Analysis (MANDATORY)

**⛔ DO NOT start designing until you complete this analysis!**

### 0.1 Constraint Analysis

| Constraint | Question | Why It Matters |
|------------|----------|----------------|
| **Timeline** | How much time? | Determines complexity |
| **Content** | Ready or placeholder? | Affects layout flexibility |
| **Brand** | Existing guidelines? | May dictate colors/fonts |
| **Tech** | What stack? | Affects capabilities |
| **Audience** | Who exactly? | Drives all visual decisions |

### 0.2 Extract Requirements

- **Product type**: SaaS, e-commerce, portfolio, dashboard, landing page, etc.
- **Style keywords**: minimal, playful, professional, elegant, dark mode, etc.
- **Industry**: healthcare, fintech, gaming, education, etc.
- **Stack**: Default to `shadcn` for this project

### 0.3 Socratic Gate

**If any of these are unclear, ASK:**
- "What color palette do you prefer?"
- "What style are you going for?"
- "Do you have a layout preference?"

---

## Phase 1: Design System Generation (ui-ux-pro-max)

### 1.1 Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations:

```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"
```

**Example:**
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "saas dashboard dark mode analytics" --design-system -p "Neondash"
```

This command:
1. Searches 5 domains in parallel (product, style, color, landing, typography)
2. Applies 100 reasoning rules from `ui-reasoning.csv`
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

### 1.2 Persist Design System (Optional - Cross-Session)

For multi-page projects, save the design system for hierarchical retrieval:

```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

**Creates:**
```
design-system/<project-slug>/
├── MASTER.md          # Global Source of Truth
└── pages/
    └── <page-name>.md # Page-specific overrides
```

**With page-specific override:**
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

**Context-aware retrieval prompt:**
```
I am building the [Page Name] page. Please read design-system/<project>/MASTER.md.
Also check if design-system/<project>/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
```

### 1.3 Supplementary Searches (as needed)

```bash
# Domain-specific details
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "elegant luxury" --domain typography
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "dark mode dashboard" --domain style

# Stack-specific guidelines
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "form validation" --stack shadcn
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "responsive layout" --stack html-tailwind
```

**Available Domains:** `product`, `style`, `typography`, `color`, `landing`, `chart`, `ux`, `react`, `web`

**Available Stacks:** `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## Phase 2: Asset Generation (frontend-design) - Optional

Use when visual assets are needed.

### 2.1 Image Generation (Nano Banana)

```bash
python3 .agent/skills/frontend-design/scripts/generate_images.py "Your prompt" "output_filename"
```

Models:
- **gemini-2.5-flash-image**: Speed/bulk placeholders
- **gemini-3-pro-image-preview**: Hero/marketing assets

### 2.2 Generative Art (p5.js)

Use templates in `.agent/skills/frontend-design/assets/p5-templates/`:
- `viewer.html` - Interactive artifact template
- `generator_template.js` - Code patterns

Read [algorithmic-art-guide.md](file:///home/mauricio/neondash/.agent/skills/frontend-design/algorithmic-art-guide.md) for philosophy.

### 2.3 Canvas Art (PDF/PNG)

Use 81 fonts in `.agent/skills/frontend-design/assets/canvas-fonts/`.

Read [canvas-design-guide.md](file:///home/mauricio/neondash/.agent/skills/frontend-design/canvas-design-guide.md) for process.

---

## Phase 3: Implementation

### 3.1 Theme Integration (GPUS Default)

Apply the GPUS theme from `gpus-theme` skill:

```css
/* Theme assets */
.agent/skills/gpus-theme/assets/theme-tokens.css
.agent/skills/gpus-theme/assets/tailwind-theme.ts
.agent/skills/gpus-theme/assets/components.json
```

**60-30-10 Rule:**
- 60% → Background (Navy/White)
- 30% → Foreground (Gold/Dark Blue)
- 10% → Accent/CTA (Gold)

### 3.2 Component Usage (shadcn/ui)

```tsx
// Always import from @/components/ui/
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Wrap with custom styling, don't recreate
export function FeatureCard({ ...props }) {
  return (
    <Card className="border-primary/20 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
      </CardHeader>
      <CardContent>{/* content */}</CardContent>
    </Card>
  );
}
```

### 3.3 Build Order

1. **HTML structure** (semantic, accessible)
2. **CSS/Tailwind** (8-point grid, design system tokens)
3. **Interactivity** (states, transitions, animations)

### 3.4 Requirements

- React 19 + Tailwind v4 + shadcn/ui
- Mobile-first, 44px+ touch targets
- WCAG 2.1 AA compliance (contrast 4.5:1, keyboard nav, screen reader)
- `prefers-reduced-motion` respected
- Portuguese interface when applicable

---

## Phase 4: Validation (frontend-design) - MANDATORY

### 4.1 UX Audit

```bash
python3 .agent/skills/frontend-design/scripts/ux_audit.py <project_path>
```

### 4.2 Accessibility Check

```bash
python3 .agent/skills/frontend-design/scripts/accessibility_checker.py <file>
```

### 4.3 Code Quality

```bash
bun run check   # TypeScript validation
bun run lint    # Biome lint + format
bun test        # Unit tests
```

---

## Common Frontend Errors (AVOID)

| Error | Symptom | Fix |
|-------|---------|-----|
| Emoji as icons | 🎨 🚀 ⚙️ in UI | Use SVG from Heroicons/Lucide |
| Missing cursor-pointer | Clickable but no cursor change | Add `cursor-pointer` class |
| Layout shift on hover | Elements jump | Use `transform` not `width/height` |
| Low contrast text | Gray-400 on white | Use Gray-600+ for body text |
| Unstable hover states | Card resizes on hover | Use `scale` with fixed container |
| Missing focus states | No keyboard navigation | Add visible focus rings |

---

## Anti-Safe Harbor Patterns (FORBIDDEN as defaults)

| ❌ Forbidden Default | ✅ Alternative |
|---------------------|----------------|
| Left/Right Split Hero | Massive Typography, Vertical Narrative |
| Bento Grids | Asymmetric layouts, Overlapping layers |
| Mesh/Aurora Gradients | Solid colors, Grain textures |
| Glassmorphism everywhere | High-contrast flat |
| Deep Cyan/Fintech Blue | Project-specific colors |
| Purple/Violet anything | **PURPLE BAN ✅** |

---

## Pre-Delivery Checklist

### Visual Quality (ui-ux-pro-max)

- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Use theme colors directly (`bg-primary`) not `var()` wrapper

### Interaction

- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation

### Contrast & Accessibility

- [ ] Light mode text contrast 4.5:1 minimum
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
- [ ] `prefers-reduced-motion` respected

### Responsive

- [ ] Tested at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Touch targets 44px+ on mobile

### Code Quality

- [ ] `bun run check` passes (TypeScript)
- [ ] `bun run lint` passes (Biome)
- [ ] No console errors in browser

### Validation Scripts (frontend-design)

- [ ] `python3 .agent/skills/frontend-design/scripts/ux_audit.py` passes
- [ ] `python3 .agent/skills/frontend-design/scripts/accessibility_checker.py` passes

---

## Skill References

### ui-ux-pro-max (Design Intelligence)

| Reference | When to Read |
|-----------|-------------|
| `SKILL.md` | Always (search usage) |
| `data/ui-reasoning.csv` | Industry-specific rules |
| `data/styles.csv` | 67 UI styles |
| `data/colors.csv` | 96 color palettes |
| `data/typography.csv` | 57 font pairings |

### frontend-design (Assets + Validation)

| Reference | When to Read |
|-----------|-------------|
| `SKILL.md` | Always (master index) |
| `ux-psychology.md` | Core UX principles |
| `tailwind-v4-patterns.md` | Tailwind CSS v4, container queries |
| `animation-guide.md` | Animation needed |
| `algorithmic-art-guide.md` | p5.js generative art |
| `canvas-design-guide.md` | PDF/PNG visual art |
| `nanobananaskill.md` | AI image generation |

### gpus-theme (Project Theme)

| Reference | When to Read |
|-----------|-------------|
| `SKILL.md` | GPUS palette details |
| `assets/theme-tokens.css` | CSS variables |
| `assets/tailwind-theme.ts` | Tailwind config |
| `assets/components.json` | shadcn config |

---

## Usage Examples

```bash
/design "Dashboard brutalista para métricas de vendas"
/design "Landing page minimalista para clínica de estética"
/design "Background generativo de partículas para a landing"
/design  # (interactive mode - will ask questions)
```

---

> 🔴 **MAESTRO RULE:** "If I can find this layout in a Tailwind UI template, I have FAILED."
