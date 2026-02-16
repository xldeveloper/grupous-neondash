# Implementation Plan: Phase 2 - Core UI Components

**Objective:** Refactor essential user interface components to align them with the new Neon visual identity and improve the navigation experience.

**Total Estimated Time:** ~6 hours

**Average Complexity:** L4

**Issues Involved:** GPU-24, GPU-27

**Dependencies:** Completion of Phase 1 (Foundation - Design System & Styles).

---

## Sequential Tasks

### 1. GPU-24: Change Tab Selection Component

**Objective:** Replace the default shadcn/ui tabs component with a customized, more modern version aligned with the Neon style.

#### Atomic Tasks

- **AT-001:** In the `client/src/components/ui/tabs.tsx` file, create a new variant or component (e.g.: `NeonTabs`) that inherits the functionality of the original `Tabs`.
- **AT-002:** Style the new component so the background is dark (`#0F172A`) and the active tab indicator has an animated gradient (from `#F59E0B` to `#FBBF24`).
- **AT-003:** Use the `framer-motion` library to add a layout animation (`layoutId`) that smoothly moves the indicator between tabs.
- **AT-004:** Replace the default `TabsList` with the new `NeonTabs` component in the `client/src/pages/MyDashboard.tsx` file.

#### Antigravity Prompt

```markdown
# ROLE: Senior Frontend Engineer

# CONTEXT: NeonDash Project (React + Tailwind + shadcn/ui)

# TASK: Implement new tab design with animation

1.  Read the file `client/src/components/ui/tabs.tsx`.
2.  Create a new variant or `NeonTabs` component that uses a dark background (`#0F172A`) and a selection indicator with gradient (Primary: `#F59E0B` to Secondary: `#FBBF24`).
3.  Add a smooth transition animation between tabs using `framer-motion` (already installed), applying a `layoutId` to the indicator.
4.  Apply the new component in the `client/src/pages/MyDashboard.tsx` file, replacing the current `TabsList`.
5.  Ensure the text contrast is WCAG AAA (Text: `#F8FAFC` on dark background).
6.  Run `bun run build` to validate the implementation.
```

---

### 2. GPU-27: Replace Mentee Selection with Floating Dock

**Objective:** Replace the default mentee `Select` with a richer, more interactive user experience inspired by the macOS Dock.

#### Atomic Tasks

- **AT-001:** Create a new component file at `client/src/components/ui/floating-dock.tsx`.
- **AT-002:** Implement the Floating Dock logic using `framer-motion` to create the "magnetic scale" effect on icons as the mouse approaches.
- **AT-003:** Populate the dock with mentee avatars. If a mentee has no photo, generate an avatar with their initials and a background color from the Neon palette.
- **AT-004:** In the main application layout (likely `client/src/components/DashboardLayout.tsx`), replace the mentee `Select` component with the new `FloatingDock`.
- **AT-005:** Ensure that clicking an avatar in the dock updates the global state of the selected mentee, filtering the dashboard data.

#### Antigravity Prompt

```markdown
# ROLE: Senior UI/UX Developer

# CONTEXT: NeonDash Project (React + Framer Motion)

# TASK: Implement Floating Dock for mentee selection

1.  Create a new file `client/src/components/ui/floating-dock.tsx`.
2.  Implement the Floating Dock component (inspired by Aceternity UI) using `framer-motion` for scale and position animations based on mouse proximity.
3.  The dock should display mentee avatars. If there is no photo, use initials with a colored background from the project.
4.  In the main layout file (check `client/src/components/DashboardLayout.tsx` or wherever the mentee selector is), replace the current `Select` with the new `FloatingDock`.
5.  Ensure that clicking a dock item updates the global selected mentee state.
6.  Add elegant tooltips above each icon with the mentee's name on hover.
7.  Run `bun run check` to validate types and `bun run build` for compilation.
```
