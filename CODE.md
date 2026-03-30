# CODE

## Stack

- SvelteKit (SSR default, SPA mode planned)
- Tailwind v4 + shadcn-svelte (mira style, neutral base, OKLCH colors, `--radius: 0`)
- Lucide icons via `@lucide/svelte`
- Inter Variable font
- runed `PersistedState` for localStorage persistence
- Dev AI config persisted locally (`provider`, `model`, `apiKey`)

## Structure

### Data & Types

- `src/lib/types.ts` — Core types: `Message`, `Actionable`, `OutgoingMessage`, `DailyBriefing`, `Channel`, `MailboxView`. IDs use template literals: `MessageId = m${number}`, `ActionableId = a${number}`, `OutgoingMessageId = o${number}`.
- `src/lib/stores/workspace.svelte.ts` — Class-based persistence/store layer with `PersistedState` fields for messages, actionables, outgoingMessages, briefing. Defaults to mock data. Methods focus on store access and core UI mutations (read/lookups, mark read/unread, update/send outgoing, reset/clear) plus bulk setters used by agent operations.
- `src/lib/stores/dev-store.svelte.ts` — Persisted dev/runtime config store for LLM provider selection. Exposes provider list (`openrouter`, `anthropic`, `openai`, `google`), per-provider model lists, and persisted `apiKey`.
- `src/lib/data/mock-messages.ts` — 20 hand-written `Message[]` literals with summaries, derived from `docs/Messages JSON.json`.
- `src/lib/data/mock-actionables.ts` — 12 `Actionable[]` mock items covering decide/delegate/ignore with priorities and linked outgoing message IDs.
- `src/lib/data/mock-outgoing-messages.ts` — 7 `OutgoingMessage[]` mocks: drafts for `decide` actionables and sent messages for `delegate` actionables.
- `src/lib/data/mock-daily-briefing.ts` — Mock `DailyBriefing` with a single markdown body used in inbox default detail.
- `src/lib/data/ingest.ts` — `parseRawMessages()` converts raw JSON dumps (the `docs/Messages JSON.json` format) into `Message[]`.

### Agent Tools

Implemented in `src/lib/agent/workspace-tools.ts` using `ai` `tool()` + `@ai-sdk/valibot` `valibotSchema()`.

Design: keep `get_*` tools low-friction with minimal filters, and use only `upsert_*` mutations (create when no `id`, partial update when `id` exists).

- `get_messages({ id?: MessageId, limit?: number, offset?: number })` — If `id` is provided, return one message. Otherwise return paged results with defaults `limit=100`, `offset=0`, in shape `{ items, total, limit, offset }`.
- `get_actionables({ id?: ActionableId, limit?: number, offset?: number })` — If `id` is provided, return one actionable. Otherwise return paged results with defaults `limit=100`, `offset=0`, in shape `{ items, total, limit, offset }`.
- `get_outgoing_messages({ id?: OutgoingMessageId, limit?: number, offset?: number })` — If `id` is provided, return one outgoing message. Otherwise return paged results with defaults `limit=100`, `offset=0`, in shape `{ items, total, limit, offset }`.
- `get_briefing()` — Return current briefing (or `null`).
- `upsert_message({ id?: MessageId, ...fields })` — If `id` exists, patch only provided fields and keep others intact; if no `id`, create and return `{ id }`.
- `upsert_actionable({ id?: ActionableId, ...fields })` — Same upsert contract as message.
- `upsert_outgoing_message({ id?: OutgoingMessageId, ...fields })` — Same upsert contract as message.
- `upsert_briefing({ ...fields })` — Upsert singleton daily briefing; return success payload (and `id` not required for this singleton).
- Agent workspace logic is in `src/lib/agent/workspace-ops.ts` (pagination + upsert semantics), keeping `workspace` store focused on persistence/state access.

### Routing

Path-based navigation. `/` opens the same default detail as inbox (daily brief when available).

- `src/routes/+layout.svelte` — Two-pane shell: left nav with data-driven accordion sections (`navSections` array), right detail pane. Resizable via PaneForge with `autoSaveId` for persisted sizing. Clicking open section toggles it closed (navigates to `/`).
- `src/routes/inbox/+page.svelte` — Shows daily brief when no inbox message is selected. All other section default pages (drafts, sent, decide, delegate, ignore) also show the daily brief.
- `src/routes/inbox/[id]/+page.svelte` — Message detail. Auto-marks read via `$effect` + `untrack`.
- `src/routes/decide/[id]/+page.svelte` (+ delegate, ignore) — Actionable detail via shared `ActionableDetail.svelte`
- `src/routes/drafts/[id]/+page.svelte` — Draft detail/editor view
- `src/routes/sent/[id]/+page.svelte` — Sent message read-only detail view

### Components

- `src/lib/components/DevPanel.svelte` — Sheet-based dev tool: AI config (provider/model/API key) plus file import (raw JSON → messages), add N/all, reset workspace (restore mock data), clear workspace, shows counts.
- `src/lib/components/ActionableDetail.svelte` — Two-pane actionable view: left pane shows title/priority/summary + draft editor(s) with Send button, right pane shows unified timeline of related incoming messages (accordion) and outgoing replies (always visible, read-only, indented under parent). Keyboard nav (arrow keys) for message accordion. Resizable via PaneForge with persisted sizing.
- `src/lib/components/OutgoingMessageDetail.svelte` — Shared outgoing message detail used by drafts (editable recipient/subject/body) and sent (read-only), with actionable/message context links.
- `src/lib/components/DailyBriefDetail.svelte` — Daily brief renderer using unified (`remark-parse`/`remark-gfm`/`remark-rehype`/`rehype-stringify`) plus actionable-driven sections (decide/delegate/watchlist).
- `src/routes/SidebarListPane.svelte` — Scrollable list component for sidebar accordion content.
- `src/lib/components/ui/` — shadcn: button, badge, input, label, resizable, scroll-area, select, separator, sheet.

## UI Layout

Two-pane inbox-style layout:

1. **Left pane** (~36%, persisted): "Innate" header + data-driven accordion nav sections unfold to reveal scrollable lists (messages, drafts, sent, or actionables). Only the open section flex-grows.
2. **Right pane** (~64%): Default shows daily brief for all sections; otherwise message body, actionable detail (split into summary + related messages timeline), draft editor, or sent message detail.

Dev panel trigger is a floating button in the top-right corner of the app shell.

All panes resizable with persisted sizes via PaneForge `autoSaveId`.
