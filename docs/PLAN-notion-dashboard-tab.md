# PLAN-notion-dashboard-tab

## Goal
Integrate content from the Notion page "PLAY NEON" (ID: 2f64d8c5-8988-8187-8f52-dfee621aab1e) into the user's "Meu Dashboard" as a new tab. This will allow mentees to view their activities and track progress directly from the dashboard, leveraging Notion as the CMS.

## Research Findings
| Finding | Source | Impact |
| :--- | :--- | :--- |
| **Target Notion Page** | `2f64d8c5-8988-8187-8f52-dfee621aab1e` | Contains "PLAY NEON" content, likely structured with distinct blocks/activities. |
| **Target Dashboard** | `client/src/pages/MyDashboard.tsx` | Uses `Tabs` component. Need to add a new `TabsTrigger` and `TabsContent`. |
| **Backend Stack** | Express + tRPC | Need a new tRPC router (`notion.ts`?) to securely fetch Notion data. |
| **Frontend Stack** | React + Layouts | Need a `NotionRenderer` component to display the blocks cleanly (using `react-markdown` or similar). |

## Knowledge Gaps & Assumptions
- **Assumption:** The Notion page content is public or accessible via a configured integration token.
- **Assumption:** We want *live* or *cached* data, not a one-time copy-paste. (User said "acompanhar", implying updates).
- **Gap:** Does the project already have `notion-client` or similar installed? (Need to check package.json).

## Atomic Tasks

### Phase 1: Setup & Backend
- [ ] **AT-001** Install `notion-client` or `@notionhq/client` in `server/`.
  - *Validation:* `bun list` shows package.
- [ ] **AT-002** Create `server/src/routers/notion.ts` tRPC router.
  - *Action:* Implement `getPage` and `getBlocks` procedures.
  - *Validation:* Query tRPC playground (if avail) or mock test.
- [ ] **AT-003** Register router in `server/routers.ts`.
  - *Validation:* Server starts without errors.

### Phase 2: Frontend Integration
- [ ] **AT-004** Create `client/src/components/notion/NotionRenderer.tsx`.
  - *Action:* Component to render blocks (Text, Images, Lists).
  - *Validation:* Storybook or isolated test page.
- [ ] **AT-005** Update `client/src/pages/MyDashboard.tsx`.
  - *Action:* Add "Atividades" Tab. Use `trpc.notion.getPage.useQuery`.
  - *Validation:* Tab appears, data loads.

### Phase 3: Validation
- [ ] **AT-006** Verify content sync.
  - *Action:* Modify Notion page, refresh Dashboard, confirm update.

## Validation Plan
- **Automated:** `bun run check` (types), `bun run test` (if applicable).
- **Manual:**
    1. Open Dashboard.
    2. Click "Atividades" tab.
    3. Compare content with `https://www.notion.so/PLAY-NEON-2f64d8c5898881878f52dfee621aab1e`.
    4. Verify responsive layout on mobile.

## Rollback Strategy
- Revert changes to `MyDashboard.tsx`.
- Remove `server/routers/notion.ts`.
- Uninstall npm packages.
