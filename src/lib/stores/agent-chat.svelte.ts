import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, stepCountIs, type ModelMessage } from 'ai';
import { workspaceTools } from '$lib/agent/workspace-tools';
import { devStore, type Provider } from '$lib/stores/dev-store.svelte';

const SYSTEM_PROMPT = `You are an operational inbox assistant for the Innate workspace.

Use tools to read and update workspace state when needed.
Prefer checking existing items before writing.
Keep responses concise and practical.`;

type ChatRole = 'user' | 'assistant';

type AgentTextMessage = {
	kind: 'text';
	id: string;
	role: ChatRole;
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

type AgentChatMessage = AgentTextMessage | AgentToolMessage;

type TokenStats = {
	input: number;
	output: number;
	cachedInput: number;
};

type AgentLogEntry = {
	id: string;
	timestamp: string;
	kind: 'info' | 'llm' | 'tool' | 'error';
	title: string;
	tokens?: TokenStats;
	details?: unknown;
};

function toSerializable(value: unknown): unknown {
	if (value === undefined) return undefined;

	try {
		return JSON.parse(JSON.stringify($state.snapshot(value as any)));
	} catch {
		if (value instanceof Error) {
			return {
				name: value.name,
				message: value.message,
				stack: value.stack
			};
		}

		return { message: String(value) };
	}
}

function usageToTokens(usage: {
	inputTokens?: number;
	outputTokens?: number;
	cachedInputTokens?: number;
}): TokenStats {
	return {
		input: usage.inputTokens ?? 0,
		output: usage.outputTokens ?? 0,
		cachedInput: usage.cachedInputTokens ?? 0
	};
}

function createModel(provider: Provider, modelId: string, apiKey: string) {
	switch (provider) {
		case 'openrouter': {
			const openrouter = createOpenAI({
				name: 'openrouter',
				baseURL: 'https://openrouter.ai/api/v1',
				apiKey,
				headers: {
					'HTTP-Referer': 'http://localhost:5173',
					'X-Title': 'Innate'
				}
			});
			return openrouter(modelId);
		}
		case 'anthropic':
			return createAnthropic({ apiKey })(modelId);
		case 'openai':
			return createOpenAI({ apiKey })(modelId);
		case 'google':
			return createGoogleGenerativeAI({ apiKey })(modelId);
	}
}

function buildSystemMessage(provider: Provider): ModelMessage {
	if (provider === 'anthropic') {
		return {
			role: 'system',
			content: SYSTEM_PROMPT,
			providerOptions: {
				anthropic: {
					cacheControl: { type: 'ephemeral' }
				}
			}
		};
	}

	return { role: 'system', content: SYSTEM_PROMPT };
}

export class AgentChatState {
	messages = $state<AgentChatMessage[]>([]);
	logs = $state<AgentLogEntry[]>([]);
	isLoading = $state(false);
	isConsoleOpen = $state(false);

	#history: ModelMessage[] = [];

	clearMessages = () => {
		this.messages = [];
		this.#history = [];
		this.#appendLog({
			kind: 'info',
			title: 'Started new chat',
			details: {}
		});
	};

	clearLogs = () => {
		this.logs = [];
	};

	toggleConsole = () => {
		this.isConsoleOpen = !this.isConsoleOpen;
	};

	sendMessage = async (raw: string) => {
		const content = raw.trim();
		if (!content || this.isLoading) return;

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

		const provider = devStore.provider;
		const model = devStore.model;
		const apiKey = devStore.apiKey.trim();

		if (!apiKey) {
			this.#appendAssistantMessage('Set an API key in Dev Panel first.', true);
			this.#appendLog({
				kind: 'error',
				title: 'Missing API key',
				details: { provider, model }
			});
			return;
		}

		this.isLoading = true;
		this.#appendLog({
			kind: 'info',
			title: 'LLM request',
			details: {
				provider,
				model,
				cache: provider === 'anthropic' ? 'anthropic cacheControl=ephemeral' : 'provider default'
			}
		});

		const requestMessages: ModelMessage[] = [
			buildSystemMessage(provider),
			...this.#history,
			{ role: 'user', content }
		];

		try {
			const result = await generateText({
				model: createModel(provider, model, apiKey),
				messages: requestMessages,
				tools: workspaceTools,
				stopWhen: stepCountIs(20),
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
							toolCallId: toolCall.toolCallId,
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
						title: `Step ${step.stepNumber + 1} ${step.model.provider}/${step.model.modelId}`,
						tokens,
						details: {
							inputText: content,
							outputText: step.text,
							tokens: [tokens.input, tokens.output, tokens.cachedInput],
							finishReason: step.finishReason,
							step: step.stepNumber + 1
						}
					});
				}
			});

			this.#history = [...this.#history, { role: 'user', content }, ...result.response.messages];

			const reply = result.text.trim().length > 0 ? result.text : 'Done.';
			this.#appendAssistantMessage(reply);
			const totalTokens = usageToTokens(result.totalUsage);

			this.#appendLog({
				kind: 'llm',
				title: 'LLM complete',
				tokens: totalTokens,
				details: {
					inputText: content,
					outputText: reply,
					tokens: [totalTokens.input, totalTokens.output, totalTokens.cachedInput],
					finishReason: result.finishReason,
					steps: result.steps.length,
					warnings: result.warnings
				}
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Chat request failed';
			this.#appendAssistantMessage(message, true);
			this.#appendLog({
				kind: 'error',
				title: 'LLM error',
				details: { message }
			});
		} finally {
			this.isLoading = false;
		}
	};

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
		this.logs = next.length > 300 ? next.slice(next.length - 300) : next;
	}
}

export const agentChat = new AgentChatState();
