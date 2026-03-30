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

const messageIdSchema = v.pipe(
	v.string(),
	v.regex(/^m\d+$/),
	v.description('Message id: m<number> (example: m12).')
);
const actionableIdSchema = v.pipe(
	v.string(),
	v.regex(/^a\d+$/),
	v.description('Actionable id: a<number> (example: a4).')
);
const outgoingMessageIdSchema = v.pipe(
	v.string(),
	v.regex(/^o\d+$/),
	v.description('Outgoing message id: o<number> (example: o7).')
);
const channelSchema = v.pipe(
	v.picklist(['email', 'slack', 'whatsapp']),
	v.description('Channel: email, slack, or whatsapp.')
);

const actionableTypeSchema = v.pipe(
	v.picklist(['ignore', 'delegate', 'decide']),
	v.description('Action type.')
);
const actionablePrioritySchema = v.pipe(
	v.picklist(['low', 'medium', 'high']),
	v.description('Priority level.')
);
const actionableStatusSchema = v.pipe(
	v.picklist(['open', 'done']),
	v.description('Current status.')
);

const limitSchema = v.pipe(
	v.number(),
	v.integer(),
	v.minValue(1),
	v.description('Maximum items to return.')
);
const offsetSchema = v.pipe(
	v.number(),
	v.integer(),
	v.minValue(0),
	v.description('Zero-based number of items to skip.')
);

const listLimitInputSchema = v.optional(
	v.pipe(limitSchema, v.description('List mode only. Default: 100.'))
);
const listOffsetInputSchema = v.optional(
	v.pipe(offsetSchema, v.description('List mode only. Default: 0.'))
);

const getMessagesInputSchema = v.pipe(
	v.object({
		limit: listLimitInputSchema,
		offset: listOffsetInputSchema
	}),
	v.description('get_messages input. Lists messages; leave fields empty for defaults.')
);

const getMessageInputSchema = v.pipe(
	v.object({
		id: v.pipe(messageIdSchema, v.description('Message id to fetch.'))
	}),
	v.description('get_message input. Fetch exactly one message by id.')
);

const getActionablesInputSchema = v.pipe(
	v.object({
		limit: listLimitInputSchema,
		offset: listOffsetInputSchema
	}),
	v.description('get_actionables input. Lists actionables; leave fields empty for defaults.')
);

const getActionableInputSchema = v.pipe(
	v.object({
		id: v.pipe(actionableIdSchema, v.description('Actionable id to fetch.'))
	}),
	v.description('get_actionable input. Fetch exactly one actionable by id.')
);

const getOutgoingInputSchema = v.pipe(
	v.object({
		limit: listLimitInputSchema,
		offset: listOffsetInputSchema
	}),
	v.description(
		'get_outgoing_messages input. Lists outgoing messages; leave fields empty for defaults.'
	)
);

const getOutgoingMessageInputSchema = v.pipe(
	v.object({
		id: v.pipe(outgoingMessageIdSchema, v.description('Outgoing message id to fetch.'))
	}),
	v.description('get_outgoing_message input. Fetch exactly one outgoing message by id.')
);

const insertMessageInputSchema = v.pipe(
	v.object({
		channel: v.pipe(channelSchema, v.description('Inbound channel.')),
		senderName: v.pipe(v.string(), v.description('Display name of the sender.')),
		subject: v.optional(v.pipe(v.string(), v.description('Subject line.'))),
		channelName: v.optional(v.pipe(v.string(), v.description('Mailbox, channel, or thread name.'))),
		receivedAt: v.pipe(
			v.string(),
			v.description('Received timestamp string (ISO-8601 preferred).')
		),
		summary: v.optional(
			v.pipe(v.string(), v.description('Manual summary override; otherwise summary is derived.'))
		),
		text: v.pipe(v.string(), v.description('Full message body text.')),
		read: v.optional(v.pipe(v.boolean(), v.description('Initial read state; defaults to unread.')))
	}),
	v.description('insert_message input. Creates a new incoming message.')
);

