import { PersistedState } from 'runed';

export type Provider = 'openrouter' | 'anthropic' | 'openai' | 'google';

export const PROVIDERS: { id: Provider; label: string; placeholder: string }[] = [
	{ id: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-v1-...' },
	{ id: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
	{ id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
	{ id: 'google', label: 'Google', placeholder: 'AIza...' }
];

export const MODELS: Record<Provider, string[]> = {
	openrouter: [
		'anthropic/claude-sonnet-4.6',
		'anthropic/claude-opus-4.6',
		'openai/gpt-5.4',
		'openai/gpt-5.4-mini',
		'google/gemini-3.1-pro-preview',
		'google/gemini-3-flash-preview'
	],
	anthropic: ['claude-sonnet-4-6-20250627', 'claude-opus-4-6-20250624'],
	openai: ['gpt-5.4', 'gpt-5.4-mini'],
	google: ['gemini-2.5-pro', 'gemini-2.5-flash']
};

class DevStore {
	#provider = new PersistedState<Provider>('dev-provider', 'openrouter');
	#model = new PersistedState<string>('dev-model', MODELS.openrouter[0]);
	#apiKey = new PersistedState<string>('dev-api-key', '');

	get provider(): Provider {
		return this.#provider.current;
	}

	set provider(value: Provider) {
		this.#provider.current = value;
		// Reset model to first available for new provider
		const models = MODELS[value];
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
		return MODELS[this.provider];
	}

	get providerConfig() {
		return PROVIDERS.find((p) => p.id === this.provider)!;
	}
}

export const devStore = new DevStore();
