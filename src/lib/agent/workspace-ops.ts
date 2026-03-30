import { workspace } from '$lib/stores/workspace.svelte';
import type {
	Actionable,
	ActionableId,
	DailyBriefing,
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

export function listMessages(limit = 100, offset = 0) {
	return paginate(workspace.messages, limit, offset);
}

export function listActionables(limit = 100, offset = 0) {
	return paginate(workspace.actionables, limit, offset);
}

export function listOutgoingMessages(limit = 100, offset = 0) {
	return paginate(workspace.outgoingMessages, limit, offset);
}

export function upsertMessage(input: { id?: MessageId } & Partial<Omit<Message, 'id'>>) {
	if (input.id) {
		const index = workspace.messages.findIndex((item) => item.id === input.id);
		if (index === -1) {
			throw new Error(`Message ${input.id} not found`);
		}

		const messages = [...workspace.messages];
		messages[index] = mergeDefined(messages[index], input);
		workspace.setMessages(messages);
		return { id: messages[index].id, created: false as const };
	}

	const required: Array<keyof Omit<Message, 'id'>> = [
		'channel',
		'senderName',
		'receivedAt',
		'summary',
		'text',
		'read',
		'order'
	];
	assertRequired(input, required, 'message');

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
		summary: input.summary!,
		text: input.text!,
		read: input.read!,
		order: input.order!
	};

	workspace.setMessages([...workspace.messages, created]);
	return { id, created: true as const };
}

export function upsertActionable(input: { id?: ActionableId } & Partial<Omit<Actionable, 'id'>>) {
	if (input.id) {
		const index = workspace.actionables.findIndex((item) => item.id === input.id);
		if (index === -1) {
			throw new Error(`Actionable ${input.id} not found`);
		}

		const actionables = [...workspace.actionables];
		actionables[index] = mergeDefined(actionables[index], input);
		workspace.setActionables(actionables);
		return { id: actionables[index].id, created: false as const };
	}

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

	const id = nextId(
		'a',
		workspace.actionables.map((actionable) => actionable.id)
	) as ActionableId;
	const created: Actionable = {
		id,
		messageIds: input.messageIds!,
		outgoingMessageIds: input.outgoingMessageIds!,
		action: input.action!,
		title: input.title!,
		summary: input.summary!,
		priority: input.priority!,
		status: input.status!
	};

	workspace.setActionables([...workspace.actionables, created]);
	return { id, created: true as const };
}

export function upsertOutgoingMessage(
	input: { id?: OutgoingMessageId } & Partial<Omit<OutgoingMessage, 'id'>>
) {
	if (input.id) {
		const index = workspace.outgoingMessages.findIndex((item) => item.id === input.id);
		if (index === -1) {
			throw new Error(`Outgoing message ${input.id} not found`);
		}

		const outgoingMessages = [...workspace.outgoingMessages];
		outgoingMessages[index] = mergeDefined(outgoingMessages[index], input);
		workspace.setOutgoingMessages(outgoingMessages);
		return { id: outgoingMessages[index].id, created: false as const };
	}

	const required: Array<keyof Omit<OutgoingMessage, 'id'>> = ['body', 'sent'];
	assertRequired(input, required, 'outgoing message');

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
		body: input.body!,
		createdAt: input.createdAt,
		sent: input.sent!
	};

	workspace.setOutgoingMessages([...workspace.outgoingMessages, created]);
	return { id, created: true as const };
}

export function upsertBriefing(input: Partial<DailyBriefing>) {
	if (!workspace.briefing) {
		assertRequired(input, ['generatedAt', 'markdown'], 'briefing');
		workspace.setBriefing({ generatedAt: input.generatedAt!, markdown: input.markdown! });
		return { updated: true as const };
	}

	const hasAnyField = input.generatedAt !== undefined || input.markdown !== undefined;
	if (!hasAnyField) {
		throw new Error('No fields provided for briefing upsert');
	}

	workspace.setBriefing({
		generatedAt: input.generatedAt ?? workspace.briefing.generatedAt,
		markdown: input.markdown ?? workspace.briefing.markdown
	});

	return { updated: true as const };
}
