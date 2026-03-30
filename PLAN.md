# PLAN

## MVP Direction

- Client-only app (SvelteKit SPA mode, SSR disabled).
- No backend, no database; persist everything in browser `localStorage`.
- One global **Workspace** store is the source of truth.
- An **Agent Loop** reads/writes Workspace via typed tools.
- UI is a projection of Workspace state (never its own hidden source of truth).

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
5. Cross-check timeline for contradictions and "later message changed context" cases.
6. Generate final daily briefing from latest workspace state.
7. Persist Workspace snapshot to `localStorage`.

## Simplification Decision

- For MVP, use a single `Actionable` entity instead of separate triage/flag objects.
- `Actionable.action` captures the required decision: `ignore`, `delegate`, or `decide`.
- `Actionable` is intentionally minimal: `title`, `summary`, `messageIds`, `outgoingMessageIds`, `action`, `priority`, `status`.
- Use linked `OutgoingMessage` objects for outbound communication content.
- `OutgoingMessage.sent` tracks draft vs sent state in one entity.
- UI becomes a filtered view of `Actionable` list plus related outgoing messages.

## Notes / MVP Tradeoffs

- Prefer deterministic, inspectable intermediate state over hidden prompt-only logic.
- No backward-compat layer; we can evolve schema directly while MVP is in flight.
- If schema changes, migrate local snapshot with a simple `workspace.version` gate.
