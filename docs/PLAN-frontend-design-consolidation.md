# Consolidação de Skills de Frontend Design

Unificar 5 skills em uma única `frontend-design` skill que abranja todas as capacidades de design frontend, geração de assets visuais e correção de erros.

---

## User Review Required

> [!IMPORTANT]
> **Breaking Change**: Este plano remove 4 skills existentes após consolidação.
>
> - `algorithmic-art/` → será deletada
> - `canvas-design/` → será deletada
> - `tailwind-patterns/` → será deletada
> - `ui-ux-pro-max/` → será deletada

> [!WARNING]
> Os scripts Python precisarão de ajustes nos paths de import para os CSVs.

---

## Research Findings

| #   | Finding                                                                    | Confidence | Source                 | Impact      |
| --- | -------------------------------------------------------------------------- | ---------- | ---------------------- | ----------- |
| 1   | Skills devem usar progressive disclosure (metadata → SKILL.md → resources) | 5/5        | skill-creator/SKILL.md | Estrutura   |
| 2   | SKILL.md deve ter <5k palavras; detalhes em references/                    | 5/5        | skill-creator L66      | Tamanho     |
| 3   | Scripts podem ser executados sem carregar contexto                         | 5/5        | skill-creator L54      | Performance |
| 4   | Modular skill architecture é padrão 2025 (AgentForge paper)                | 4/5        | Tavily/ArXiv           | Arquitetura |
| 5   | frontend-design já tem 9 reference files bem estruturados                  | 5/5        | Análise local          | Base sólida |

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

Reescrever SKILL.md como master index com:

- Nova description cobrindo todas as capacidades
- Selective Loading Table expandida com todos os references
- Seções: Core Design → CSS/Tailwind → Visual Assets → Design Intelligence
- Scripts reference unificado
- Anti-patterns consolidados

---

#### [NEW] [tailwind-v4-patterns.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/tailwind-v4-patterns.md)

Conteúdo do `tailwind-patterns/SKILL.md` (270 linhas) movido para reference file.

---

#### [NEW] [algorithmic-art-guide.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/algorithmic-art-guide.md)

Conteúdo do `algorithmic-art/SKILL.md` adaptado como reference (seções de filosofia + implementação p5.js).

---

#### [NEW] [canvas-design-guide.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/canvas-design-guide.md)

Conteúdo do `canvas-design/SKILL.md` adaptado como reference (filosofia + criação de canvas).

---

#### [NEW] [design-system-search.md](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/design-system-search.md)

Documentação do sistema de busca UI/UX (uso dos scripts + CSVs).

---

### Component 2: Assets Migration

#### [NEW] [assets/canvas-fonts/](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/assets/canvas-fonts/)

Mover 81 fonts de `canvas-design/canvas-fonts/`.

---

#### [NEW] [assets/p5-templates/](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/assets/p5-templates/)

Mover `viewer.html` e `generator_template.js` de `algorithmic-art/templates/`.

---

#### [NEW] [assets/ui-ux-data/](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/assets/ui-ux-data/)

Mover todos os CSVs de `ui-ux-pro-max/data/` (12 arquivos + stacks/).

---

### Component 3: Scripts Migration

#### [MODIFY] [scripts/design_system.py](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/scripts/design_system.py)

Copiar de `ui-ux-pro-max/scripts/design_system.py` e ajustar paths para `../assets/ui-ux-data/`.

---

#### [MODIFY] [scripts/core.py](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/scripts/core.py)

Copiar de `ui-ux-pro-max/scripts/core.py` e ajustar paths.

---

#### [NEW] [scripts/search.py](file:///Users/mauricio/Projetos/neondash/.agent/skills/frontend-design/scripts/search.py)

Copiar de `ui-ux-pro-max/scripts/search.py` e ajustar imports.

---

### Component 4: Cleanup

#### [DELETE] [algorithmic-art/](file:///Users/mauricio/Projetos/neondash/.agent/skills/algorithmic-art/)

Remover após migração completa.

---

#### [DELETE] [canvas-design/](file:///Users/mauricio/Projetos/neondash/.agent/skills/canvas-design/)

Remover após migração completa.

---

#### [DELETE] [tailwind-patterns/](file:///Users/mauricio/Projetos/neondash/.agent/skills/tailwind-patterns/)

Remover após migração completa.

---

#### [DELETE] [ui-ux-pro-max/](file:///Users/mauricio/Projetos/neondash/.agent/skills/ui-ux-pro-max/)

Remover após migração completa.

---

## Verification Plan

### Automated Tests

**Não há testes automatizados existentes para skills.**

### Manual Verification

1. **Script functionality**

   ```bash
   # Testar generate_images.py
   python .agent/skills/frontend-design/scripts/generate_images.py "test placeholder hero" "test_output"

   # Testar design system search
   python .agent/skills/frontend-design/scripts/search.py "saas dashboard" --design-system

   # Testar UX audit
   python .agent/skills/frontend-design/scripts/ux_audit.py client/src/
   ```