const updateMessageInputSchema = v.pipe(
	v.object({
		id: v.pipe(messageIdSchema, v.description('Id of the message to update.')),
		summary: v.optional(v.pipe(v.string(), v.description('Replacement summary.'))),
		read: v.optional(v.pipe(v.boolean(), v.description('Replacement read state.')))
	}),
	v.description(
		'update_message input. Provide id plus at least one mutable field (summary or read).'
	)
);

const insertActionableInputSchema = v.pipe(
	v.object({
		messageIds: v.pipe(
			v.array(messageIdSchema),
			v.description('Linked incoming message ids. Use [] when none.')
		),
		outgoingMessageIds: v.pipe(
			v.array(outgoingMessageIdSchema),
			v.description('Linked outgoing message ids. Use [] when none.')
		),
		action: v.pipe(actionableTypeSchema, v.description('Action bucket.')),
		title: v.pipe(v.string(), v.description('Short actionable title.')),
		summary: v.pipe(v.string(), v.description('Actionable summary.')),
		priority: v.pipe(actionablePrioritySchema, v.description('Priority.')),
		status: v.pipe(actionableStatusSchema, v.description('Initial status for the actionable.'))
	}),
	v.description('insert_actionable input. Creates a new actionable.')
);

const updateActionableInputSchema = v.pipe(
	v.object({
		id: v.pipe(actionableIdSchema, v.description('Id of the actionable to update.')),
		messageIds: v.optional(
			v.pipe(v.array(messageIdSchema), v.description('Replace linked incoming message ids.'))
		),
		outgoingMessageIds: v.optional(
			v.pipe(
				v.array(outgoingMessageIdSchema),
				v.description('Replace linked outgoing message ids.')
			)
		),
		action: v.optional(v.pipe(actionableTypeSchema, v.description('Replace action type.'))),
		title: v.optional(v.pipe(v.string(), v.description('Replacement title.'))),
		summary: v.optional(v.pipe(v.string(), v.description('Replacement summary.'))),
		priority: v.optional(v.pipe(actionablePrioritySchema, v.description('Replacement priority.'))),
		status: v.optional(v.pipe(actionableStatusSchema, v.description('Replacement status.')))
	}),
	v.description('update_actionable input. Provide id and any fields to patch.')
);

const insertOutgoingMessageInputSchema = v.pipe(
	v.object({
		parentActionableId: v.optional(
			v.pipe(actionableIdSchema, v.description('Parent actionable id.'))
		),
		parentMessageId: v.optional(
			v.pipe(messageIdSchema, v.description('Parent incoming message id.'))
		),
		recipient: v.optional(v.pipe(v.string(), v.description('Recipient name, address, or handle.'))),
		subject: v.optional(v.pipe(v.string(), v.description('Subject line.'))),
		channel: v.optional(v.pipe(channelSchema, v.description('Sending channel.'))),
		channelName: v.optional(
			v.pipe(v.string(), v.description('Mailbox, channel, or conversation name.'))
		),
		body: v.pipe(v.string(), v.description('Outgoing message body text.')),
		sent: v.pipe(
			v.boolean(),
			v.description('Whether this message is already sent (true) or still a draft (false).')
		)
	}),
	v.description('insert_outgoing_message input. Creates a draft or sent outgoing message.')
);

const updateOutgoingMessageInputSchema = v.pipe(
	v.object({
		id: v.pipe(outgoingMessageIdSchema, v.description('Id of the outgoing message to update.')),
		parentActionableId: v.optional(
			v.pipe(actionableIdSchema, v.description('Replacement parent actionable id.'))
		),
		parentMessageId: v.optional(
			v.pipe(messageIdSchema, v.description('Replacement parent incoming message id.'))
		),
		recipient: v.optional(v.pipe(v.string(), v.description('Replacement recipient.'))),
		subject: v.optional(v.pipe(v.string(), v.description('Replacement subject.'))),
		channel: v.optional(v.pipe(channelSchema, v.description('Replacement channel.'))),
		channelName: v.optional(
			v.pipe(v.string(), v.description('Replacement mailbox/channel/thread name.'))
		),
		body: v.optional(v.pipe(v.string(), v.description('Replacement body text.'))),
		sent: v.optional(
			v.pipe(
				v.boolean(),
				v.description('Replacement sent state. Sent messages cannot be edited afterward.')
			)
		)
	}),
	v.description('update_outgoing_message input. Provide id and any fields to patch.')
);

