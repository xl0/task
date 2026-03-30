<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { Actionable } from '$lib/types';

	let { actionable }: { actionable: Actionable } = $props();

	const linkedMessages = $derived(
		actionable.messageIds.map((id) => workspace.getMessage(id)).filter((m) => m !== undefined)
	);

	const priorityVariant: Record<string, string> = {
		high: 'bg-destructive/10 text-destructive border-destructive/20',
		medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
	};
</script>

<div class="flex flex-col gap-1 border-b border-border px-6 py-4">
	<div class="flex items-center gap-2">
		<h2 class="flex-1 text-base font-semibold">{actionable.title}</h2>
		{#if actionable.priority !== 'low'}
			<Badge variant="outline" class="shrink-0 text-xs {priorityVariant[actionable.priority]}">
				{actionable.priority}
			</Badge>
		{/if}
		{#if actionable.status === 'done'}
			<Badge variant="secondary" class="shrink-0 text-xs">done</Badge>
		{/if}
	</div>
	<p class="text-sm text-muted-foreground">{actionable.summary}</p>
</div>
<ScrollArea class="flex-1 overflow-hidden">
	<div class="flex flex-col gap-4 px-6 py-4">
		{#if linkedMessages.length > 0}
			<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				Related messages
			</h3>
			{#each linkedMessages as msg (msg.id)}
				<a
					href={resolve('/inbox/[id]', { id: msg.id })}
					class="flex flex-col gap-1 border border-border p-3 no-underline transition-colors hover:bg-accent/50"
				>
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">{msg.senderName}</span>
						{#if msg.subject}
							<span class="text-xs text-muted-foreground">&middot; {msg.subject}</span>
						{/if}
					</div>
					<p class="line-clamp-2 text-xs text-muted-foreground">{msg.summary}</p>
				</a>
			{/each}
		{/if}
	</div>
</ScrollArea>
