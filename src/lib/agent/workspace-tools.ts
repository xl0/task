import { tool } from 'ai';
import { valibotSchema } from '@ai-sdk/valibot';
import * as v from 'valibot';
import { workspace } from '$lib/stores/workspace.svelte';
import {
	listActionables,
	listMessages,
	listOutgoingMessages,
	upsertActionable,
	upsertBriefing,
	upsertMessage,
	upsertOutgoingMessage
} from '$lib/agent/workspace-ops';
import type { ActionableId, MessageId, OutgoingMessageId } from '$lib/types';

const messageIdSchema = v.pipe(v.string(), v.regex(/^m\d+$/));
const actionableIdSchema = v.pipe(v.string(), v.regex(/^a\d+$/));
const outgoingMessageIdSchema = v.pipe(v.string(), v.regex(/^o\d+$/));
const channelSchema = v.picklist(['email', 'slack', 'whatsapp']);

const limitSchema = v.pipe(v.number(), v.integer(), v.minValue(1));
const offsetSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

const getMessagesInputSchema = v.object({
	id: v.optional(messageIdSchema),
	limit: v.optional(limitSchema),
	offset: v.optional(offsetSchema)
});

const getActionablesInputSchema = v.object({
	id: v.optional(actionableIdSchema),
	limit: v.optional(limitSchema),
	offset: v.optional(offsetSchema)
});

const getOutgoingInputSchema = v.object({
	id: v.optional(outgoingMessageIdSchema),
	limit: v.optional(limitSchema),
	offset: v.optional(offsetSchema)
});

const upsertMessageInputSchema = v.object({
	id: v.optional(messageIdSchema),
	channel: v.optional(channelSchema),
	senderName: v.optional(v.string()),
	subject: v.optional(v.string()),
	channelName: v.optional(v.string()),
	receivedAt: v.optional(v.string()),
	summary: v.optional(v.string()),
	text: v.optional(v.string()),
	read: v.optional(v.boolean()),
	order: v.optional(v.number())
});

const upsertActionableInputSchema = v.object({
	id: v.optional(actionableIdSchema),
	messageIds: v.optional(v.array(messageIdSchema)),
	outgoingMessageIds: v.optional(v.array(outgoingMessageIdSchema)),
	action: v.optional(v.picklist(['ignore', 'delegate', 'decide'])),
	title: v.optional(v.string()),
	summary: v.optional(v.string()),
	priority: v.optional(v.picklist(['low', 'medium', 'high'])),
	status: v.optional(v.picklist(['open', 'done']))
});

const upsertOutgoingMessageInputSchema = v.object({
	id: v.optional(outgoingMessageIdSchema),
	parentActionableId: v.optional(actionableIdSchema),
	parentMessageId: v.optional(messageIdSchema),
	recipient: v.optional(v.string()),
	subject: v.optional(v.string()),
	channel: v.optional(channelSchema),
	channelName: v.optional(v.string()),
	body: v.optional(v.string()),
	createdAt: v.optional(v.string()),
	sent: v.optional(v.boolean())
});

const upsertBriefingInputSchema = v.object({
	generatedAt: v.optional(v.string()),
	markdown: v.optional(v.string())
});

type GetMessagesInput = v.InferOutput<typeof getMessagesInputSchema>;
type GetActionablesInput = v.InferOutput<typeof getActionablesInputSchema>;
type GetOutgoingInput = v.InferOutput<typeof getOutgoingInputSchema>;
type UpsertMessageInput = v.InferOutput<typeof upsertMessageInputSchema>;
type UpsertActionableInput = v.InferOutput<typeof upsertActionableInputSchema>;
type UpsertOutgoingMessageInput = v.InferOutput<typeof upsertOutgoingMessageInputSchema>;
type UpsertBriefingInput = v.InferOutput<typeof upsertBriefingInputSchema>;

function normalizePagination(limit?: number, offset?: number) {
	return {
		limit: limit ?? 100,
		offset: offset ?? 0
	};
}

export const workspaceTools = {
	get_messages: tool({
		description:
			'Get one message by id, or paged messages when id is omitted. Defaults: limit=100, offset=0.',
		inputSchema: valibotSchema(getMessagesInputSchema),
		execute: async ({ id, limit, offset }: GetMessagesInput) => {
			if (id) {
				return { item: workspace.getMessage(id as MessageId) ?? null };
			}

			const page = normalizePagination(limit, offset);
			return listMessages(page.limit, page.offset);
		}
	}),

	get_actionables: tool({
		description:
			'Get one actionable by id, or paged actionables when id is omitted. Defaults: limit=100, offset=0.',
		inputSchema: valibotSchema(getActionablesInputSchema),
		execute: async ({ id, limit, offset }: GetActionablesInput) => {
			if (id) {
				return { item: workspace.getActionable(id as ActionableId) ?? null };
			}

			const page = normalizePagination(limit, offset);
			return listActionables(page.limit, page.offset);
		}
	}),

	get_outgoing_messages: tool({
		description:
			'Get one outgoing message by id, or paged outgoing messages when id is omitted. Defaults: limit=100, offset=0.',
		inputSchema: valibotSchema(getOutgoingInputSchema),
		execute: async ({ id, limit, offset }: GetOutgoingInput) => {
			if (id) {
				return { item: workspace.getOutgoingMessage(id as OutgoingMessageId) ?? null };
			}

			const page = normalizePagination(limit, offset);
			return listOutgoingMessages(page.limit, page.offset);
		}
	}),

	get_briefing: tool({
		description: 'Get current daily briefing.',
		inputSchema: valibotSchema(v.object({})),
		execute: async () => {
			return { item: workspace.briefing };
		}
	}),

	upsert_message: tool({
		description:
			'Create a message when id is omitted. Update only provided fields when id is set. On create returns { id }.',
		inputSchema: valibotSchema(upsertMessageInputSchema),
		execute: async (input: UpsertMessageInput) => {
			const result = upsertMessage({
				...input,
				id: input.id as MessageId | undefined
			});
			return { id: result.id };
		}
	}),

	upsert_actionable: tool({
		description:
			'Create an actionable when id is omitted. Update only provided fields when id is set. On create returns { id }.',
		inputSchema: valibotSchema(upsertActionableInputSchema),
		execute: async (input: UpsertActionableInput) => {
			const result = upsertActionable({
				...input,
				id: input.id as ActionableId | undefined,
				messageIds: input.messageIds as MessageId[] | undefined,
				outgoingMessageIds: input.outgoingMessageIds as OutgoingMessageId[] | undefined
			});
			return { id: result.id };
		}
	}),

	upsert_outgoing_message: tool({
		description:
			'Create an outgoing message when id is omitted. Update only provided fields when id is set. On create returns { id }.',
		inputSchema: valibotSchema(upsertOutgoingMessageInputSchema),
		execute: async (input: UpsertOutgoingMessageInput) => {
			const result = upsertOutgoingMessage({
				...input,
				id: input.id as OutgoingMessageId | undefined,
				parentActionableId: input.parentActionableId as ActionableId | undefined,
				parentMessageId: input.parentMessageId as MessageId | undefined
			});
			return { id: result.id };
		}
	}),

	upsert_briefing: tool({
		description:
			'Upsert daily briefing. Updates only provided fields. Returns { updated: true } on success.',
		inputSchema: valibotSchema(upsertBriefingInputSchema),
		execute: async (input: UpsertBriefingInput) => {
			return upsertBriefing(input);
		}
	})
};
