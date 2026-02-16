# PLAN-atividades-mentorado-v2: Restructuring of Dashboard Activities

> **Goal:** Analyze, consolidate, and enhance the mentee dashboard activities based on the NEON persona and the biggest pain points of aesthetics professionals.

---

## 0. Research Findings

### NEON Persona (site neon.drasacha.com.br)

| Aspect | Description |
|---------|-----------|
| **Audience** | Health/aesthetics professionals (biomedical scientists, aestheticians, nurses) |
| **Duration** | 6 months of Black mentorship |
| **Deliverables** | Individual calls, financial analysis, monthly X-Ray, marketing/sales tutorials, Couch (psychologist), Tim-Tim (networking), celebration trip |
| **Investment** | R$ 20,000 upfront or 12x R$ 1,667.98 |
| **Proposition** | "They Decided to Shine Even in the Dark" - professionals ready to scale |

### Biggest Pain Points of Aesthetics Professionals

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | **Time management and disorganized schedule** - Constant flow of patients without a system | 5/5 | Graces, IdealOdonto | High |
| 2 | **Difficulty in capturing and converting leads** - Instagram/WhatsApp without strategy | 5/5 | Consentz, Agencia10x | Critical |
| 3 | **Lack of financial control** - No separation of personal and business finances, no cash flow | 5/5 | Graces, ORVI | High |
| 4 | **Incorrect pricing** - Charging too little, no profit margin | 5/5 | ORVI Health | High |
| 5 | **Absence of SOPs** - Each appointment is different, no standardization | 4/5 | IdealOdonto | Medium |
| 6 | **Weak post-care follow-up** - No follow-up, losing clients | 5/5 | Graces, Agencia10x | Critical |
| 7 | **Inefficient digital marketing** - Posts without strategy, no metrics | 5/5 | Consentz, Nuvolum | High |
| 8 | **Lack of clarity about KPIs** - Don't know what to measure | 4/5 | SEBRAE, IdealOdonto | Medium |
| 9 | **Incomplete legalization** - CNPJ, permits, health department pending | 5/5 | Conta4, ORVI | High |
| 10 | **Burnout and limiting mindset** - Overworking without balance | 4/5 | NEON site (Couch) | High |

### Analysis of Current Activities

**Current total:** 24 activities in `client/src/data/atividades-data.ts`

#### Identified Redundancies

| Activity 1 | Activity 2 | Problem |
|-------------|-------------|----------|
| `m1-juridico` | `primordial-checklist` | Both cover legal documentation/CNPJ |
| `m1-diagnostico` | `atividade-04` | Both map current vs. desired situation |
| `m1-financeiro` | `atividade-11` | Both deal with spreadsheets/cash flow |
| `m2-kpis` | `estrategia-analise` | Both focus on metrics and monthly analysis |
| `atividade-01` | `estrategia-conteudo` | Instagram + content separated unnecessarily |

#### Critical Gaps (Missing Activities)

| Gap | Why it's critical | Proposal |
|--------|-------------------|----------|
| **WhatsApp Business** | Main sales channel, only mentioned superficially | Complete new activity |
| **Patient Journey** | Pre/during/post care experience not covered | New activity |
| **Paid Traffic** | Mentioned as "optional", but essential in 2024+ | New fundamentals activity |
| **Mental Health** | NEON has "Couch" but dashboard doesn't cover burnout | New activity |

---

## 1. User Review Required

> [!IMPORTANT]
> **Critical decision on phase structure:**
> The proposal reorganizes the 24 activities into 6 sequential PHASES instead of the current disconnected "Modules". This changes the mentee's logical progression.

> [!WARNING]
> **Database impact:**
> If mentees already have saved progress with old codes (`m1-juridico`, etc.), we will need migration to new codes or a compatibility mapping.

> [!CAUTION]
> **Detailed step content:**
> Each step will have an expanded description with step-by-step instructions. This significantly increases the size of the `atividades-data.ts` file. Please confirm if this is desired.

### Validation Questions

1. **Keep old codes or create new ones?** (E.g.: `m1-juridico` -> `f1-legalizacao`)
2. **Add a `ferramentas: string[]` field to activities?**
3. **Add a `metricaSucesso: string` field to each activity?**
4. **Is the order of the 6 phases correct for the NEON journey?**

---

## 2. Proposed Changes

### New Structure: 6 Phases + 25 Activities

---

#### PHASE 1: FOUNDATIONS (Weeks 1-4)

##### [MODIFY] `atividades-data.ts` - Consolidate Legalization

**Before:** `m1-juridico` (5 steps) + `primordial-checklist` (14 steps) = 19 redundant steps

**After:** "Complete Business Legalization" (12 optimized steps)

