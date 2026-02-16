# Frontend Design Skills Consolidation

Unify 5 skills into a single `frontend-design` skill that covers all frontend design capabilities, visual asset generation, and error correction.

---

## User Review Required

> [!IMPORTANT]
> **Breaking Change**: This plan removes 4 existing skills after consolidation.
>
> - `algorithmic-art/` -> will be deleted
> - `canvas-design/` -> will be deleted
> - `tailwind-patterns/` -> will be deleted
> - `ui-ux-pro-max/` -> will be deleted

> [!WARNING]
> The Python scripts will need path adjustments for CSV imports.

---

## Research Findings

| #   | Finding                                                                    | Confidence | Source                 | Impact      |
| --- | -------------------------------------------------------------------------- | ---------- | ---------------------- | ----------- |
| 1   | Skills should use progressive disclosure (metadata -> SKILL.md -> resources) | 5/5        | skill-creator/SKILL.md | Structure   |
| 2   | SKILL.md should be <5k words; details in references/                       | 5/5        | skill-creator L66      | Size        |
| 3   | Scripts can be executed without loading context                            | 5/5        | skill-creator L54      | Performance |
| 4   | Modular skill architecture is the 2025 standard (AgentForge paper)         | 4/5        | Tavily/ArXiv           | Architecture |
| 5   | frontend-design already has 9 well-structured reference files              | 5/5        | Local analysis         | Solid base  |

### Skills Analysis

| Skill               | SKILL.md Lines | References | Scripts | Assets      | Unique Value                     |
| ------------------- | -------------- | ---------- | ------- | ----------- | -------------------------------- |
| `frontend-design`   | 414            | 9 files    | 6       | -           | UX psychology, color, typography |
| `algorithmic-art`   | 444            | -          | -       | 2 templates | p5.js generative art             |
| `canvas-design`     | 138            | -          | -       | 81 fonts    | PDF/PNG visual art               |
| `tailwind-patterns` | 270            | -          | -       | -           | Tailwind CSS v4 patterns         |
| `ui-ux-pro-max`     | 365            | -          | 3 py    | 12 CSVs     | Design system search             |

---

## Proposed Changes

### Component 1: New Structure

#### [MODIFY] [frontend-design/SKILL.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/SKILL.md)

Rewrite SKILL.md as a master index with:

- New description covering all capabilities
- Expanded Selective Loading Table with all references
- Sections: Core Design -> CSS/Tailwind -> Visual Assets -> Design Intelligence
- Unified scripts reference
- Consolidated anti-patterns

---

#### [NEW] [tailwind-v4-patterns.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/tailwind-v4-patterns.md)

Content from `tailwind-patterns/SKILL.md` (270 lines) moved to reference file.

---

#### [NEW] [algorithmic-art-guide.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/algorithmic-art-guide.md)

Content from `algorithmic-art/SKILL.md` adapted as reference (philosophy + p5.js implementation sections).

---

#### [NEW] [canvas-design-guide.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/canvas-design-guide.md)

Content from `canvas-design/SKILL.md` adapted as reference (philosophy + canvas creation).

---

#### [NEW] [design-system-search.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/design-system-search.md)

Documentation for the UI/UX search system (usage of scripts + CSVs).

---

### Component 2: Assets Migration

#### [NEW] [assets/canvas-fonts/](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/assets/canvas-fonts/)

Move 81 fonts from `canvas-design/canvas-fonts/`.

---

#### [NEW] [assets/p5-templates/](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/assets/p5-templates/)

Move `viewer.html` and `generator_template.js` from `algorithmic-art/templates/`.

---

#### [NEW] [assets/ui-ux-data/](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/assets/ui-ux-data/)

Move all CSVs from `ui-ux-pro-max/data/` (12 files + stacks/).

---

### Component 3: Scripts Migration

#### [MODIFY] [scripts/design_system.py](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/scripts/design_system.py)

Copy from `ui-ux-pro-max/scripts/design_system.py` and adjust paths to `../assets/ui-ux-data/`.

---

#### [MODIFY] [scripts/core.py](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/scripts/core.py)

Copy from `ui-ux-pro-max/scripts/core.py` and adjust paths.

---

#### [NEW] [scripts/search.py](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/scripts/search.py)

Copy from `ui-ux-pro-max/scripts/search.py` and adjust imports.

---

### Component 4: Cleanup

#### [DELETE] [algorithmic-art/](file:///Users/mauricio/Projetos/neondash/.agent/skills/algorithmic-art/)

Remove after complete migration.

---

#### [DELETE] [canvas-design/](file:///Users/mauricio/Projetos/neondash/.agent/skills/canvas-design/)

Remove after complete migration.

---

#### [DELETE] [tailwind-patterns/](file:///Users/mauricio/Projetos/neondash/.agent/skills/tailwind-patterns/)

Remove after complete migration.

---

#### [DELETE] [ui-ux-pro-max/](file:///Users/mauricio/Projetos/neondash/.agent/skills/ui-ux-pro-max/)

Remove after complete migration.

---

## Verification Plan

### Automated Tests

**There are no existing automated tests for skills.**

### Manual Verification

