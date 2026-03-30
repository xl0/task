import { generateText, generateObject, stepCountIs, type ModelMessage } from 'ai';
import { valibotSchema } from '@ai-sdk/valibot';
import * as v from 'valibot';
import { workspaceTools } from '$lib/agent/workspace-tools';
import { listMessages, listActionables, listOutgoingMessages } from '$lib/agent/workspace-ops';
import { devStore, type Provider } from '$lib/stores/dev-store.svelte';
import { createProviderModel } from '$lib/ai/model-factory';
import { workspace } from '$lib/stores/workspace.svelte';
import type { Message, MessageId } from '$lib/types';

// --- Prompts ---

const CHAT_SYSTEM = `You are an operational inbox assistant for the Innate workspace.
Use tools to read and update workspace state when needed.
Prefer checking existing items before writing.
Keep responses concise and practical.`;

const AGENT_LOOP_SYSTEM = `You are an operational inbox assistant for the CEO's Innate workspace.
Your current workspace state has been pre-loaded via tool results below — use it directly, do not re-read unless verifying a change you just made.

Use workspace tools to create/update actionables, draft outgoing messages, and generate a daily briefing.`;

const AGENT_LOOP_PROMPT = `Process the inbox and produce triage artifacts aligned with the Developer Brief.

Data model contract (must hold at the end):
- Messages are raw inbound communications (email/slack/whatsapp).
- Actionables are your triage decisions over one or more messages.
  - action = ignore | delegate | decide
  - messageIds = all source messages that justify that decision
- Outgoing messages are drafted/sent responses and handoffs.
  - Most outgoings should be tied to an actionable via parentActionableId.
  - Use parentMessageId when replying to a specific inbound message/thread.
- Briefing is the CEO-facing synthesis of the current state, not a message dump.

Requirements:
1) Classify every message exactly once through actionables (no uncovered message ids).
2) Group related messages into one actionable when they are about the same topic/event.
3) Catch traps and context changes; later messages can override earlier assumptions.
4) Detect scheduling risk: deadlines, meeting conflicts, and urgent time windows.
5) Delegate items must name a specific person from context (no generic owner).
6) Draft responses must match channel tone and be concise:
   - email: professional and structured
   - slack: concise and direct
   - whatsapp: conversational
7) Channel selection: default to the original inbound channel when replying to a specific message.
   - If parentMessageId is set, outgoing.channel should usually match that message's channel.
   - Only switch channels when there is a clear operational reason (and reflect that in actionable.summary).

Ground rules:
- Ignore spam and phishing.
- Ignore personal emails.
- Be conservative with priority.
- Delegate tasks as much as possible possible.
- Update existing actionables/outgoings when appropriate; do not duplicate parallel records.

Execution:
- Create/update actionables so every message id is represented.
- actionable.summary must explain why the classification is correct and what should happen next.
- For delegate/decide actionables, create/update drafts with insert_outgoing_message/update_outgoing_message
  (sent=false, parentActionableId set, parentMessageId when relevant).
- Ignore actionables can omit outgoing drafts when no response is needed.
- Write the daily briefing with update_briefing:
  - one page / under 2 minutes to read
  - concrete recommendations and notable risks
  - no raw message ids
  - optional markdown links to actionables are allowed: [text here](/decide/a123), /delegate/a123, /ignore/a123

Before finishing, verify consistency:
- no message left unclassified
- no contradictory actionables for the same message cluster
- Links point to valid parent records.
- briefing matches the latest actionable state
`;

// --- Summary generation ---

const summarySchema = valibotSchema(
	v.strictObject({
		summary: v.pipe(v.string(), v.minLength(1), v.maxLength(180))
	})
);

function summaryPrompt(msg: Message): string {
	return [
		`Channel: ${msg.channel}`,
		`Sender: ${msg.senderName}`,
		msg.subject ? `Subject: ${msg.subject}` : null,
		msg.channelName ? `Channel name: ${msg.channelName}` : null,
		`Received at: ${msg.receivedAt}`,
		'Message body:',
		msg.text
	]
		.filter(Boolean)
		.join('\n');
}

// --- Workspace preloading ---

function toPlain<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function buildPreloadMessages(): ModelMessage[] {
	const reads = [
		{ id: 'pre-msgs', name: 'get_messages', result: toPlain(listMessages()) },
		{ id: 'pre-acts', name: 'get_actionables', result: toPlain(listActionables()) },
		{ id: 'pre-out', name: 'get_outgoing_messages', result: toPlain(listOutgoingMessages()) },
		{ id: 'pre-brief', name: 'get_briefing', result: { item: toPlain(workspace.briefing) } }
	];

	const toolCalls: ModelMessage = {
		role: 'assistant',
		content: reads.map((r) => ({
			type: 'tool-call' as const,
			toolCallId: r.id,
			toolName: r.name,
			input: {}
		}))
	};

	const toolResults: ModelMessage = {
		role: 'tool',
		content: reads.map((r) => ({
			type: 'tool-result' as const,
			toolCallId: r.id,
			toolName: r.name,
			output: { type: 'json' as const, value: r.result }
		}))
	};

	return [toolCalls, toolResults];
}