**File:** [atividades-data.ts](file:///home/mauricio/neondash/client/src/data/atividades-data.ts)

---

#### PHASE 3: DIGITAL MARKETING (Weeks 9-12)

##### [NEW] Professional Instagram

Completely new activity consolidating Instagram + Content + Audience:

**11 comprehensive steps:**
1. Convert to a professional account
2. Optimize bio using the AIDA method
3. Define 3-5 content pillars
4. Create a 30-day editorial calendar
5. Prepare a batch of 10 content pieces
6. Set up scheduling tools
7. Implement daily stories routine
8. Create first Reel with strong hook
9. Set up organized highlights
10. Establish engagement routine (30min/day)
11. Track metrics weekly

##### [NEW] Paid Traffic Fundamentals

**6 steps:**
1. Create Facebook Business Manager
2. Set up Meta Pixel
3. Define initial target audience
4. Create first engagement campaign
5. Analyze results and adjust
6. Scale to leads/messages campaign

---

#### PHASE 4: SALES AND CUSTOMER SERVICE (Weeks 13-16)

##### [NEW] Strategic WhatsApp Business

**8 steps:**
1. Migrate to WhatsApp Business
2. Set up complete business profile
3. Create service catalog
4. Set up automatic greeting message
5. Set up away message
6. Create organization labels
7. Prepare quick reply templates
8. Define response rule (maximum 1 business hour)

##### [NEW] WOW Patient Journey

**9 steps:**
1. Map current journey (as-is)
2. Create first contact script
3. Implement 24h-before confirmation
4. Send pre-procedure instructions
5. Create 'WOW moment' during appointment
6. 24h post-procedure follow-up
7. 7-day post follow-up
8. Implement 60-90 day reactivation
9. Create referral program

---

#### PHASE 6: MINDSET AND ROUTINES (Ongoing)

##### [NEW] Entrepreneur Mental Health

**7 steps:**
1. Recognize signs of burnout
2. Define work hours and respect them
3. Create a daily disconnection ritual
4. Establish 1 sacred day off
5. Build a support network
6. Practice regular physical exercise
7. Implement strategic breaks throughout the day

---

## 3. Atomic Implementation Tasks

### AT-001: Update TypeScript Interfaces

**Goal:** Add optional `descricao` field to steps
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Add `descricao?: string` to the `AtividadeStep` interface
  - **File:** `client/src/data/atividades-data.ts`
  - **Validation:** `bun run check` passes without errors

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-002: Consolidate Redundant Activities ⚡

**Goal:** Reduce 6 pairs of redundant activities
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Consolidate legal activities -> `f1-legalizacao`
- [ ] ST-002.2: Consolidate diagnostic activities -> `f1-diagnostico`
- [ ] ST-002.3: Consolidate financial activities -> `f1-financas`
- [ ] ST-002.4: Consolidate KPI activities -> `f5-dashboard`
- [ ] ST-002.5: Consolidate Instagram activities -> `f3-instagram`
- [ ] ST-002.6: Consolidate positioning activities -> `f2-posicionamento`

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-003: Add Critical New Activities ⚡

**Goal:** Add 4 activities that fill gaps
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-003.1: Add "Strategic WhatsApp Business" (`f4-whatsapp`)
- [ ] ST-003.2: Add "WOW Patient Journey" (`f4-jornada`)
- [ ] ST-003.3: Add "Paid Traffic Fundamentals" (`f3-trafego`)
- [ ] ST-003.4: Add "Entrepreneur Mental Health" (`f6-saude-mental`)

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-004: Update Stages to 6 Phases

**Goal:** Rename stages from "Module X" to "Phase X: Name"
**Dependencies:** AT-002, AT-003

#### Subtasks:
- [ ] ST-004.1: Update `etapa` field of all activities
- [ ] ST-004.2: Update `getEtapaColor()` function with new colors

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-005: Expand Step Descriptions

**Goal:** Add detailed `descricao` to steps
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-005.1: Phase 1 descriptions
- [ ] ST-005.2: Phase 2 descriptions
- [ ] ST-005.3: Phase 3-6 descriptions

**Rollback:** `git checkout client/src/data/atividades-data.ts`

---

### AT-006: Update UI to Display Descriptions

**Goal:** Show step descriptions in the component
**Dependencies:** AT-005

#### Subtasks:
- [ ] ST-006.1: Add tooltip or expandable section with description
  - **File:** `client/src/components/dashboard/AtividadesContent.tsx`
- [ ] ST-006.2: Test responsiveness

**Rollback:** `git checkout client/src/components/dashboard/AtividadesContent.tsx`

---

### AT-007: Progress Migration (if needed)

**Goal:** Map old codes to new ones
**Dependencies:** AT-002, AT-003, AT-004

#### Subtasks:
- [ ] ST-007.1: Create migration script
- [ ] ST-007.2: Validate existing progress

**Rollback:** Restore from backup

---

## 4. Verification Plan

### Automated Tests
```bash
bun run check     # TypeScript validation
bun run lint      # Linting
bun test          # Unit tests
```

### Manual Verification
- [ ] Navigate to /dashboard/atividades
- [ ] Verify 6 phases are visible
- [ ] Verify new activities
- [ ] Expand a step and verify its description
- [ ] Mark a step and verify persistence

---

## 5. Rollback Plan

```bash
git checkout client/src/data/atividades-data.ts
git checkout client/src/components/dashboard/AtividadesContent.tsx
```

---

## Changes Summary

| Before | After |
|-------|--------|
| 24 activities | 25 activities (more focused) |
| Disconnected modules | 6 sequential phases |
| 6 redundant pairs | Consolidated |
| 4 critical gaps | 4 new activities |
| Generic steps | Steps with step-by-step descriptions |

---

## Next Steps

1. **Review this plan** and answer the validation questions
2. **Execute** `/implement` to apply the changes
3. **Test** the new experience in the dashboard