1. **Script functionality**

   ```bash
   # Test generate_images.py
   python .agent/skills/frontend-design/scripts/generate_images.py "test placeholder hero" "test_output"

   # Test design system search
   python .agent/skills/frontend-design/scripts/search.py "saas dashboard" --design-system

   # Test UX audit
   python .agent/skills/frontend-design/scripts/ux_audit.py client/src/
   ```

2. **Skill loading**
   - Verify that SKILL.md has < 5k words
   - Verify that description covers all use cases
   - Verify links to reference files

3. **Assets integrity**
   - Confirm 81 fonts in `assets/canvas-fonts/`
   - Confirm 2 templates in `assets/p5-templates/`
   - Confirm 12+ CSVs in `assets/ui-ux-data/`

---

## Atomic Tasks

### AT-01: Create directory structure

PARALLEL-SAFE

```bash
mkdir -p .agent/skills/frontend-design/assets/{canvas-fonts,p5-templates,ui-ux-data}
```

**Validation**: `ls -la .agent/skills/frontend-design/assets/`
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/`

---

### AT-02: Migrate canvas fonts

PARALLEL-SAFE

```bash
cp -r .agent/skills/canvas-design/canvas-fonts/* .agent/skills/frontend-design/assets/canvas-fonts/
```

**Validation**: `ls .agent/skills/frontend-design/assets/canvas-fonts/ | wc -l` (should be 81)
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/canvas-fonts/*`

---

### AT-03: Migrate p5 templates

PARALLEL-SAFE

```bash
cp .agent/skills/algorithmic-art/templates/* .agent/skills/frontend-design/assets/p5-templates/
```

**Validation**: `ls .agent/skills/frontend-design/assets/p5-templates/`
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/p5-templates/*`

---

### AT-04: Migrate UI/UX data

PARALLEL-SAFE

```bash
cp -r .agent/skills/ui-ux-pro-max/data/* .agent/skills/frontend-design/assets/ui-ux-data/
```

**Validation**: `ls .agent/skills/frontend-design/assets/ui-ux-data/*.csv | wc -l` (should be >=12)
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/ui-ux-data/*`

---

### AT-05: Migrate and adjust UI/UX scripts

Depends: AT-04

```bash
# Copy scripts
cp .agent/skills/ui-ux-pro-max/scripts/*.py .agent/skills/frontend-design/scripts/
```

Adjust paths in files to `../assets/ui-ux-data/`
**Validation**: `python .agent/skills/frontend-design/scripts/search.py "test" --domain style`
**Rollback**: `rm .agent/skills/frontend-design/scripts/{design_system,core,search}.py`

---

### AT-06: Create tailwind-v4-patterns.md

PARALLEL-SAFE
Convert content from `tailwind-patterns/SKILL.md` to reference file.
**Validation**: `wc -l .agent/skills/frontend-design/tailwind-v4-patterns.md` (should be ~270)
**Rollback**: `rm .agent/skills/frontend-design/tailwind-v4-patterns.md`

---

### AT-07: Create algorithmic-art-guide.md

PARALLEL-SAFE
Adapt content from `algorithmic-art/SKILL.md` to reference file.
**Validation**: `wc -l .agent/skills/frontend-design/algorithmic-art-guide.md`
**Rollback**: `rm .agent/skills/frontend-design/algorithmic-art-guide.md`

---

### AT-08: Create canvas-design-guide.md

PARALLEL-SAFE
Adapt content from `canvas-design/SKILL.md` to reference file.
**Validation**: `wc -l .agent/skills/frontend-design/canvas-design-guide.md`
**Rollback**: `rm .agent/skills/frontend-design/canvas-design-guide.md`

---

### AT-09: Create design-system-search.md

PARALLEL-SAFE
Document usage of search scripts + CSVs.
**Validation**: `head -20 .agent/skills/frontend-design/design-system-search.md`
**Rollback**: `rm .agent/skills/frontend-design/design-system-search.md`

---

### AT-10: Rewrite SKILL.md

Depends: AT-06, AT-07, AT-08, AT-09
Create new consolidated SKILL.md with all capabilities.
**Validation**: `wc -w .agent/skills/frontend-design/SKILL.md` (should be < 5000 words)
**Rollback**: Restore from git

---

### AT-11: Test migrated scripts

Depends: AT-05, AT-10
Execute all scripts to ensure they work.
**Validation**: Scripts execute without error

---

### AT-12: Delete old skills

Depends: AT-11

```bash
rm -rf .agent/skills/algorithmic-art
rm -rf .agent/skills/canvas-design
rm -rf .agent/skills/tailwind-patterns
rm -rf .agent/skills/ui-ux-pro-max
```

**Validation**: `ls .agent/skills/` does not contain the 4 skills
**Rollback**: `git checkout -- .agent/skills/`

---

## Pre-Submission Checklist

### Research

- [x] Codebase patterns searched and documented
- [x] skill-creator guidelines reviewed
- [x] Web search for modern patterns (2025)
- [x] Sequential thinking applied
- [x] Cross-validation across sources

### Context

- [x] Findings Table with confidence scores
- [x] Edge cases documented
- [x] Relevant files specified with paths

### Tasks

- [x] Truly atomic (single action)
- [x] Validation command for each
- [x] Dependencies mapped
- [x] Rollback steps defined
- [x] Parallel-safe marked with ⚡

### Quality

- [x] Mode specified (CONSERVATIVE)
- [x] Output format explicit
- [x] Success criteria measurable
