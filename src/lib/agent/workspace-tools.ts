import { tool } from 'ai';
import { valibotSchema } from '@ai-sdk/valibot';
import * as v from 'valibot';
import { workspace } from '$lib/stores/workspace.svelte';
import {
	insertActionable,
	insertMessage,
	insertOutgoingMessage,
	listActionables,
	listMessages,
	listOutgoingMessages,
	updateActionable,
	updateBriefing,
	updateMessage,
	updateOutgoingMessage
} from '$lib/agent/workspace-ops';
import type { ActionableId, MessageId, OutgoingMessageId } from '$lib/types';

// Shared field schemas
const messageId = v.pipe(v.string(), v.regex(/^m\d+$/), v.description('Message id, e.g. m12'));
const actionableId = v.pipe(v.string(), v.regex(/^a\d+$/), v.description('Actionable id, e.g. a4'));
const outgoingMessageId = v.pipe(
	v.string(),
	v.regex(/^o\d+$/),
	v.description('Outgoing message id, e.g. o7')
);
const channel = v.picklist(['email', 'slack', 'whatsapp']);
const actionType = v.picklist(['ignore', 'delegate', 'decide']);
const priority = v.picklist(['low', 'medium', 'high']);
const status = v.picklist(['open', 'done']);
const paginationFields = {
	limit: v.optional(
		v.pipe(v.number(), v.integer(), v.minValue(1), v.description('Max items. Default: 100.'))
	),
	offset: v.optional(
		v.pipe(v.number(), v.integer(), v.minValue(0), v.description('Items to skip. Default: 0.'))
	)
};

function toPlain<T>(value: T): T {
	if (value == null) return value;
	return JSON.parse(JSON.stringify(value)) as T;
}

function enrichActionable(actionable: { id: string } | null) {
	if (!actionable) return null;
	const outgoingMessageIds = workspace.outgoingMessages
		.filter((m) => m.parentActionableId === actionable.id)
		.map((m) => m.id);
	return { ...toPlain(actionable), outgoingMessageIds };
}