const updateBriefingInputSchema = v.pipe(
	v.object({
		markdown: v.pipe(v.string(), v.description('Full briefing markdown.'))
	}),
	v.description('update_briefing input. Replaces the current briefing markdown.')
);

const getBriefingInputSchema = v.pipe(
	v.object({}),
	v.description('No arguments. Call with an empty object to fetch the current daily briefing.')
);

type GetMessagesInput = v.InferOutput<typeof getMessagesInputSchema>;
type GetMessageInput = v.InferOutput<typeof getMessageInputSchema>;
type GetActionablesInput = v.InferOutput<typeof getActionablesInputSchema>;
type GetActionableInput = v.InferOutput<typeof getActionableInputSchema>;
type GetOutgoingInput = v.InferOutput<typeof getOutgoingInputSchema>;
type GetOutgoingMessageInput = v.InferOutput<typeof getOutgoingMessageInputSchema>;
type InsertMessageInput = v.InferOutput<typeof insertMessageInputSchema>;
type UpdateMessageInput = v.InferOutput<typeof updateMessageInputSchema>;
type InsertActionableInput = v.InferOutput<typeof insertActionableInputSchema>;
type UpdateActionableInput = v.InferOutput<typeof updateActionableInputSchema>;
type InsertOutgoingMessageInput = v.InferOutput<typeof insertOutgoingMessageInputSchema>;
type UpdateOutgoingMessageInput = v.InferOutput<typeof updateOutgoingMessageInputSchema>;
type UpdateBriefingInput = v.InferOutput<typeof updateBriefingInputSchema>;

function normalizePagination(limit?: number, offset?: number) {
	return {
		limit: limit ?? 100,
		offset: offset ?? 0
	};
}

function toPlain<T>(value: T): T {
	if (value === null || value === undefined) return value;
	return JSON.parse(JSON.stringify(value)) as T;
}

async function withToolError<T>(toolName: string, fn: () => Promise<T> | T): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`${toolName} failed: ${message}`);
	}
}

