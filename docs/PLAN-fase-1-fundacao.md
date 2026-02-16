# Implementation Plan: Phase 1 - Foundation (Design System & Styles)

**Objective:** Establish a consistent visual identity for NeonDash, adjusting colors, contrast, and cleaning up unnecessary UI elements. This phase is the foundation for all others and ensures that future components follow the same standard.

**Total Estimated Time:** ~3 hours

**Average Complexity:** L1.6

**Issues Involved:** GPU-25, GPU-29, GPU-26

---

## Parallel Tasks

All tasks in this phase are independent and can be executed in parallel.

### 1. GPU-25: Change Text Colors in Light Mode

**Objective:** Improve contrast and align light mode with the project's visual identity (teal blue).

#### Atomic Tasks

- **AT-001:** Identify the text color variables for light mode in the `client/src/index.css` file (inside the `:root` selector).
- **AT-002:** Update the `--foreground` variable to the main teal blue tone (`#0d4f5a`) and adjust secondary variables (`--muted-foreground`, etc.) to complementary tones that ensure visual hierarchy.
- **AT-003:** Validate the contrast of all changes with an accessibility tool to ensure compliance with the WCAG AA standard (minimum 4.5:1).

#### Antigravity Prompt

```markdown
# ROLE: UI Developer

# CONTEXT: NeonDash Project (React + Tailwind CSS)

# TASK: Update light mode text colors to Teal Blue

1.  Open the file `client/src/index.css`.
2.  In the `:root` selector, locate the text color variables (`--foreground`, `--muted-foreground`, etc.).
3.  Change the main text color to the project's Teal Blue: `#0d4f5a`.
4.  Adjust secondary colors to ensure a clear and readable visual hierarchy.
5.  Verify that the contrast of all text on the light background meets the WCAG AA standard (minimum 4.5:1).
6.  Navigate through all pages in light mode to confirm visual consistency.
```

---

### 2. GPU-29: Change Dark Mode Font

**Objective:** Improve readability and visual appeal of dark mode, using more vibrant colors for text and highlight elements.

#### Atomic Tasks

- **AT-001:** Locate the text color variables for dark mode in the `client/src/index.css` file (inside the `.dark` selector).
- **AT-002:** Update the `--foreground` variable to a soft white (`#F8FAFC`) for body text, ensuring visual comfort.
- **AT-003:** Apply the Neon highlight colors (Gold: `#F59E0B` or Light Blue: `#0ea5e9`) to headings, links, and interactive elements to create contrast and hierarchy.

#### Antigravity Prompt

```markdown
# ROLE: UI Engineer

# CONTEXT: NeonDash Project (React + Tailwind CSS)

# TASK: Optimize dark mode contrast and colors

1.  Open the file `client/src/index.css`.
2.  In the `.dark` selector, update the foreground color variable (`--foreground`) to `#F8FAFC`.
3.  For headings and highlight elements (links, secondary buttons), use the Neon Gold color: `#F59E0B`.
4.  Ensure the contrast against the dark background (`#0F172A`) is at least 7:1 (WCAG AAA) for important text.
5.  Review all text components in dark mode to ensure consistency.
```

---

### 3. GPU-26: Remove System Online Card

**Objective:** Simplify the dashboard interface by removing a visually redundant element.

#### Atomic Tasks

- **AT-001:** Locate the component or JSX code snippet that renders the "System Online" indicator in the `client/src/pages/MyDashboard.tsx` file.
- **AT-002:** Completely remove the indicator's JSX code.
- **AT-003:** Check if there are states (`useState`) or effects (`useEffect`) associated exclusively with this indicator and remove them to clean up the code.

#### Antigravity Prompt

```markdown
# ROLE: Frontend Developer

# CONTEXT: NeonDash Project (React)

# TASK: Remove "System Online" indicator from MyDashboard

1.  Open the file `client/src/pages/MyDashboard.tsx`.
2.  Locate and remove the JSX element that renders the "System Online" status indicator (likely a `div` with text and a pulse animation).
3.  Inspect the component for any state or logic that was used only by this indicator and remove them.
4.  Run `bun run build` to ensure the removal did not introduce errors.
```
