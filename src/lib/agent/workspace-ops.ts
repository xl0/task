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

type MessageUpdatePatch = {
	summary?: Message['summary'];
	read?: Message['read'];
};

type OutgoingInsertInput = Omit<OutgoingMessage, 'id' | 'createdAt'>;
type OutgoingUpdatePatch = Partial<Omit<OutgoingMessage, 'id' | 'createdAt'>>;

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

function assertRequired<T extends object>(
	input: Partial<T>,
	required: Array<keyof T>,
	entityName: string
) {
	const missing = required.filter((key) => input[key] === undefined);
	if (missing.length > 0) {
		throw new Error(`Missing required ${entityName} fields: ${missing.join(', ')}`);
	}
}

function assertHasUpdateFields(input: Record<string, unknown>, entityName: string) {
	const hasField = Object.values(input).some((value) => value !== undefined);
	if (!hasField) {
		throw new Error(
			`No fields provided to update ${entityName}. Provide at least one field to update.`
		);
	}
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

function assertExistingId(
	id: string,
	existingIds: Set<string>,
	fieldName: string,
	entityName: string
) {
	if (!existingIds.has(id)) {
		throw new Error(`Invalid ${entityName} ${fieldName}: ${id} not found in workspace.`);
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
	const required: Array<keyof Omit<Message, 'id'>> = [
		'channel',
		'senderName',
		'receivedAt',
		'text'
	];
	assertRequired(input, required, 'message');

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
		channel: input.channel!,
		senderName: input.senderName!,
		subject: input.subject,
		channelName: input.channelName,
		receivedAt: input.receivedAt!,
		summary: derivedSummary,
		text: input.text!,
		read: input.read ?? false
	};

	workspace.setMessages([...workspace.messages, created]);
	return { id };
}

export function updateMessage(id: MessageId, patch: MessageUpdatePatch) {
	assertHasUpdateFields(patch as Record<string, unknown>, 'message');

	const index = workspace.messages.findIndex((item) => item.id === id);
	if (index === -1) {
		throw new Error(`Message ${id} not found`);
	}

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

	if (input.outgoingMessageIds) {
		assertExistingIds(
			input.outgoingMessageIds,
			new Set(workspace.outgoingMessages.map((message) => message.id)),
			'outgoingMessageIds',
			'actionable'
		);
	}
}

export function insertActionable(input: Omit<Actionable, 'id'>) {
	const required: Array<keyof Omit<Actionable, 'id'>> = [
		'messageIds',
		'outgoingMessageIds',
		'action',
		'title',
		'summary',
		'priority',
		'status'
	];
	assertRequired(input, required, 'actionable');
	validateActionableReferences(input);

	const id = nextId(
		'a',
		workspace.actionables.map((actionable) => actionable.id)
	) as ActionableId;
	const created: Actionable = {
		id,
		messageIds: input.messageIds,
		outgoingMessageIds: input.outgoingMessageIds,
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
	assertHasUpdateFields(patch as Record<string, unknown>, 'actionable');
	validateActionableReferences(patch);

	const index = workspace.actionables.findIndex((item) => item.id === id);
	if (index === -1) {
		throw new Error(`Actionable ${id} not found`);
	}

	const actionables = [...workspace.actionables];
	actionables[index] = mergeDefined(actionables[index], patch as Partial<Actionable>);
	workspace.setActionables(actionables);
	return { id: actionables[index].id };
}

function validateOutgoingReferences(input: OutgoingUpdatePatch | Partial<OutgoingInsertInput>) {
	if (input.parentMessageId) {
		assertExistingId(
			input.parentMessageId,
			new Set(workspace.messages.map((message) => message.id)),
			'parentMessageId',
			'outgoing message'
		);
	}

	if (input.parentActionableId) {
		assertExistingId(
			input.parentActionableId,
			new Set(workspace.actionables.map((actionable) => actionable.id)),
			'parentActionableId',
			'outgoing message'
		);
	}
}

export function insertOutgoingMessage(input: OutgoingInsertInput) {
	const required: Array<keyof OutgoingInsertInput> = ['body', 'sent'];
	assertRequired(input, required, 'outgoing message');
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

export function updateOutgoingMessage(id: OutgoingMessageId, patch: OutgoingUpdatePatch) {
	assertHasUpdateFields(patch as Record<string, unknown>, 'outgoing message');

	const index = workspace.outgoingMessages.findIndex((item) => item.id === id);
	if (index === -1) {
		throw new Error(`Outgoing message ${id} not found`);
	}

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
