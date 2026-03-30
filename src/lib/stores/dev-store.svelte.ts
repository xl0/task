import { PersistedState } from 'runed';

export type Provider = 'openrouter' | 'anthropic' | 'openai' | 'google';
export type ModelOption = { id: string; cheap?: boolean };

export const PROVIDERS: { id: Provider; label: string; placeholder: string }[] = [
	{ id: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-v1-...' },
	{ id: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
	{ id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
	{ id: 'google', label: 'Google', placeholder: 'AIza...' }
];

export const MODELS: Record<Provider, ModelOption[]> = {
	openrouter: [
		{ id: 'anthropic/claude-sonnet-4.6' },
		{ id: 'anthropic/claude-opus-4.6' },
		{ id: 'openai/gpt-5.4' },
		{ id: 'openai/gpt-5.4-mini', cheap: true },
		{ id: 'google/gemini-3.1-pro-preview' },
		{ id: 'google/gemini-3-flash-preview' }
	],
	anthropic: [
		{ id: 'claude-haiku-4-5', cheap: true },
		{ id: 'claude-sonnet-4-6' },
		{ id: 'claude-opus-4-6' }
	],
	openai: [{ id: 'gpt-5.4' }, { id: 'gpt-5.4-mini', cheap: true }],
	google: [{ id: 'gemini-2.5-pro' }, { id: 'gemini-2.5-flash', cheap: true }]
};

function modelIds(provider: Provider): string[] {
	return MODELS[provider].map((model) => model.id);
}

function cheapModelId(provider: Provider): string {
	return MODELS[provider].find((model) => model.cheap)?.id ?? MODELS[provider][0].id;
}

class DevStore {
	#provider = new PersistedState<Provider>('dev-provider', 'openai');
	#model = new PersistedState<string>('dev-model', modelIds('openai')[0]);
	#apiKey = new PersistedState<string>('dev-api-key', '');

	get provider(): Provider {
		return this.#provider.current;
	}

	set provider(value: Provider) {
		this.#provider.current = value;
		// Reset model to first available for new provider
		const models = modelIds(value);
		if (!models.includes(this.#model.current)) {
			this.#model.current = models[0];
		}
	}

	get model(): string {
		return this.#model.current;
	}

	set model(value: string) {
		this.#model.current = value;
	}

	get apiKey(): string {
		return this.#apiKey.current;
	}

	set apiKey(value: string) {
		this.#apiKey.current = value;
	}

	get models(): string[] {
		return modelIds(this.provider);
	}

	get cheapModel(): string {
		return cheapModelId(this.provider);
	}

	get providerConfig() {
		return PROVIDERS.find((p) => p.id === this.provider)!;
	}
}

export const devStore = new DevStore();
