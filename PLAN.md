# PLAN

## MVP Direction

- Client-only app (SvelteKit SPA mode, SSR disabled).
- No backend, no database; persist everything in browser `localStorage`.
- One global **Workspace** store is the source of truth.
- Agent loop reads/writes Workspace via typed tools.
- UI is a projection of Workspace state.

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
	senderRole?: string;
	receivedAt?: string;
	summary: string;
	text: string;
	read: boolean;
	order: number; // canonical timeline ordering
};

type Actionable = {
	id: `a${number}`;
	messageIds: Array<`m${number}`>; // one or more related messages (thread/cluster)
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
	createdAt?: string;
	sent: boolean;
	sentAt?: string;
};

type DailyBriefing = {
	generatedAt: string;
	headline: string;
	mustDecideNow: BriefingItem[];
	delegated: BriefingItem[];
	watchlist: BriefingItem[];
	summary: string; // <2 min read target
};

type BriefingItem = {
	title: string;
	detail: string;
	messageIds: Array<`m${number}`>;
};
```

## Entity Dependencies

- `Message` is foundational input; all other domain entities reference `messageId`s.
- `Actionable` depends on one or more `Message` items.
- `OutgoingMessage` optionally depends on a specific `Actionable` and/or `Message`.
- `DailyBriefing` depends on final `actionables + outgoingMessages`.
- Agent/runtime execution state and UI view state are intentionally out of Workspace.

## Agent Loop (High-Level)

1. Load/normalize messages into Workspace timeline.
2. Group related messages into self-contained threads/clusters.
3. Create/refresh `actionable` records with `action` (`ignore` / `delegate` / `decide`), summary, and priority.
4. Generate `outgoingMessage` records for `decide` and `delegate` actionables.
5. Generate final daily briefing from latest workspace state.
6. Persist Workspace snapshot to `localStorage`.

## Next Implementation Step: Inbox UI

- Build a simple inbox-like layout as a direct view of Workspace.
- Left pane: message list sorted by `order`, showing sender, channel, summary, read/unread.
- Main pane: selected message full text + linked actionables.
- Side pane (or section): actionables list with action, priority, status, linked outgoing messages.
- Add basic interactions: select message, toggle read, filter by action/status.
- Keep styling minimal and reuse existing app styles/components.

## Notes / MVP Tradeoffs

- Prefer deterministic, inspectable intermediate state over hidden prompt-only logic.
- No backward-compat layer; we can evolve schema directly while MVP is in flight.
- If schema changes, migrate local snapshot with a simple `workspace.version` gate.
