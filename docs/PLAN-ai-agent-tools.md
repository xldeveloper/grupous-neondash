# PLAN-ai-agent-tools: AI Agent with Database Access & Tool Calling

> **Goal:** Implement an intelligent AI agent using Vercel AI SDK that can access mentee data (metrics, CRM, agenda, notes) and interact via tool calling with Gemini Flash model.

## 0. Research Findings

| # | Finding | Confidence | Source | Impact |
|---|---------|------------|--------|--------|
| 1 | Vercel AI SDK supports `@ai-sdk/google` provider with native Gemini models | 5/5 | Context7 ai-sdk.dev docs | Core dependency choice |
| 2 | Tool calling uses `tool()` function with Zod schemas for input validation | 5/5 | Context7 ai-sdk.dev docs | Tool implementation pattern |
| 3 | Existing `openclawService.ts` has WebSocket session management for chat | 5/5 | Codebase analysis | Can reuse session infra |
| 4 | Current LLM uses custom OpenAI-compatible wrapper targeting Gemini 3 Flash | 5/5 | `_core/llm.ts` analysis | Migration path |
| 5 | Database schema has all needed tables: `metricasMensais`, `leads`, `feedbacks`, `tasks`, `diagnosticos`, `googleTokens` | 5/5 | `drizzle/schema.ts` | Full data access available |
| 6 | `ToolLoopAgent` enables autonomous multi-step tool execution | 4/5 | Context7 ai-sdk.dev | Agent architecture |
| 7 | Streaming via `streamText` provides real-time response UX | 5/5 | Context7 ai-sdk.dev | UX improvement |

### Knowledge Gaps & Assumptions

- **Gap:** Exact Gemini model name in AI SDK (`gemini-2.5-flash` vs `gemini-3-flash-preview`)
- **Gap:** Whether existing chat widget supports streaming responses
- **Assumption:** `@ai-sdk/google` works with API key auth (not just OAuth)
- **Assumption:** tRPC can handle streaming responses via subscriptions
- **Assumption:** Google Calendar integration via `googleTokens` table is working

### Edge Cases

1. User without mentee profile -> Return helpful message, no tools available
2. Empty metrics -> Return "no data yet" response
3. No Google Calendar connected -> Skip calendar tools gracefully
4. Rate limiting on Gemini API -> Implement retry with backoff
5. Context window overflow -> Trim conversation history intelligently
6. Concurrent requests -> Session-based state management
7. Tool execution failure -> Graceful degradation with error message
8. Network timeout -> Retry logic with user feedback

---

## 1. User Review Required

> [!IMPORTANT]
> **Decision Required: AI SDK Choice**
>
> The plan recommends **Vercel AI SDK** over continuing OpenClaw Gateway because:
> - No external process dependency (MoltBot gateway)
> - Native Google Gemini provider support
> - Clean tool calling abstraction
> - Active maintenance and community
>
> **Alternative:** Continue with OpenClaw + MoltBot if external gateway is preferred for SDR subagents.

> [!WARNING]
> **Breaking Change: LLM Wrapper Replacement**
>
> The new implementation will replace `invokeLLM()` from `_core/llm.ts` with Vercel AI SDK.
> The old wrapper will be kept as fallback but marked as deprecated.

> [!CAUTION]
> **Environment Variables Required**
>
> ```env
> GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
> ```
> This replaces the current `LLM_API_KEY` and `LLM_API_URL` approach.

---

## 2. Proposed Changes

### Dependencies Component

#### [MODIFY] [package.json](file:///home/mauricio/neondash/package.json)
- **Add:** `ai` (Vercel AI SDK core)
- **Add:** `@ai-sdk/google` (Google Gemini provider)
- **Version:** Latest stable (ai@^4.0.0, @ai-sdk/google@^1.0.0)

---

### AI Agent Service Component

#### [NEW] [aiAssistantService.ts](file:///home/mauricio/neondash/server/services/aiAssistantService.ts)
- Core AI agent service using Vercel AI SDK
- Tool definitions for database access
- Streaming response handling
- Context building from mentee data

**Tools to implement:**

| Tool | Description | Schema |
|------|-------------|--------|
| `getMyMetrics` | Get metrics for last N months | `{ months?: number }` |
| `getMyLeads` | Get CRM leads with filters | `{ status?: string, limit?: number }` |
| `searchLeads` | Search leads by name/email | `{ query: string }` |
| `getLatestFeedback` | Get most recent mentor feedback | `{}` |
| `getMyTasks` | Get pending tasks | `{ status?: string }` |
| `getMyGoals` | Get current goals | `{}` |
| `getMyAgenda` | Get calendar events | `{ days?: number }` |
| `getDiagnostico` | Get onboarding diagnostic | `{}` |
| `searchWeb` | Search the internet | `{ query: string }` |

