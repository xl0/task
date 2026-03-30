<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import type { OutgoingMessageId } from '$lib/types';

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}

	const selectedOutgoingMessageId = $derived.by((): OutgoingMessageId | null => {
		const match = page.url.pathname.match(/^\/sent\/(o\d+)$/);
		return match ? (match[1] as OutgoingMessageId) : null;
	});

	const sentMessages = $derived(workspace.getOutgoingMessages(true));
</script>

<div class="px-4 py-3">
	<h2 class="text-sm font-semibold">Sent</h2>
</div>

<ScrollArea class="flex-1 overflow-hidden border-t border-border">
	{#each sentMessages as msg (msg.id)}
		{@const isSelected = selectedOutgoingMessageId === msg.id}
		<a
			href={resolve('/sent/[id]', { id: msg.id })}
			class="flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left no-underline transition-colors hover:bg-accent/50
				{isSelected ? 'bg-accent' : ''}"
		>
			<div class="flex items-center gap-2">
				<span class="flex-1 truncate text-sm font-medium">{msg.subject ?? 'Sent message'}</span>
				{#if msg.createdAt}
					<span class="shrink-0 text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
				{/if}
			</div>
			<span class="truncate text-xs text-muted-foreground"
				>To {msg.recipient ?? 'recipient unknown'}</span
			>
		</a>
	{/each}
	{#if sentMessages.length === 0}
		<div class="flex items-center justify-center p-8 text-sm text-muted-foreground">
			No sent messages
		</div>
	{/if}
</ScrollArea>
