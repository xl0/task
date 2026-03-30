<script lang="ts">
	import { agentChat } from '$lib/stores/agent-chat.svelte';
	import { devStore } from '$lib/stores/dev-store.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let prompt = $state('');
	let endEl: HTMLDivElement;

	const canSend = $derived(prompt.trim().length > 0 && !agentChat.isLoading);

	$effect(() => {
		agentChat.messages.length;
		agentChat.isLoading;

		queueMicrotask(() => {
			endEl?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		});
	});

	function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		const text = prompt.trim();
		if (!text) return;
		prompt = '';
		agentChat.sendMessage(text);
	}

	function formatJson(value: unknown) {
		if (value === undefined) return 'undefined';
		if (value === null) return 'null';
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}
</script>

<section class="px-6 py-4">
	<div class="mb-3 flex items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<SparklesIcon class="size-4 text-muted-foreground" />
			<div class="flex flex-col gap-0.5">
				<h2 class="text-sm font-semibold">Workspace Agent</h2>
				<p class="text-xs text-muted-foreground">
					{devStore.provider} / {devStore.model}
				</p>
			</div>
		</div>
		<Button variant="outline" size="sm" class="gap-1.5" onclick={agentChat.clearMessages}>
			<PlusIcon class="size-3" />
			New chat
		</Button>
	</div>

	<div class="mx-auto flex w-full max-w-3xl flex-col gap-3">
		{#each agentChat.messages as message (message.id)}
			{#if message.kind === 'tool'}
				<div class="flex justify-start">
					<article class="max-w-[95%] border border-border bg-muted/20 px-3 py-2 text-xs">
						<div class="mb-1 flex items-center gap-2">
							<span class="font-medium">Tool: {message.toolName}</span>
							{#if message.step !== null}
								<span class="text-muted-foreground">step {message.step}</span>
							{/if}
							<span class="text-muted-foreground">{message.durationMs.toFixed(2)}ms</span>
							<span class={message.success ? 'text-muted-foreground' : 'text-destructive'}>
								{message.success ? 'ok' : 'error'}
							</span>
						</div>

						<details>
							<summary class="cursor-pointer text-[11px] text-muted-foreground">
								input/output
							</summary>
							<div class="mt-2 flex flex-col gap-2">
								<div>
									<p class="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
										input
									</p>
									<pre
										class="overflow-x-auto border border-border bg-background px-2 py-1 break-words whitespace-pre-wrap">{formatJson(
											message.input
										)}</pre>
								</div>

								<div>
									<p class="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
										{message.success ? 'output' : 'error'}
									</p>
									<pre
										class="overflow-x-auto border border-border bg-background px-2 py-1 break-words whitespace-pre-wrap">{formatJson(
											message.success ? message.output : message.error
										)}</pre>
								</div>
							</div>
						</details>
					</article>
				</div>
			{:else}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
					<article
						class="max-w-[85%] border px-3 py-2 text-sm whitespace-pre-wrap {message.role === 'user'
							? 'border-primary bg-primary text-primary-foreground'
							: message.error
								? 'border-destructive/30 bg-destructive/5 text-destructive'
								: 'border-border bg-background text-foreground'}"
					>
						{message.content}
					</article>
				</div>
			{/if}
		{/each}

		{#if agentChat.isLoading}
			<p class="text-xs text-muted-foreground">Running agent...</p>
		{/if}

		<div bind:this={endEl}></div>
	</div>

	<form class="mt-4 mr-auto w-full max-w-3xl" onsubmit={onSubmit}>
		<div class="flex items-baseline gap-2">
			<Input
				disabled={agentChat.isLoading}
				placeholder="Ask the agent to triage and update workspace"
				bind:value={prompt}
			/>
			<Button type="submit" size="sm" disabled={!canSend}>
				{agentChat.isLoading ? 'Running' : 'Send'}
			</Button>
		</div>
	</form>
</section>
