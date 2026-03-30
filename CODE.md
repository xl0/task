# CODE

## Stack

- SvelteKit (SSR default, SPA mode planned)
- Tailwind v4 + shadcn-svelte (mira style, neutral base, OKLCH colors, `--radius: 0`)
- Lucide icons via `@lucide/svelte`
- Inter Variable font
- runed `PersistedState` for localStorage persistence
- Dev AI config persisted locally (`provider`, `model`, `apiKey`)
- AI SDK v6 (`ai`) + providers (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`)
- Valibot tool schemas via `@ai-sdk/valibot`

## Structure

### Data & Types

- `src/lib/types.ts` — Core types: `Message`, `Actionable`, `OutgoingMessage`, `DailyBriefing`, `Channel`, `MailboxView`. IDs use template literals: `MessageId = m${number}`, `ActionableId = a${number}`, `OutgoingMessageId = o${number}`.
- `src/lib/stores/workspace.svelte.ts` — Class-based persistence/store layer with `PersistedState` fields for messages, actionables, outgoingMessages, briefing. Defaults to mock data. Methods focus on store access and core UI mutations (read/lookups, mark read/unread, update/send outgoing, reset/clear) plus bulk setters used by agent operations. Messages are normalized/sorted by numeric message id.
- `src/lib/stores/dev-store.svelte.ts` — Persisted dev/runtime config store for LLM provider selection. Exposes provider list (`openrouter`, `anthropic`, `openai`, `google`), per-provider model lists, and persisted `apiKey`.
- `src/lib/stores/agent-chat.svelte.ts` — Class-based chat state (`$state`) for agent testing: message list, loading state, conversation history, console visibility, and structured logs for LLM/tool events. Log details are snapshot/JSON-serialized to avoid proxy clone errors.
- `src/lib/data/mock-messages.ts` — 20 hand-written `Message[]` literals with summaries, derived from `docs/Messages JSON.json`.
- `src/lib/data/mock-actionables.ts` — 12 `Actionable[]` mock items covering decide/delegate/ignore with priorities and linked outgoing message IDs.
- `src/lib/data/mock-outgoing-messages.ts` — 7 `OutgoingMessage[]` mocks: drafts for `decide` actionables and sent messages for `delegate` actionables.
- `src/lib/data/mock-daily-briefing.ts` — Mock `DailyBriefing` with a single markdown body used in inbox default detail.
- `src/lib/data/ingest.ts` — `parseRawMessages()` converts raw JSON dumps (the `docs/Messages JSON.json` format) into `Message[]`.

### Agent Tools

Implemented in `src/lib/agent/workspace-tools.ts` using `ai` `tool()` + `@ai-sdk/valibot` `valibotSchema()`.

Design: list and single-item reads are split into separate tools to avoid ambiguous optional-id calls.

- `get_messages({ limit?: number, offset?: number })` — List/paginate messages with defaults `limit=100`, `offset=0`, returning `{ items, total, limit, offset }`.
- `get_message({ id: MessageId })` — Return one message as `{ item }`.
- `get_actionables({ limit?: number, offset?: number })` — List/paginate actionables with defaults `limit=100`, `offset=0`, returning `{ items, total, limit, offset }`.
- `get_actionable({ id: ActionableId })` — Return one actionable as `{ item }`.
- `get_outgoing_messages({ limit?: number, offset?: number })` — List/paginate outgoing messages with defaults `limit=100`, `offset=0`, returning `{ items, total, limit, offset }`.
- `get_outgoing_message({ id: OutgoingMessageId })` — Return one outgoing message as `{ item }`.
- `get_briefing()` — Return current briefing (or `null`).
- `insert_message({ channel, senderName, receivedAt, text, subject?, channelName?, summary?, read? })` — Insert a new message and return `{ id }`.
- `update_message({ id: MessageId, summary?, read? })` — Update message summary/read status only.
- `insert_actionable({ ...requiredFields })` — Insert a new actionable and return `{ id }`.
- `update_actionable({ id: ActionableId, ...optionalFields })` — Update only provided fields for an existing actionable.
- `insert_outgoing_message({ ...requiredAndOptionalFields })` — Insert a new outgoing message and return `{ id }`; `createdAt` is set automatically.
- `update_outgoing_message({ id: OutgoingMessageId, ...optionalFields })` — Update draft outgoing messages only (sent messages are immutable); timestamp is managed automatically.
- `update_briefing({ markdown })` — Update briefing markdown only; `generatedAt` is set automatically.
- Agent workspace logic is in `src/lib/agent/workspace-ops.ts` (pagination + insert/update semantics), keeping `workspace` store focused on persistence/state access.
- Chat harness executes these tools from the client via `generateText()` in `src/lib/stores/agent-chat.svelte.ts`.
- `get_*` tool outputs are converted to plain JSON-safe objects before returning to the model runtime.
- Tool handlers wrap failures with explicit tool-name-prefixed errors; insert/update ops validate missing fields, missing update payloads, and invalid cross-entity references with clear messages.

### Routing

Path-based navigation. `/` opens the same default detail as inbox (briefing + agent chat).

- `src/routes/+layout.svelte` — Two-pane shell: left nav with data-driven accordion sections (`navSections` array), right detail pane. Resizable via PaneForge with `autoSaveId` for persisted sizing. Clicking open section toggles it closed (navigates to `/`).
- `src/routes/inbox/+page.svelte` — Shows a combined default detail (daily briefing on top + workspace agent chat below) when no inbox message is selected. All other section default pages (drafts, sent, decide, delegate, ignore) use the same combined detail.
- `src/routes/inbox/[id]/+page.svelte` — Message detail. Auto-marks read via `$effect` + `untrack`.
- `src/routes/decide/[id]/+page.svelte` (+ delegate, ignore) — Actionable detail via shared `ActionableDetail.svelte`
- `src/routes/drafts/[id]/+page.svelte` — Draft detail/editor view
- `src/routes/sent/[id]/+page.svelte` — Sent message read-only detail view

### Components

- `src/lib/components/DevPanel.svelte` — Sheet-based dev tool: AI config (provider/model/API key) plus file import (raw JSON → messages), add N/all, reset workspace (restore mock data), clear workspace, shows counts.
- `src/lib/components/BriefingAndChatDetail.svelte` — Default right-pane stacked view: briefing first, separator, then agent chat in a single shared scroll container.
- `src/lib/components/AgentChatDetail.svelte` — Main right-pane chat interface for agent testing, with single-thread messages and a "New chat" reset button.
- `src/lib/components/AgentDevConsole.svelte` — Quake-style top console (toggle with `~`) showing structured agent logs; entry details are collapsed by default.
- `src/lib/components/ActionableDetail.svelte` — Two-pane actionable view: left pane shows title/priority/summary + draft editor(s) with Send button, right pane shows unified timeline of related incoming messages (accordion) and outgoing replies (always visible, read-only, indented under parent). Keyboard nav (arrow keys) for message accordion. Resizable via PaneForge with persisted sizing.
- `src/lib/components/OutgoingMessageDetail.svelte` — Shared outgoing message detail used by drafts (editable recipient/subject/body) and sent (read-only), with actionable/message context links.
- `src/lib/components/DailyBriefDetail.svelte` — Daily brief renderer using unified (`remark-parse`/`remark-gfm`/`remark-rehype`/`rehype-stringify`) for markdown briefing content only.
- `src/routes/SidebarListPane.svelte` — Scrollable list component for sidebar accordion content.
- `src/lib/components/ui/` — shadcn: button, badge, input, label, resizable, scroll-area, select, separator, sheet.

## UI Layout

Two-pane inbox-style layout:

1. **Left pane** (~36%, persisted): "Innate" header + data-driven accordion nav sections unfold to reveal scrollable lists (messages, drafts, sent, or actionables). Only the open section flex-grows.
2. **Right pane** (~64%): Default shows daily briefing followed by workspace agent chat in one scroll flow; otherwise message body, actionable detail (split into summary + related messages timeline), draft editor, or sent message detail.

Dev panel trigger is a floating button in the top-right corner of the app shell.
Agent dev console folds from top (`~`) and logs LLM/tool events with expandable details.

All panes resizable with persisted sizes via PaneForge `autoSaveId`.