---

### AI Router Component

#### [MODIFY] [openclawRouter.ts](file:///home/mauricio/neondash/server/openclawRouter.ts)
- Update `createWebchatSession` to use new AI service
- Update `sendMessage` to use streaming AI responses
- Add new procedure for streaming responses

**OR alternatively:**

#### [NEW] [aiAssistantRouter.ts](file:///home/mauricio/neondash/server/aiAssistantRouter.ts)
- New dedicated router for AI assistant
- Clean separation from OpenClaw WebSocket logic
- Uses new `aiAssistantService`

---

### LLM Provider Component

#### [NEW] [aiProvider.ts](file:///home/mauricio/neondash/server/_core/aiProvider.ts)
- Initialize Vercel AI SDK Google provider
- Configure model settings (temperature, max tokens)
- Export provider instance for services

---

### Environment Config Component

#### [MODIFY] [env.ts](file:///home/mauricio/neondash/server/_core/env.ts)
- Add `GOOGLE_GENERATIVE_AI_API_KEY` to environment validation
- Keep backwards compatibility with existing keys

---

### OpenClaw Service Update

#### [MODIFY] [openclawService.ts](file:///home/mauricio/neondash/server/services/openclawService.ts)
- Update `generateMockResponse` to use new AI service
- Remove direct LLM invocation
- Import and use `aiAssistantService`

---

## 3. Atomic Implementation Tasks

> [!CAUTION]
> Each task MUST have subtasks. No single-line tasks allowed.

### AT-001: Add Vercel AI SDK Dependencies
**Goal:** Install and configure Vercel AI SDK packages
**Dependencies:** None

#### Subtasks:
- [ ] ST-001.1: Add `ai` and `@ai-sdk/google` to package.json
  - **File:** `package.json`
  - **Validation:** `bun install` succeeds
- [ ] ST-001.2: Verify packages are installed correctly
  - **Command:** `bun run check`
  - **Validation:** No import errors

**Rollback:** `git checkout package.json && bun install`

---

### AT-002: Create AI Provider Configuration
**Goal:** Set up Google Gemini provider with Vercel AI SDK
**Dependencies:** AT-001

#### Subtasks:
- [ ] ST-002.1: Create `server/_core/aiProvider.ts`
  - **File:** `server/_core/aiProvider.ts`
  - **Validation:** File exports `google` provider instance
- [ ] ST-002.2: Update `server/_core/env.ts` with new env var
  - **File:** `server/_core/env.ts`
  - **Validation:** TypeScript compiles
- [ ] ST-002.3: Add `GOOGLE_GENERATIVE_AI_API_KEY` to `.env.example`
  - **File:** `.env.example`
  - **Validation:** File contains new variable

**Rollback:** Delete new files, revert env.ts

---

### AT-003: Create AI Assistant Service with Tools
**Goal:** Implement core AI service with database access tools
**Dependencies:** AT-002

#### Subtasks:
- [ ] ST-003.1: Create `server/services/aiAssistantService.ts` with basic structure
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** TypeScript compiles
- [ ] ST-003.2: Implement `getMyMetrics` tool
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tool queries `metricasMensais` table
- [ ] ST-003.3: Implement `getMyLeads` and `searchLeads` tools
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tools query `leads` table
- [ ] ST-003.4: Implement `getLatestFeedback` tool
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tool queries `feedbacks` table
- [ ] ST-003.5: Implement `getMyTasks` tool
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tool queries `tasks` table
- [ ] ST-003.6: Implement `getMyGoals` tool
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tool returns mentee meta fields
- [ ] ST-003.7: Implement `getDiagnostico` tool
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tool queries `diagnosticos` table
- [ ] ST-003.8: Implement `searchWeb` tool with Tavily
  - **File:** `server/services/aiAssistantService.ts`
  - **Validation:** Tool makes external search request

**Rollback:** Delete `aiAssistantService.ts`

---

### AT-004: Create AI Assistant Router
**Goal:** Expose AI service via tRPC endpoints
**Dependencies:** AT-003

#### Subtasks:
- [ ] ST-004.1: Create `server/aiAssistantRouter.ts` with chat procedure
  - **File:** `server/aiAssistantRouter.ts`
  - **Validation:** TypeScript compiles
- [ ] ST-004.2: Add streaming response procedure
  - **File:** `server/aiAssistantRouter.ts`
  - **Validation:** Streaming works with test client
- [ ] ST-004.3: Register router in `server/routers.ts`
  - **File:** `server/routers.ts`
  - **Validation:** Router accessible via tRPC client

**Rollback:** Remove router from routers.ts, delete file

---

### AT-005: Update OpenClaw Service to Use New AI
**Goal:** Migrate existing chat to use new AI service
**Dependencies:** AT-004