export const workspaceTools = {
	get_messages: tool({
		description:
			'List messages. Use no args for defaults, or pass limit/offset for pagination. Defaults: limit=100, offset=0.',
		inputSchema: valibotSchema(getMessagesInputSchema),
		execute: async ({ limit, offset }: GetMessagesInput) => {
			return withToolError('get_messages', () => {
				const page = normalizePagination(limit, offset);
				return toPlain(listMessages(page.limit, page.offset));
			});
		}
	}),

	get_message: tool({
		description: 'Get one message by id.',
		inputSchema: valibotSchema(getMessageInputSchema),
		execute: async ({ id }: GetMessageInput) => {
			return withToolError('get_message', () => ({
				item: toPlain(workspace.getMessage(id as MessageId) ?? null)
			}));
		}
	}),

	get_actionables: tool({
		description:
			'List actionables. Use no args for defaults, or pass limit/offset for pagination. Defaults: limit=100, offset=0.',
		inputSchema: valibotSchema(getActionablesInputSchema),
		execute: async ({ limit, offset }: GetActionablesInput) => {
			return withToolError('get_actionables', () => {
				const page = normalizePagination(limit, offset);
				return toPlain(listActionables(page.limit, page.offset));
			});
		}
	}),

	get_actionable: tool({
		description: 'Get one actionable by id.',
		inputSchema: valibotSchema(getActionableInputSchema),
		execute: async ({ id }: GetActionableInput) => {
			return withToolError('get_actionable', () => ({
				item: toPlain(workspace.getActionable(id as ActionableId) ?? null)
			}));
		}
	}),

	get_outgoing_messages: tool({
		description:
			'List outgoing messages. Use no args for defaults, or pass limit/offset for pagination. Defaults: limit=100, offset=0.',
		inputSchema: valibotSchema(getOutgoingInputSchema),
		execute: async ({ limit, offset }: GetOutgoingInput) => {
			return withToolError('get_outgoing_messages', () => {
				const page = normalizePagination(limit, offset);
				return toPlain(listOutgoingMessages(page.limit, page.offset));
			});
		}
	}),

	get_outgoing_message: tool({
		description: 'Get one outgoing message by id.',
		inputSchema: valibotSchema(getOutgoingMessageInputSchema),
		execute: async ({ id }: GetOutgoingMessageInput) => {
			return withToolError('get_outgoing_message', () => ({
				item: toPlain(workspace.getOutgoingMessage(id as OutgoingMessageId) ?? null)
			}));
		}
	}),

	get_briefing: tool({
		description: 'Get current daily briefing. Call with an empty object and no arguments.',
		inputSchema: valibotSchema(getBriefingInputSchema),
		execute: async () => {
			return withToolError('get_briefing', () => ({ item: toPlain(workspace.briefing) }));
		}
	}),

	insert_message: tool({
		description:
			'Insert a new message. Optional summary/read default to derived summary and unread. Returns { id }.',
		inputSchema: valibotSchema(insertMessageInputSchema),
		execute: async (input: InsertMessageInput) => {
			return withToolError('insert_message', () => {
				const result = insertMessage(input);
				return { id: result.id };
			});
		}
	}),

	update_message: tool({
		description: 'Update an existing message by id. Only summary/read can be changed.',
		inputSchema: valibotSchema(updateMessageInputSchema),
		execute: async (input: UpdateMessageInput) => {
			return withToolError('update_message', () => {
				const { id, ...patch } = input;
				const result = updateMessage(id as MessageId, patch);
				return { id: result.id };
			});
		}
	}),

	insert_actionable: tool({
		description: 'Insert a new actionable. Returns { id }.',
		inputSchema: valibotSchema(insertActionableInputSchema),
		execute: async (input: InsertActionableInput) => {
			return withToolError('insert_actionable', () => {
				const result = insertActionable({
					...input,
					messageIds: input.messageIds as MessageId[],
					outgoingMessageIds: input.outgoingMessageIds as OutgoingMessageId[]
				});
				return { id: result.id };
			});
		}
	}),

	update_actionable: tool({
		description: 'Update an existing actionable by id. Only provided fields are changed.',
		inputSchema: valibotSchema(updateActionableInputSchema),
		execute: async (input: UpdateActionableInput) => {
			return withToolError('update_actionable', () => {
				const { id, ...patch } = input;
				const result = updateActionable(id as ActionableId, {
					...patch,
					messageIds: patch.messageIds as MessageId[] | undefined,
					outgoingMessageIds: patch.outgoingMessageIds as OutgoingMessageId[] | undefined
				});
				return { id: result.id };
			});
		}
	}),

	insert_outgoing_message: tool({
		description: 'Insert a new outgoing message. Timestamp is set automatically. Returns { id }.',
		inputSchema: valibotSchema(insertOutgoingMessageInputSchema),
		execute: async (input: InsertOutgoingMessageInput) => {
			return withToolError('insert_outgoing_message', () => {
				const result = insertOutgoingMessage({
					...input,
					parentActionableId: input.parentActionableId as ActionableId | undefined,
					parentMessageId: input.parentMessageId as MessageId | undefined
				});
				return { id: result.id };
			});
		}
	}),

	update_outgoing_message: tool({
		description:
			'Update an existing outgoing message by id. Sent messages cannot be edited. Timestamp is managed automatically.',
		inputSchema: valibotSchema(updateOutgoingMessageInputSchema),
		execute: async (input: UpdateOutgoingMessageInput) => {
			return withToolError('update_outgoing_message', () => {
				const { id, ...patch } = input;
				const result = updateOutgoingMessage(id as OutgoingMessageId, {
					...patch,
					parentActionableId: patch.parentActionableId as ActionableId | undefined,
					parentMessageId: patch.parentMessageId as MessageId | undefined
				});
				return { id: result.id };
			});
		}
	}),

	update_briefing: tool({
		description: 'Update daily briefing markdown only. Timestamp is managed automatically.',
		inputSchema: valibotSchema(updateBriefingInputSchema),
		execute: async (input: UpdateBriefingInput) => {
			return withToolError('update_briefing', () => updateBriefing(input.markdown));
		}
	})
};