// --- Helpers ---

function toSerializable(value: unknown): unknown {
	if (value === undefined) return undefined;
	try {
		return JSON.parse(JSON.stringify($state.snapshot(value as object)));
	} catch {
		if (value instanceof Error) {
			return { name: value.name, message: value.message, stack: value.stack };
		}
		return { message: String(value) };
	}
}

type TokenStats = { input: number; output: number; cachedInput: number };

function usageToTokens(u: {
	inputTokens?: number;
	outputTokens?: number;
	cachedInputTokens?: number;
}): TokenStats {
	return {
		input: u.inputTokens ?? 0,
		output: u.outputTokens ?? 0,
		cachedInput: u.cachedInputTokens ?? 0
	};
}

function buildSystemMessage(provider: Provider, prompt: string): ModelMessage {
	if (provider === 'anthropic') {
		return {
			role: 'system',
			content: prompt,
			providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } }
		};
	}
	return { role: 'system', content: prompt };
}

// --- Types ---

type AgentTextMessage = {
	kind: 'text';
	id: string;
	role: 'user' | 'assistant';
	content: string;
	createdAt: string;
	error?: boolean;
};

type AgentToolMessage = {
	kind: 'tool';
	id: string;
	role: 'tool';
	toolName: string;
	step: number | null;
	durationMs: number;
	input: unknown;
	output: unknown;
	error: unknown;
	success: boolean;
	createdAt: string;
};

export type AgentChatMessage = AgentTextMessage | AgentToolMessage;

type AgentLogEntry = {
	id: string;
	timestamp: string;
	kind: 'info' | 'llm' | 'tool' | 'error';
	title: string;
	tokens?: TokenStats;
	details?: unknown;
};

// --- State ---

export class AgentChatState {
	messages = $state<AgentChatMessage[]>([]);
	logs = $state<AgentLogEntry[]>([]);
	isLoading = $state(false);
	isConsoleOpen = $state(false);

	#chatHistory: ModelMessage[] = [];

	clearMessages = () => {
		this.messages = [];
		this.#chatHistory = [];
		this.#appendLog({ kind: 'info', title: 'Started new chat' });
	};

	clearLogs = () => {
		this.logs = [];
	};

	toggleConsole = () => {
		this.isConsoleOpen = !this.isConsoleOpen;
	};

	// --- Agent loop (separate from chat) ---

