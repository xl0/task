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
	body: string;
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

- Three-column inbox UI (nav, list, detail) with resizable panes
- Path-based routing: `/brief`, `/inbox`, `/inbox/m{id}`, `/decide`, `/decide/a{id}`, `/delegate/...`, `/ignore/...`, `/drafts`, `/sent`
- Workspace store with persisted messages, actionables, outgoingMessages, briefing
- Mock data: 20 messages + 12 actionables + outgoing messages (draft + sent) + markdown daily briefing
- Dev panel: import raw JSON message dumps, clear workspace
- Mark read/unread, mark all unread
- Actionable views with priority sorting and badges
- Drafts/Sent list panes wired to outgoing messages
- Draft editor route (`/drafts/o{id}`) and sent detail route (`/sent/o{id}`)
- Daily brief rendered on inbox default detail (`/inbox`) with markdown rendering via unified and actionables-derived sections

### Next

- Agent loop implementation (LLM-powered triage)
- OutgoingMessage generation/refresh from agent loop (instead of static mocks)
- Daily briefing generation/refresh from agent loop (instead of static mock)
- Send flow from draft editor (mark sent + move to Sent)

## Notes / MVP Tradeoffs

- Prefer deterministic, inspectable intermediate state over hidden prompt-only logic.
- No backward-compat layer; we can evolve schema directly while MVP is in flight.
- If schema changes, migrate local snapshot with a simple `workspace.version` gate.