export const workspaceTools = {
	get_messages: tool({
		description: 'List messages with optional pagination (default: limit=100, offset=0).',
		inputSchema: valibotSchema(v.object(paginationFields)),
		execute: async ({ limit, offset }) => toPlain(listMessages(limit ?? 100, offset ?? 0))
	}),

	get_message: tool({
		description: 'Get one message by id.',
		inputSchema: valibotSchema(v.object({ id: messageId })),
		execute: async ({ id }) => ({
			item: toPlain(workspace.getMessage(id as MessageId) ?? null)
		})
	}),

	get_actionables: tool({
		description: 'List actionables with optional pagination (default: limit=100, offset=0).',
		inputSchema: valibotSchema(v.object(paginationFields)),
		execute: async ({ limit, offset }) => {
			const page = listActionables(limit ?? 100, offset ?? 0);
			return { ...toPlain(page), items: page.items.map((a) => enrichActionable(a)) };
		}
	}),

	get_actionable: tool({
		description: 'Get one actionable by id.',
		inputSchema: valibotSchema(v.object({ id: actionableId })),
		execute: async ({ id }) => ({
			item: enrichActionable(workspace.getActionable(id as ActionableId) ?? null)
		})
	}),

	get_outgoing_messages: tool({
		description: 'List outgoing messages with optional pagination (default: limit=100, offset=0).',
		inputSchema: valibotSchema(v.object(paginationFields)),
		execute: async ({ limit, offset }) => toPlain(listOutgoingMessages(limit ?? 100, offset ?? 0))
	}),

	get_outgoing_message: tool({
		description: 'Get one outgoing message by id.',
		inputSchema: valibotSchema(v.object({ id: outgoingMessageId })),
		execute: async ({ id }) => ({
			item: toPlain(workspace.getOutgoingMessage(id as OutgoingMessageId) ?? null)
		})
	}),

	get_briefing: tool({
		description: 'Get current daily briefing.',
		inputSchema: valibotSchema(v.object({})),
		execute: async () => ({ item: toPlain(workspace.briefing) })
	}),

	insert_message: tool({
		description: 'Insert a new message. Returns { id }.',
		inputSchema: valibotSchema(
			v.object({
				channel,
				senderName: v.pipe(v.string(), v.description('Display name of the sender.')),
				subject: v.optional(v.string()),
				channelName: v.optional(
					v.pipe(v.string(), v.description('Mailbox, channel, or thread name.'))
				),
				receivedAt: v.pipe(v.string(), v.description('ISO-8601 timestamp.')),
				summary: v.optional(
					v.pipe(v.string(), v.description('Override summary; otherwise derived.'))
				),
				text: v.pipe(v.string(), v.description('Full message body.')),
				read: v.optional(v.pipe(v.boolean(), v.description('Initial read state. Default: false.')))
			})
		),
		execute: async (input) => ({ id: insertMessage(input).id })
	}),

	update_message: tool({
		description: 'Update message summary and/or read status.',
		inputSchema: valibotSchema(
			v.object({
				id: messageId,
				summary: v.optional(v.string()),
				read: v.optional(v.boolean())
			})
		),
		execute: async ({ id, ...patch }) => ({
			id: updateMessage(id as MessageId, patch).id
		})
	}),

	insert_actionable: tool({
		description:
			'Insert a triage decision record linked to source messages. Actionables are the canonical classification layer over inbound messages. Returns { id }.',
		inputSchema: valibotSchema(
			v.object({
				messageIds: v.pipe(
					v.array(messageId),
					v.description('Linked message ids. Use [] when none.')
				),
				action: actionType,
				title: v.string(),
				summary: v.string(),
				priority,
				status
			})
		),
		execute: async (input) => ({
			id: insertActionable({ ...input, messageIds: input.messageIds as MessageId[] }).id
		})
	}),

	update_actionable: tool({
		description: 'Update an actionable. Only provided fields are changed.',
		inputSchema: valibotSchema(
			v.object({
				id: actionableId,
				messageIds: v.optional(v.array(messageId)),
				action: v.optional(actionType),
				title: v.optional(v.string()),
				summary: v.optional(v.string()),
				priority: v.optional(priority),
				status: v.optional(status)
			})
		),
		execute: async ({ id, ...patch }) => ({
			id: updateActionable(id as ActionableId, {
				...patch,
				messageIds: patch.messageIds as MessageId[] | undefined
			}).id
		})
	}),

	insert_outgoing_message: tool({
		description:
			'Insert an outgoing draft/sent message. Outgoing messages represent responses/handoffs and should usually reference a parent actionable; parentMessageId is optional for direct thread replies. Prefer matching the parent message channel unless there is a clear reason to switch. Timestamp auto-set. Returns { id }.',
		inputSchema: valibotSchema(
			v.object({
				parentActionableId: v.optional(actionableId),
				parentMessageId: v.optional(messageId),
				recipient: v.optional(v.string()),
				subject: v.optional(v.string()),
				channel: v.optional(channel),
				channelName: v.optional(
					v.pipe(v.string(), v.description('Mailbox, channel, or thread name.'))
				),
				body: v.pipe(v.string(), v.description('Message body text.')),
				sent: v.pipe(v.boolean(), v.description('true = sent, false = draft.'))
			})
		),
		execute: async (input) => ({
			id: insertOutgoingMessage({
				...input,
				parentActionableId: input.parentActionableId as ActionableId | undefined,
				parentMessageId: input.parentMessageId as MessageId | undefined
			}).id
		})
	}),

	update_outgoing_message: tool({
		description: 'Update a draft outgoing message. Sent messages cannot be edited.',
		inputSchema: valibotSchema(
			v.object({
				id: outgoingMessageId,
				parentActionableId: v.optional(actionableId),
				parentMessageId: v.optional(messageId),
				recipient: v.optional(v.string()),
				subject: v.optional(v.string()),
				channel: v.optional(channel),
				channelName: v.optional(v.string()),
				body: v.optional(v.string()),
				sent: v.optional(v.pipe(v.boolean(), v.description('Mark as sent. Irreversible.')))
			})
		),
		execute: async ({ id, ...patch }) => ({
			id: updateOutgoingMessage(id as OutgoingMessageId, {
				...patch,
				parentActionableId: patch.parentActionableId as ActionableId | undefined,
				parentMessageId: patch.parentMessageId as MessageId | undefined
			}).id
		})
	}),

	update_briefing: tool({
		description:
			'Replace CEO daily briefing markdown. Briefing should synthesize current messages, actionables, and outgoing drafts/sends into a concise decision-oriented view. Timestamp auto-set.',
		inputSchema: valibotSchema(
			v.object({
				markdown: v.pipe(v.string(), v.description('Full briefing markdown.'))
			})
		),
		execute: async ({ markdown }) => updateBriefing(markdown)
	})
};