#### Subtasks:
- [ ] ST-005.1: Update `generateMockResponse` in `openclawService.ts`
  - **File:** `server/services/openclawService.ts`
  - **Validation:** Chat uses new AI service
- [ ] ST-005.2: Add fallback to old LLM if new fails
  - **File:** `server/services/openclawService.ts`
  - **Validation:** Error handling works
- [ ] ST-005.3: Update context retrieval from `getOpenClawContext`
  - **File:** `server/openclawRouter.ts`
  - **Validation:** Context passed to AI correctly

**Rollback:** Revert both files to previous version

---

### AT-006: Frontend Chat Integration
**Goal:** Update chat widget to use new streaming AI
**Dependencies:** AT-005

#### Subtasks:
- [ ] ST-006.1: Update chat hook to handle streaming responses
  - **File:** `client/src/hooks/use-ai-chat.ts` (or similar)
  - **Validation:** Messages stream in real-time
- [ ] ST-006.2: Add tool usage indicators in UI
  - **File:** `client/src/components/AIChatWidget.tsx` (or similar)
  - **Validation:** User sees when tools are being used
- [ ] ST-006.3: Test full chat flow with tools
  - **Validation:** User can ask about metrics, leads, etc.

**Rollback:** Revert frontend components

---

## 4. Verification Plan

### Automated Tests

```bash
# TypeScript compilation
bun run check

# Linting
bun run lint:check

# Unit tests (if any exist)
bun test
```

### Manual Verification

1. **Environment Setup Test:**
   - Add `GOOGLE_GENERATIVE_AI_API_KEY` to `.env`
   - Run `bun dev`
   - Verify server starts without errors

2. **Chat with Tools Test:**
   - Open dashboard at `http://localhost:3000`
   - Login as test user
   - Open AI chat widget
   - Ask: "What are my metrics for the last 3 months?"
   - Verify: AI uses `getMyMetrics` tool and returns data
   - Ask: "How many leads do I have with status new?"
   - Verify: AI uses `getMyLeads` tool correctly

3. **Error Handling Test:**
   - Temporarily invalidate API key
   - Send message in chat
   - Verify: Graceful error message, no crash

4. **Streaming Test (if implemented):**
   - Send long question
   - Verify: Response streams in real-time

### Browser Testing (via agent-browser)

```bash
# Verify chat widget renders
agent-browser open http://localhost:3000/dashboard
agent-browser snapshot -i --json
agent-browser click @[chat-widget-fab]
agent-browser fill @[chat-input] "What was my revenue last month?"
agent-browser click @[send-button]
agent-browser get text @[chat-messages]
agent-browser screenshot /tmp/ai-chat-test.png
agent-browser close
```

---

## 5. Rollback Plan

```bash
# Revert to previous state
git stash  # or git checkout .

# If packages were added
rm -rf node_modules
bun install

# If migrations were run (none in this plan)
# No schema changes in this plan
```

**Feature Flag Option:**
Add to `.env`:
```env
USE_NEW_AI_SERVICE=false
```
Then check in code before using new service.

---

## 6. Future Phases (Out of Scope)

### Phase 2: SDR Subagents
- Per-mentee AI SDR agents
- WhatsApp integration via Z-API
- Custom prompts per mentee
- Lead qualification workflows

### Phase 3: Voice & Multi-modal
- Voice input/output
- Image analysis for procedures
- Document understanding

---

## 7. Technical Notes

### Model Selection

```typescript
// Use gemini-2.5-flash for best performance/cost
const model = google('gemini-2.5-flash');

// Alternative for complex reasoning
const model = google('gemini-2.5-pro');
```

### Tool Pattern Example

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const getMyMetrics = tool({
  description: 'Get monthly metrics for the mentee',
  inputSchema: z.object({
    months: z.number().optional().default(6),
  }),
  execute: async ({ months }, { ctx }) => {
    const db = getDb();
    const metrics = await db
      .select()
      .from(metricasMensais)
      .where(eq(metricasMensais.mentoradoId, ctx.mentorado.id))
      .limit(months);
    return metrics;
  },
});
```

### System Prompt Template

```typescript
const SYSTEM_PROMPT = `You are the NEON Assistant, an AI assistant for business mentorship.

You have access to the following tools:
- getMyMetrics: View monthly metrics (revenue, leads, procedures)
- getMyLeads: View CRM leads
- searchLeads: Search leads by name/email
- getLatestFeedback: View mentor feedback
- getMyTasks: View pending tasks
- getMyGoals: View current goals
- getMyAgenda: View calendar events
- getDiagnostico: View onboarding diagnostic
- searchWeb: Search the internet

Be objective and provide actionable insights. Always respond in Brazilian Portuguese.`;
```
