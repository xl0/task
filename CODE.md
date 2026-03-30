# CODE

## Stack

- SvelteKit (SSR default, SPA mode planned)
- Tailwind v4 + shadcn-svelte (mira style, neutral base, OKLCH colors, `--radius: 0`)
- Lucide icons via `@lucide/svelte`
- Inter Variable font
- runed `PersistedState` for localStorage persistence

## Structure

### Data & Types

- `src/lib/types.ts` — Core types: `Message`, `Actionable`, `OutgoingMessage`, `DailyBriefing`, `Channel`, `MailboxView`. IDs use template literals: `MessageId = m${number}`, `ActionableId = a${number}`, `OutgoingMessageId = o${number}`.
- `src/lib/stores/workspace.svelte.ts` — Class-based store with private `PersistedState` fields for messages, actionables, outgoingMessages, briefing. Defaults to mock data. Methods include getMessage/getActionable/getOutgoingMessage, getActionablesByAction (priority-sorted), getOutgoingMessages(sent), updateOutgoingMessage, sendOutgoingMessage, markRead/markUnread/markAllUnread, addMessages, reset, clear.
- `src/lib/data/mock-messages.ts` — 20 hand-written `Message[]` literals with summaries, derived from `docs/Messages JSON.json`.
- `src/lib/data/mock-actionables.ts` — 12 `Actionable[]` mock items covering decide/delegate/ignore with priorities and linked outgoing message IDs.
- `src/lib/data/mock-outgoing-messages.ts` — 7 `OutgoingMessage[]` mocks: drafts for `decide` actionables and sent messages for `delegate` actionables.
- `src/lib/data/mock-daily-briefing.ts` — Mock `DailyBriefing` with a single markdown body used in inbox default detail.
- `src/lib/data/ingest.ts` — `parseRawMessages()` converts raw JSON dumps (the `docs/Messages JSON.json` format) into `Message[]`.

### Routing

Path-based navigation. `/` opens the same default detail as inbox (daily brief when available).

- `src/routes/+layout.svelte` — Two-pane shell: left nav with data-driven accordion sections (`navSections` array), right detail pane. Resizable via PaneForge with `autoSaveId` for persisted sizing. Clicking open section toggles it closed (navigates to `/`).
- `src/routes/inbox/+page.svelte` — Shows daily brief when no inbox message is selected. All other section default pages (drafts, sent, decide, delegate, ignore) also show the daily brief.
- `src/routes/inbox/[id]/+page.svelte` — Message detail. Auto-marks read via `$effect` + `untrack`.
- `src/routes/decide/[id]/+page.svelte` (+ delegate, ignore) — Actionable detail via shared `ActionableDetail.svelte`
- `src/routes/drafts/[id]/+page.svelte` — Draft detail/editor view
- `src/routes/sent/[id]/+page.svelte` — Sent message read-only detail view

### Components

- `src/lib/components/DevPanel.svelte` — Sheet-based dev tool: file import (parses raw JSON → messages), add N/all, reset workspace (restore mock data), clear workspace, shows counts.
- `src/lib/components/ActionableDetail.svelte` — Two-pane actionable view: left pane shows title/priority/summary + draft editor(s) with Send button, right pane shows unified timeline of related incoming messages (accordion) and outgoing replies (always visible, read-only, indented under parent). Keyboard nav (arrow keys) for message accordion. Resizable via PaneForge with persisted sizing.
- `src/lib/components/OutgoingMessageDetail.svelte` — Shared outgoing message detail used by drafts (editable recipient/subject/body) and sent (read-only), with actionable/message context links.
- `src/lib/components/DailyBriefDetail.svelte` — Daily brief renderer using unified (`remark-parse`/`remark-gfm`/`remark-rehype`/`rehype-stringify`) plus actionable-driven sections (decide/delegate/watchlist).
- `src/routes/SidebarListPane.svelte` — Scrollable list component for sidebar accordion content.
- `src/lib/components/ui/` — shadcn: button, badge, resizable, scroll-area, separator, sheet.

## UI Layout

Two-pane inbox-style layout:

1. **Left pane** (~36%, persisted): "Innate" header + dev panel; data-driven accordion nav sections unfold to reveal scrollable lists (messages, drafts, sent, or actionables). Only the open section flex-grows.
2. **Right pane** (~64%): Default shows daily brief for all sections; otherwise message body, actionable detail (split into summary + related messages timeline), draft editor, or sent message detail.

All panes resizable with persisted sizes via PaneForge `autoSaveId`.
