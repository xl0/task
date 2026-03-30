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
- `src/lib/stores/workspace.svelte.ts` — Class-based store with private `PersistedState` fields for messages, actionables, outgoingMessages, briefing. Defaults to mock data. Methods include getMessage/getActionable/getOutgoingMessage, getActionablesByAction (priority-sorted), getOutgoingMessages(sent), updateOutgoingMessage, markRead/markUnread/markAllUnread, addMessages, clear.
- `src/lib/data/mock-messages.ts` — 20 hand-written `Message[]` literals with summaries, derived from `docs/Messages JSON.json`.
- `src/lib/data/mock-actionables.ts` — 12 `Actionable[]` mock items covering decide/delegate/ignore with priorities and linked outgoing message IDs.
- `src/lib/data/mock-outgoing-messages.ts` — 7 `OutgoingMessage[]` mocks: drafts for `decide` actionables and sent messages for `delegate` actionables.
- `src/lib/data/mock-daily-briefing.ts` — Mock `DailyBriefing` with a single markdown body used in inbox default detail.
- `src/lib/data/ingest.ts` — `parseRawMessages()` converts raw JSON dumps (the `docs/Messages JSON.json` format) into `Message[]`.

### Routing

Path-based navigation. `/` redirects to `/inbox`.

- `src/routes/+layout.svelte` — Three-column shell: nav sidebar + route-selected list-pane components + detail pane (all resizable via PaneForge).
- `src/routes/inbox/+page.svelte` — Shows daily brief when no inbox message is selected.
- `src/routes/inbox/[id]/+page.svelte` — Message detail. Auto-marks read via `$effect` + `untrack`.
- `src/routes/decide/+page.svelte`, `delegate/`, `ignore/` — Empty detail placeholders
- `src/routes/decide/[id]/+page.svelte` (+ delegate, ignore) — Actionable detail via shared `ActionableDetail.svelte`
- `src/routes/drafts/+page.svelte`, `sent/+page.svelte` — "Select message" placeholders
- `src/routes/drafts/[id]/+page.svelte` — Draft detail/editor view
- `src/routes/sent/[id]/+page.svelte` — Sent message read-only detail view

### Components

- `src/lib/components/DevPanel.svelte` — Sheet-based dev tool: file import (parses raw JSON → messages), add N/all, clear workspace, shows counts.
- `src/lib/components/ActionableDetail.svelte` — Shared detail view for actionables: title, priority badge, summary, linked message cards.
- `src/lib/components/OutgoingMessageDetail.svelte` — Shared outgoing message detail used by drafts (editable recipient/subject/body) and sent (read-only), with actionable/message context links.
- `src/lib/components/DailyBriefDetail.svelte` — Daily brief renderer using unified (`remark-parse`/`remark-gfm`/`remark-rehype`/`rehype-stringify`) plus actionable-driven sections (decide/delegate/watchlist).
- `src/routes/*/ListPane.svelte` (+ `src/routes/ActionablesListPane.svelte`) — View-specific list-pane UIs extracted from root layout.
- `src/lib/components/ui/` — shadcn: button, badge, resizable, scroll-area, separator, sheet.

## UI Layout

Three-column inbox-style layout:

1. **Nav sidebar** (~15%): "Innate" header + dev panel wrench icon. Mail section (Inbox/Drafts/Sent) with counts. Separator. Actionables section (Decide/Delegate/Ignore) with open-item counts.
2. **List pane** (~30%): Context-sensitive — inbox messages, actionables, draft messages, or sent messages with selection highlighting.
3. **Detail pane** (~55%): Inbox default shows markdown daily brief + actionable rollups; otherwise message body, actionable detail, draft editor, or sent message detail.

All panes resizable. ScrollArea with `overflow-hidden` for proper height constraint.
