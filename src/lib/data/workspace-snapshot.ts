import * as v from 'valibot';
import type { Actionable, DailyBriefing, Message, OutgoingMessage } from '$lib/types';

const messageIdSchema = v.pipe(v.string(), v.regex(/^m\d+$/));
const actionableIdSchema = v.pipe(v.string(), v.regex(/^a\d+$/));
const outgoingMessageIdSchema = v.pipe(v.string(), v.regex(/^o\d+$/));
const channelSchema = v.picklist(['email', 'slack', 'whatsapp']);

const messageSchema = v.object({
	id: messageIdSchema,
	channel: channelSchema,
	senderName: v.string(),
	subject: v.optional(v.string()),
	channelName: v.optional(v.string()),
	receivedAt: v.string(),
	summary: v.optional(v.string()),
	text: v.string(),
	read: v.optional(v.boolean())
});

const actionableSchema = v.object({
	id: actionableIdSchema,
	messageIds: v.array(messageIdSchema),
	action: v.picklist(['ignore', 'delegate', 'decide']),
	title: v.string(),
	summary: v.string(),
	priority: v.picklist(['low', 'medium', 'high']),
	status: v.picklist(['open', 'done'])
});

const outgoingMessageSchema = v.object({
	id: outgoingMessageIdSchema,
	parentActionableId: v.optional(actionableIdSchema),
	parentMessageId: v.optional(messageIdSchema),
	recipient: v.optional(v.string()),
	subject: v.optional(v.string()),
	channel: v.optional(channelSchema),
	channelName: v.optional(v.string()),
	body: v.string(),
	createdAt: v.optional(v.string()),
	sent: v.boolean()
});

const dailyBriefingSchema = v.object({
	generatedAt: v.string(),
	markdown: v.string()
});

const workspaceSnapshotSchema = v.object({
	version: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
	exportedAt: v.optional(v.string()),
	messages: v.array(messageSchema),
	actionables: v.array(actionableSchema),
	outgoingMessages: v.array(outgoingMessageSchema),
	briefing: v.nullable(dailyBriefingSchema)
});

export type WorkspaceSnapshot = {
	version?: number;
	exportedAt?: string;
	messages: Message[];
	actionables: Actionable[];
	outgoingMessages: OutgoingMessage[];
	briefing: DailyBriefing | null;
};

function toPlain<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function validateSnapshotReferences(snapshot: WorkspaceSnapshot) {
	const messageIds = new Set(snapshot.messages.map((message) => message.id));
	const actionableIds = new Set(snapshot.actionables.map((actionable) => actionable.id));

	for (const actionable of snapshot.actionables) {
		for (const messageId of actionable.messageIds) {
			if (!messageIds.has(messageId)) {
				throw new Error(
					`Snapshot references unknown message id in actionable ${actionable.id}: ${messageId}`
				);
			}
		}
	}

	for (const outgoing of snapshot.outgoingMessages) {
		if (outgoing.parentMessageId && !messageIds.has(outgoing.parentMessageId)) {
			throw new Error(
				`Snapshot references unknown parentMessageId in outgoing ${outgoing.id}: ${outgoing.parentMessageId}`
			);
		}

		if (outgoing.parentActionableId && !actionableIds.has(outgoing.parentActionableId)) {
			throw new Error(
				`Snapshot references unknown parentActionableId in outgoing ${outgoing.id}: ${outgoing.parentActionableId}`
			);
		}
	}
}

export function parseWorkspaceSnapshot(json: unknown): WorkspaceSnapshot {
	const parsed = v.parse(workspaceSnapshotSchema, json);
	const snapshot: WorkspaceSnapshot = {
		version: parsed.version,
		exportedAt: parsed.exportedAt,
		messages: parsed.messages as Message[],
		actionables: parsed.actionables as Actionable[],
		outgoingMessages: parsed.outgoingMessages as OutgoingMessage[],
		briefing: parsed.briefing as DailyBriefing | null
	};
	validateSnapshotReferences(snapshot);
	return snapshot;
}

export function createWorkspaceSnapshot(input: {
	messages: Message[];
	actionables: Actionable[];
	outgoingMessages: OutgoingMessage[];
	briefing: DailyBriefing | null;
}): WorkspaceSnapshot {
	return {
		version: 1,
		exportedAt: new Date().toISOString(),
		messages: toPlain(input.messages),
		actionables: toPlain(input.actionables),
		outgoingMessages: toPlain(input.outgoingMessages),
		briefing: toPlain(input.briefing)
	};
}
