# CODE

## Stack

- SvelteKit app with client-persisted state (`localStorage` via runed `PersistedState`)
- Tailwind v4 + shadcn-svelte UI primitives + PaneForge resizable panels
- AI SDK v6 (`ai`) with OpenRouter/Anthropic/OpenAI/Google model support
- Valibot schemas at the agent tool boundary (`@ai-sdk/valibot`)

## Domain Model

- `Message`, `Actionable`, `OutgoingMessage`, and `DailyBriefing` live in `src/lib/types.ts`
- IDs are string templates: `m${number}`, `a${number}`, `o${number}`
- Canonical relation is `OutgoingMessage.parentActionableId` (derived actionable reply links come from outgoing records)

## State and Data

- `src/lib/stores/workspace.svelte.ts` is the source of truth for messages, actionables, outgoing messages, and briefing
- Store supports read/update operations, read/unread toggles, outgoing send/update behavior, reset/clear, and snapshot import/export
- `src/lib/stores/dev-store.svelte.ts` persists provider/model/API key for local dev AI runs
- `src/lib/data/ingest.ts` imports raw message dumps into `Message[]` without summaries
- `src/lib/data/workspace-snapshot.ts` validates full workspace snapshot save/load with cross-reference checks
- Mock defaults exist for all workspace entities under `src/lib/data/mock-*.ts`

## Agent Runtime

- `src/lib/stores/agent-chat.svelte.ts` runs both interactive chat and the main loop flow
- Main loop behavior: summarize unsummarized messages using the provider's `cheap` model, preload workspace context, then run tool loop processing
- `src/lib/ai/model-factory.ts` centralizes provider/model creation
- `src/lib/components/AgentDevConsole.svelte` shows model/tool logs (toggle with `~`)

## Agent Tools

- Tools are defined in `src/lib/agent/workspace-tools.ts`; execution semantics in `src/lib/agent/workspace-ops.ts`
- Read tools are split into list vs single-item (`get_messages` + `get_message`, etc.)
- List reads support pagination (`limit`, `offset`) and return `{ items, total, limit, offset }`
- Write tools follow explicit insert/update contracts: `insert_*`, `update_*`, plus `update_briefing`
- `update_outgoing_message` only allows drafts; sent outgoing messages are immutable

## UI and Routing

- `src/routes/+layout.svelte` provides the two-pane shell with accordion left nav and resizable split view
- `/` and section index routes show a combined default detail: daily briefing + agent chat
- Message/actionable/draft/sent detail routes are path-based (`/inbox/[id]`, `/decide/[id]`, `/drafts/[id]`, `/sent/[id]`)
- `src/lib/components/ActionableDetail.svelte` is a two-pane actionable detail with draft editing and related timeline
- `src/lib/components/OutgoingDraftEditor.svelte` is reused by actionable and draft detail flows
- `src/lib/components/DevPanel.svelte` handles AI config, JSON import, workspace snapshot load/save, reset, and clear
