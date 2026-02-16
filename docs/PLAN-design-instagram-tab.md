# PLAN-design-instagram-tab: Instagram Analytics Tab

> **Goal:** Add an "Instagram" tab to the individual mentee dashboard for login and detailed metrics analysis.

## Research Findings

| # | Finding | Confidence | Source |
|---|---------|------------|--------|
| 1 | Dashboard uses `NeonTabs` for tabs with values: visao-geral, diagnostico, evolucao, atividades | High | `MyDashboard.tsx` |
| 2 | `InstagramConnectionCard` already exists for login via Facebook SDK | High | `components/instagram/` |
| 3 | `targetMentoradoId` available to pass to the component | High | `MyDashboard.tsx:62` |
| 4 | Schema has `instagramSyncLog` with posts/stories data per month | High | `schema.ts` |
| 5 | GPUS theme uses Gold/Navy as main colors | High | GPUS theme |

## Design Specs

### Hierarchy
- **Primary:** Instagram connection card (login/status)
- **Secondary:** Metrics (posts, stories, engagement)
- **Tertiary:** Synchronization history

### Colors (60-30-10)
- **60% Background:** `bg-card` / Navy dark
- **30% Foreground:** Text/borders
- **10% Accent:** Instagram gradient (purple->pink) for CTAs

### Typography
- **Heading:** `text-xl font-semibold`
- **Subheading:** `text-sm text-muted-foreground`
- **Metrics:** `text-4xl font-bold`

## UI Layout

```
+------------------------------------------------------------+
| [Tab: Instagram]                                           |
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+ |
|  | InstagramConnectionCard                               | |
|  | - Connect/Disconnect                                  | |
|  | - Account status                                      | |
|  | - Last sync                                           | |
|  +------------------------------------------------------+ |
|                                                            |
|  +-----------------+  +-----------------+  +------------+  |
|  |   Posts Feed    |  |    Stories      |  | Engagement |  |
|  |     XX          |  |      XX         |  |   X.XX%    |  |
|  |   this month    |  |   this month    |  |  average   |  |
|  +-----------------+  +-----------------+  +------------+  |
|                                                            |
|  +------------------------------------------------------+  |
|  | Metrics History (last 6 months)                       |  |
|  | [Chart: Posts + Stories over time]                    |  |
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

## Atomic Tasks

### AT-001: Create InstagramAnalyticsView component
- [x] ST-001.1: Create `InstagramAnalyticsView.tsx` -> File: `components/dashboard/InstagramAnalyticsView.tsx`
- [x] ST-001.2: Import `InstagramConnectionCard`
- [x] ST-001.3: Add metric cards (posts, stories, engagement)
- [x] ST-001.4: Add historical chart with Recharts

### AT-002: Add Instagram tab to MyDashboard
- [x] ST-002.1: Add `NeonTabsTrigger` for "Instagram"
- [x] ST-002.2: Add `NeonTabsContent` with `InstagramAnalyticsView`
- [x] ST-002.3: Pass `mentoradoId` to the component

### AT-003: Backend - Query for Instagram metrics
- [x] ST-003.1: Add `getMetricsHistory` to `instagramRouter`
- [x] ST-003.2: Query last 6 months of `instagram_sync_log`

## Validation
- [x] `bun run check` passes
- [x] `bun run lint` passes
- [ ] Tab appears on the dashboard
- [ ] Connection works (after configuring Facebook Dev Console)