	runMainLoop = async () => {
		if (this.isLoading) return;

		if (!devStore.apiKey.trim()) {
			this.#appendAssistantMessage('Set an API key in Dev Panel first.', true);
			return;
		}

		if (workspace.messages.length === 0) {
			this.#appendAssistantMessage('No messages to process. Import messages first.', true);
			return;
		}

		this.messages = [];
		workspace.setActionables([]);
		workspace.setOutgoingMessages([]);
		workspace.setBriefing(null);

		this.#appendLog({
			kind: 'info',
			title: 'Starting agent loop',
			details: { messageCount: workspace.messages.length }
		});

		this.#appendUserMessage('Run morning inbox loop');

		try {
			// Step 1: ensure all messages have summaries
			await this.#ensureSummaries();
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Summary generation failed';
			this.#appendAssistantMessage(msg, true);
			this.#appendLog({ kind: 'error', title: 'Summary generation failed', details: { msg } });
			return;
		}

		// Step 2: preload workspace state and run agent
		const preload = buildPreloadMessages();
		await this.#runGenerate(
			AGENT_LOOP_SYSTEM,
			[...preload, { role: 'user', content: AGENT_LOOP_PROMPT }],
			120
		);
	};

	// --- Interactive chat ---

	sendMessage = async (text: string) => {
		const content = text.trim();
		if (!content || this.isLoading) return;

		this.#appendUserMessage(content);

		if (!devStore.apiKey.trim()) {
			this.#appendAssistantMessage('Set an API key in Dev Panel first.', true);
			return;
		}

		const messages: ModelMessage[] = [...this.#chatHistory, { role: 'user', content }];
		const result = await this.#runGenerate(CHAT_SYSTEM, messages, 20);

		if (result) {
			this.#chatHistory = [
				...this.#chatHistory,
				{ role: 'user', content },
				...result.response.messages
			];
		}
	};

	// --- Core generate ---

	async #runGenerate(systemPrompt: string, messages: ModelMessage[], maxSteps: number) {
		const provider = devStore.provider;
		const model = devStore.model;
		const apiKey = devStore.apiKey.trim();

		this.isLoading = true;
		this.#appendLog({ kind: 'info', title: 'LLM request', details: { provider, model } });

		try {
			const result = await generateText({
				model: createProviderModel(provider, model, apiKey),
				messages: [buildSystemMessage(provider, systemPrompt), ...messages],
				tools: workspaceTools,
				stopWhen: stepCountIs(maxSteps),
				experimental_onToolCallFinish: (event) => {
					const { toolCall, durationMs, stepNumber, success } = event;
					const step = stepNumber !== undefined ? stepNumber + 1 : null;

					this.#appendToolMessage({
						toolName: toolCall.toolName,
						step,
						durationMs,
						input: toolCall.input,
						success,
						output: success ? event.output : null,
						error: success ? null : event.error
					});

					this.#appendLog({
						kind: 'tool',
						title: toolCall.toolName,
						details: {
							step,
							durationMs,
							input: toolCall.input,
							success,
							output: success ? event.output : null,
							error: success ? null : event.error
						}
					});
				},
				onStepFinish: (step) => {
					const tokens = usageToTokens(step.usage);
					this.#appendLog({
						kind: 'llm',
						title: `Step ${step.stepNumber + 1}`,
						tokens,
						details: {
							tokens: [tokens.input, tokens.output, tokens.cachedInput],
							finishReason: step.finishReason
						}
					});
				}
			});

			const reply = result.text.trim() || 'Done.';
			this.#appendAssistantMessage(reply);

			const totalTokens = usageToTokens(result.totalUsage);
			this.#appendLog({
				kind: 'llm',
				title: 'LLM complete',
				tokens: totalTokens,
				details: {
					tokens: [totalTokens.input, totalTokens.output, totalTokens.cachedInput],
					finishReason: result.finishReason,
					steps: result.steps.length
				}
			});

			return result;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Request failed';
			this.#appendAssistantMessage(message, true);
			this.#appendLog({ kind: 'error', title: 'LLM error', details: { message } });
			return null;
		} finally {
			this.isLoading = false;
		}
	}

	// --- Summary generation ---

	async #ensureSummaries() {
		const unsummarized = workspace.messages.filter((m) => !m.summary?.trim());
		if (unsummarized.length === 0) return;

		const provider = devStore.provider;
		const summaryModelId = devStore.cheapModel;
		const apiKey = devStore.apiKey.trim();
		if (!apiKey) throw new Error('API key required to generate summaries.');

		this.#appendAssistantMessage(`Generating AI summaries for ${unsummarized.length} messages...`);
		this.#appendLog({
			kind: 'info',
			title: `Generating summaries for ${unsummarized.length} messages`,
			details: { provider, model: summaryModelId }
		});

		const model = createProviderModel(provider, summaryModelId, apiKey);
		const summaryMap = new Map<MessageId, string>();
		let done = 0;

		await Promise.all(
			unsummarized.map(async (msg) => {
				const { object } = await generateObject({
					model,
					schema: summarySchema,
					system:
						'Write concise inbox summaries. One sentence, 8-20 words, focused on the key request, risk, or decision.',
					prompt: summaryPrompt(msg),
					temperature: 0.1,
					maxOutputTokens: 80
				});
				const normalized = object.summary.replace(/\s+/g, ' ').trim();
				if (!normalized) throw new Error(`Empty summary returned for ${msg.id}`);
				summaryMap.set(msg.id, normalized);
				this.#appendLog({
					kind: 'info',
					title: `Summary ${++done}/${unsummarized.length}: ${msg.id}`,
					details: { summary: normalized }
				});
			})
		);

		workspace.setMessages(
			workspace.messages.map((m) =>
				summaryMap.has(m.id) ? { ...m, summary: summaryMap.get(m.id) } : m
			)
		);

		this.#appendAssistantMessage(`Generated ${unsummarized.length} summaries.`);
		this.#appendLog({ kind: 'info', title: `Generated ${unsummarized.length} summaries` });
	}

	// --- Message helpers ---

	#appendUserMessage(content: string) {
		this.messages = [
			...this.messages,
			{
				kind: 'text',
				id: crypto.randomUUID(),
				role: 'user',
				content,
				createdAt: new Date().toISOString()
			}
		];
	}

	#appendAssistantMessage(content: string, error = false) {
		this.messages = [
			...this.messages,
			{
				kind: 'text',
				id: crypto.randomUUID(),
				role: 'assistant',
				content,
				createdAt: new Date().toISOString(),
				error
			}
		];
	}

	#appendToolMessage(args: {
		toolName: string;
		step: number | null;
		durationMs: number;
		input: unknown;
		success: boolean;
		output: unknown;
		error: unknown;
	}) {
		this.messages = [
			...this.messages,
			{
				kind: 'tool',
				id: crypto.randomUUID(),
				role: 'tool',
				toolName: args.toolName,
				step: args.step,
				durationMs: args.durationMs,
				input: toSerializable(args.input),
				output: toSerializable(args.output),
				error: toSerializable(args.error),
				success: args.success,
				createdAt: new Date().toISOString()
			}
		];
	}

	#appendLog(log: Omit<AgentLogEntry, 'id' | 'timestamp'>) {
		const next = [
			...this.logs,
			{
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				...log,
				details: toSerializable(log.details)
			}
		];
		this.logs = next.length > 300 ? next.slice(-300) : next;
	}
}

export const agentChat = new AgentChatState();
