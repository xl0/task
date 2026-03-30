<script lang="ts">
	import { agentChat } from '$lib/stores/agent-chat.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import XIcon from '@lucide/svelte/icons/x';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	function onKeydown(event: KeyboardEvent) {
		if (event.code !== 'Backquote') return;
		event.preventDefault();
		agentChat.toggleConsole();
	}

	function formatTime(iso: string) {
		return new Date(iso).toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function formatDetails(details: unknown) {
		if (details === undefined) return '';
		try {
			return JSON.stringify(details, null, 2);
		} catch {
			return String(details);
		}
	}

	function formatTokens(tokens: { input: number; output: number; cachedInput: number }) {
		return `${tokens.input}/${tokens.output}/${tokens.cachedInput}`;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="pointer-events-none fixed inset-x-0 top-0 z-[70] transition-transform duration-200 ease-out {agentChat.isConsoleOpen
		? 'translate-y-0'
		: '-translate-y-[calc(100%+1px)]'}"
>
	<div
		class="pointer-events-auto flex h-[42vh] min-h-[280px] flex-col border-b border-border bg-background/98 shadow-lg backdrop-blur"
	>
		<div class="flex items-center justify-between border-b border-border px-3 py-2">
			<div class="flex items-center gap-2 text-xs font-medium">
				<TerminalIcon class="size-3.5" />
				<span>Agent Console</span>
				<span class="text-muted-foreground">~</span>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="sm" class="gap-1.5" onclick={agentChat.clearLogs}>
					<Trash2Icon class="size-3" />
					Clear logs
				</Button>
				<Button variant="ghost" size="icon-sm" onclick={() => (agentChat.isConsoleOpen = false)}>
					<XIcon class="size-3" />
				</Button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-3 font-mono text-xs">
			{#if agentChat.logs.length === 0}
				<p class="text-muted-foreground">No agent logs yet.</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each [...agentChat.logs].reverse() as log (log.id)}
						<details class="border border-border bg-muted/20">
							<summary class="flex cursor-pointer items-center gap-2 px-2 py-1.5">
								<span class="text-muted-foreground tabular-nums">{formatTime(log.timestamp)}</span>
								<span class="border border-border px-1 uppercase">{log.kind}</span>
								<span class="flex-1 truncate">{log.title}</span>
								{#if log.tokens}
									<span class="text-[10px] text-muted-foreground"
										>tok {formatTokens(log.tokens)}</span
									>
								{/if}
							</summary>
							{#if log.details !== undefined}
								<pre
									class="overflow-x-auto border-t border-border bg-background px-2 py-2">{formatDetails(
										log.details
									)}</pre>
							{/if}
						</details>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
