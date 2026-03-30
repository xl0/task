import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { Provider } from '$lib/stores/dev-store.svelte';

export function createProviderModel(provider: Provider, modelId: string, apiKey: string) {
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
