import { workspace } from '$lib/stores/workspace.svelte';
import type {
	Actionable,
	ActionableId,
	Message,
	MessageId,
	OutgoingMessage,
	OutgoingMessageId
} from '$lib/types';

type Page<T> = {
	items: T[];
	total: number;
	limit: number;
	offset: number;
};

function paginate<T>(items: T[], limit: number, offset: number): Page<T> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100;
	const safeOffset = Number.isFinite(offset) && offset >= 0 ? Math.floor(offset) : 0;
	return {
		items: items.slice(safeOffset, safeOffset + safeLimit),
		total: items.length,
		limit: safeLimit,
		offset: safeOffset
	};
}

function nextId(prefix: 'm' | 'a' | 'o', ids: string[]): string {
	let max = 0;
	for (const id of ids) {
		const n = Number.parseInt(id.slice(1), 10);
		if (Number.isFinite(n) && n > max) max = n;
	}
	return `${prefix}${max + 1}`;
}

function mergeDefined<T extends object>(target: T, patch: Partial<T>): T {
	const next = { ...target };
	for (const key of Object.keys(patch) as Array<keyof T>) {
		if (key === 'id') continue;
		const value = patch[key];
		if (value !== undefined) {
			next[key] = value;
		}
	}
	return next;
}

function assertExistingIds(
	ids: string[],
	existingIds: Set<string>,
	fieldName: string,
	entityName: string
) {
	const missing = ids.filter((id) => !existingIds.has(id));
	if (missing.length > 0) {
		throw new Error(
			`Invalid ${entityName} ${fieldName}: ${missing.join(', ')} not found in workspace.`
		);
	}
}

export function listMessages(limit = 100, offset = 0) {
	return paginate(workspace.messages, limit, offset);
}

export function listActionables(limit = 100, offset = 0) {
	return paginate(workspace.actionables, limit, offset);
}

export function listOutgoingMessages(limit = 100, offset = 0) {
	return paginate(workspace.outgoingMessages, limit, offset);
}

export function insertMessage(input: Omit<Message, 'id'>) {
	const derivedSummary =
		input.summary ??
		input.subject ??
		input.text
			.split('\n')
			.find((line) => line.trim().length > 0)
			?.trim();

	const id = nextId(
		'm',
		workspace.messages.map((message) => message.id)
	) as MessageId;
	const created: Message = {
		id,
		channel: input.channel,
		senderName: input.senderName,
		subject: input.subject,
		channelName: input.channelName,
		receivedAt: input.receivedAt,
		summary: derivedSummary,
		text: input.text,
		read: input.read ?? false
	};

	workspace.setMessages([...workspace.messages, created]);
	return { id };
}

export function updateMessage(id: MessageId, patch: { summary?: string; read?: boolean }) {
	const index = workspace.messages.findIndex((item) => item.id === id);
	if (index === -1) throw new Error(`Message ${id} not found`);

	const messages = [...workspace.messages];
	messages[index] = mergeDefined(messages[index], patch as Partial<Message>);
	workspace.setMessages(messages);
	return { id: messages[index].id };
}

function validateActionableReferences(input: Partial<Omit<Actionable, 'id'>>) {
	if (input.messageIds) {
		assertExistingIds(
			input.messageIds,
			new Set(workspace.messages.map((message) => message.id)),
			'messageIds',
			'actionable'
		);
	}
}

export function insertActionable(input: Omit<Actionable, 'id'>) {
	validateActionableReferences(input);

	const id = nextId(
		'a',
		workspace.actionables.map((actionable) => actionable.id)
	) as ActionableId;
	const created: Actionable = {
		id,
		messageIds: input.messageIds,
		action: input.action,
		title: input.title,
		summary: input.summary,
		priority: input.priority,
		status: input.status
	};

	workspace.setActionables([...workspace.actionables, created]);
	return { id };
}

export function updateActionable(id: ActionableId, patch: Partial<Omit<Actionable, 'id'>>) {
	validateActionableReferences(patch);

	const index = workspace.actionables.findIndex((item) => item.id === id);
	if (index === -1) throw new Error(`Actionable ${id} not found`);

	const actionables = [...workspace.actionables];
	actionables[index] = mergeDefined(actionables[index], patch as Partial<Actionable>);
	workspace.setActionables(actionables);
	return { id: actionables[index].id };
}

function validateOutgoingReferences(input: Partial<Omit<OutgoingMessage, 'id' | 'createdAt'>>) {
	if (input.parentMessageId) {
		assertExistingIds(
			[input.parentMessageId],
			new Set(workspace.messages.map((message) => message.id)),
			'parentMessageId',
			'outgoing message'
		);
	}
	if (input.parentActionableId) {
		assertExistingIds(
			[input.parentActionableId],
			new Set(workspace.actionables.map((actionable) => actionable.id)),
			'parentActionableId',
			'outgoing message'
		);
	}
}

export function insertOutgoingMessage(input: Omit<OutgoingMessage, 'id' | 'createdAt'>) {
	validateOutgoingReferences(input);

	const id = nextId(
		'o',
		workspace.outgoingMessages.map((outgoingMessage) => outgoingMessage.id)
	) as OutgoingMessageId;
	const created: OutgoingMessage = {
		id,
		parentActionableId: input.parentActionableId,
		parentMessageId: input.parentMessageId,
		recipient: input.recipient,
		subject: input.subject,
		channel: input.channel,
		channelName: input.channelName,
		body: input.body,
		createdAt: new Date().toISOString(),
		sent: input.sent
	};

	workspace.setOutgoingMessages([...workspace.outgoingMessages, created]);
	return { id };
}

export function updateOutgoingMessage(
	id: OutgoingMessageId,
	patch: Partial<Omit<OutgoingMessage, 'id' | 'createdAt'>>
) {
	const index = workspace.outgoingMessages.findIndex((item) => item.id === id);
	if (index === -1) throw new Error(`Outgoing message ${id} not found`);

	const existing = workspace.outgoingMessages[index];
	if (existing.sent) {
		throw new Error(`Outgoing message ${id} is already sent and cannot be edited.`);
	}

	validateOutgoingReferences(patch);

	const outgoingMessages = [...workspace.outgoingMessages];
	outgoingMessages[index] = mergeDefined(
		outgoingMessages[index],
		patch as Partial<OutgoingMessage>
	);

	if (patch.sent === true) {
		outgoingMessages[index].createdAt = new Date().toISOString();
	}

	workspace.setOutgoingMessages(outgoingMessages);
	return { id: outgoingMessages[index].id };
}

export function updateBriefing(markdown: string) {
	if (markdown.trim().length === 0) {
		throw new Error('Briefing markdown cannot be empty.');
	}

	workspace.setBriefing({
		generatedAt: new Date().toISOString(),
		markdown
	});

	return { updated: true as const };
}