2. **Skill loading**
   - Verificar que SKILL.md tem < 5k palavras
   - Verificar que description cobre todos os casos de uso
   - Verificar links para reference files

3. **Assets integrity**
   - Confirmar 81 fonts em `assets/canvas-fonts/`
   - Confirmar 2 templates em `assets/p5-templates/`
   - Confirmar 12+ CSVs em `assets/ui-ux-data/`

---

## Atomic Tasks

### AT-01: Criar estrutura de diretórios

⚡ PARALLEL-SAFE

```bash
mkdir -p .agent/skills/frontend-design/assets/{canvas-fonts,p5-templates,ui-ux-data}
```

**Validation**: `ls -la .agent/skills/frontend-design/assets/`
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/`

---

### AT-02: Migrar canvas fonts

⚡ PARALLEL-SAFE

```bash
cp -r .agent/skills/canvas-design/canvas-fonts/* .agent/skills/frontend-design/assets/canvas-fonts/
```

**Validation**: `ls .agent/skills/frontend-design/assets/canvas-fonts/ | wc -l` (deve ser 81)
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/canvas-fonts/*`

---

### AT-03: Migrar p5 templates

⚡ PARALLEL-SAFE

```bash
cp .agent/skills/algorithmic-art/templates/* .agent/skills/frontend-design/assets/p5-templates/
```

**Validation**: `ls .agent/skills/frontend-design/assets/p5-templates/`
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/p5-templates/*`

---

### AT-04: Migrar UI/UX data

⚡ PARALLEL-SAFE

```bash
cp -r .agent/skills/ui-ux-pro-max/data/* .agent/skills/frontend-design/assets/ui-ux-data/
```

**Validation**: `ls .agent/skills/frontend-design/assets/ui-ux-data/*.csv | wc -l` (deve ser ≥12)
**Rollback**: `rm -rf .agent/skills/frontend-design/assets/ui-ux-data/*`

---

### AT-05: Migrar e ajustar scripts UI/UX

Depende: AT-04

```bash
# Copiar scripts
cp .agent/skills/ui-ux-pro-max/scripts/*.py .agent/skills/frontend-design/scripts/
```

Ajustar paths nos arquivos para `../assets/ui-ux-data/`
**Validation**: `python .agent/skills/frontend-design/scripts/search.py "test" --domain style`
**Rollback**: `rm .agent/skills/frontend-design/scripts/{design_system,core,search}.py`

---

### AT-06: Criar tailwind-v4-patterns.md

⚡ PARALLEL-SAFE
Converter conteúdo de `tailwind-patterns/SKILL.md` para reference file.
**Validation**: `wc -l .agent/skills/frontend-design/tailwind-v4-patterns.md` (deve ser ~270)
**Rollback**: `rm .agent/skills/frontend-design/tailwind-v4-patterns.md`

---

### AT-07: Criar algorithmic-art-guide.md

⚡ PARALLEL-SAFE
Adaptar conteúdo de `algorithmic-art/SKILL.md` para reference file.
**Validation**: `wc -l .agent/skills/frontend-design/algorithmic-art-guide.md`
**Rollback**: `rm .agent/skills/frontend-design/algorithmic-art-guide.md`

---

### AT-08: Criar canvas-design-guide.md

⚡ PARALLEL-SAFE
Adaptar conteúdo de `canvas-design/SKILL.md` para reference file.
**Validation**: `wc -l .agent/skills/frontend-design/canvas-design-guide.md`
**Rollback**: `rm .agent/skills/frontend-design/canvas-design-guide.md`

---

### AT-09: Criar design-system-search.md

⚡ PARALLEL-SAFE
Documentar uso dos scripts de busca + CSVs.
**Validation**: `head -20 .agent/skills/frontend-design/design-system-search.md`
**Rollback**: `rm .agent/skills/frontend-design/design-system-search.md`

---

### AT-10: Reescrever SKILL.md

Depende: AT-06, AT-07, AT-08, AT-09
Criar novo SKILL.md consolidado com todas as capacidades.
**Validation**: `wc -w .agent/skills/frontend-design/SKILL.md` (deve ser < 5000 palavras)
**Rollback**: Restore from git

---

### AT-11: Testar scripts migrados

Depende: AT-05, AT-10
Executar todos os scripts para garantir funcionamento.
**Validation**: Scripts executam sem erro

---

### AT-12: Deletar skills antigas

Depende: AT-11

```bash
rm -rf .agent/skills/algorithmic-art
rm -rf .agent/skills/canvas-design
rm -rf .agent/skills/tailwind-patterns
rm -rf .agent/skills/ui-ux-pro-max
```

**Validation**: `ls .agent/skills/` não contém as 4 skills
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
