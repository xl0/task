# PLAN

## MVP Direction

- Client-only app (SvelteKit SPA mode planned, SSR currently default).
- No backend, no database; persist everything in browser `localStorage` via runed `PersistedState`.
- One global **Workspace** store is the source of truth.
- An **Agent Loop** reads/writes Workspace via typed tools.
- UI is a projection of Workspace state (never its own hidden source of truth).
- UI state (selected message, current view) lives in the URL, not the store.

## Data Model (High-Level)

### 1) Workspace (root aggregate)

```ts
type Workspace = {
	messages: Message[];
	actionables: Actionable[];
	outgoingMessages: OutgoingMessage[];
	briefing: DailyBriefing | null;
	lastComputedAt?: string;
};
```

### 2) Core Entities

```ts
type Message = {
	id: `m${number}`;
	channel: 'email' | 'slack' | 'whatsapp';
	senderName: string;
	subject?: string;
	channelName?: string;
	receivedAt: string;
	summary: string;
	text: string;
	read: boolean;
	order: number;
};

type Actionable = {
	id: `a${number}`;
	messageIds: Array<`m${number}`>;
	outgoingMessageIds: Array<`o${number}`>;
	action: 'ignore' | 'delegate' | 'decide';
	title: string;
	summary: string;
	priority: 'low' | 'medium' | 'high';
	status: 'open' | 'done';
};

type OutgoingMessage = {
	id: `o${number}`;
	parentActionableId?: `a${number}`;
	parentMessageId?: `m${number}`;
	recipient?: string;
	subject?: string;
	channel?: 'email' | 'slack' | 'whatsapp';
	channelName?: string;
	body: string;
	createdAt?: string;
	sent: boolean;
};

type DailyBriefing = {
	generatedAt: string;
	markdown: string;
};
```

## Entity Dependencies

- `Message` is foundational input; all other domain entities reference `messageId`s.
- `Actionable` depends on one or more `Message` items.
- `OutgoingMessage` optionally depends on a specific `Actionable` and/or `Message`.
- `DailyBriefing` stores one markdown body; structured rollups are derived from current actionables.
- Agent/runtime execution state and UI view state are intentionally out of Workspace.

## Agent Loop (High-Level)

1. Load/normalize messages into Workspace timeline.
2. Group related messages into self-contained threads/clusters.
3. Create/refresh `actionable` records with `action` (`ignore` / `delegate` / `decide`), summary, and priority.
4. Generate `outgoingMessage` records for `decide` and `delegate` actionables.
5. Cross-check timeline for contradictions and "later message changed context" cases.
6. Generate final daily briefing from latest workspace state.
7. Persist Workspace snapshot to `localStorage`.

## Current State

### Done

- Two-pane shell with data-driven accordion nav (left) and detail pane (right), resizable with persisted sizes
- Path-based routing: `/inbox`, `/inbox/m{id}`, `/decide`, `/decide/a{id}`, `/delegate/...`, `/ignore/...`, `/drafts`, `/sent`
- Workspace store with persisted messages, actionables, outgoingMessages, briefing; reset + clear
- Mock data: 20 messages + 12 actionables + 7 outgoing messages (draft + sent) + markdown daily briefing
- Dev panel: import raw JSON, reset workspace (restore mocks), clear workspace
- Dev panel AI config: provider/model/API key controls persisted in browser storage
- Mark read/unread, mark all unread
- Actionable detail: two-pane view with summary (left) + unified timeline of related messages and replies (right)
  - Incoming messages in accordion with keyboard nav (arrow keys)
  - Outgoing replies (drafts/sent) shown always-visible, indented under parent message
  - Drafts editable inline; sent messages read-only
  - Outgoing messages support `channelName` for Slack channel display
- Drafts/Sent list panes wired to outgoing messages
- Draft editor route (`/drafts/o{id}`) and sent detail route (`/sent/o{id}`)
- Daily brief shown as default detail for all sections (inbox, drafts, sent, decide, delegate, ignore)
- Clicking open nav section toggles it closed (navigates to `/`)

### Next

- Agent loop implementation (LLM-powered triage)
- Wire agent loop runtime to dev panel AI config (provider/model/api key)
- OutgoingMessage generation/refresh from agent loop (instead of static mocks)
- Daily briefing generation/refresh from agent loop (instead of static mock)
- Send flow from draft editor (mark sent + move to Sent)

### Agent Tooling Todo

- Define canonical tool contracts for `get_*` and `upsert_*` (minimal `get_*` filters, optional `id` for single fetch, paged list reads with `limit`/`offset` + `total`) ✅
- Add runtime tool handlers over `workspace` store ✅
- Implement `upsert_*` semantics (partial update by `id`, create when missing `id`, return `{ id }` on create) ✅
- Validate tool inputs with strict schemas and clear error messages
- Add a first agent loop pass that reads with `get_*` and writes via `upsert_*`
- Add smoke tests to verify tool behavior on create, update, and relation preservation

## Notes / MVP Tradeoffs

- Prefer deterministic, inspectable intermediate state over hidden prompt-only logic.
- No backward-compat layer; we can evolve schema directly while MVP is in flight.
- If schema changes, migrate local snapshot with a simple `workspace.version` gate.
