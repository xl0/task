# CODE

## Stack

- SvelteKit (SPA mode planned, SSR currently default)
- Tailwind v4 + shadcn-svelte (mira style, neutral base, OKLCH colors)
- Lucide icons via `@lucide/svelte`
- Inter Variable font

## Structure

- `src/lib/types.ts` — Core types: `Message`, `OutgoingMessage`, `Channel`, `MailboxView`
- `src/lib/stores/workspace.svelte.ts` — Svelte 5 reactive store. Holds messages (from raw JSON), drafts, sent. Tracks selection and current view. Class-based with `$state`/`$derived`.
- `src/lib/utils.ts` — `cn()` helper and type utilities for shadcn
- `src/lib/components/ui/` — shadcn components: button, badge, resizable, scroll-area, separator

## UI

Three-column inbox layout (`+page.svelte`):
1. **Nav sidebar** (~15%): Innate branding, Inbox/Drafts/Sent nav with unread counts
2. **Message list** (~30%): Scrollable list with sender, channel icon, summary, time. Unread = bold + dot. Selected = accent bg.
3. **Detail pane** (~55%): Message header (subject, channel badge, sender metadata) + scrollable body

All panes are resizable via shadcn Resizable (PaneForge).

## Data

20 mock messages inlined in workspace store, transformed from `docs/Messages JSON.json` into `Message` type.
