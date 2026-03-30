<script lang="ts" generics="T">
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import type { Snippet } from 'svelte';

	let {
		items,
		compact = false,
		item,
		getKey
	}: {
		items: T[];
		compact?: boolean;
		item: Snippet<[T]>;
		getKey?: (entry: T, index: number) => string | number;
	} = $props();
</script>

<ScrollArea
	class={compact
		? 'ml-3 h-full min-h-0 overflow-hidden border-l border-border/60'
		: 'flex-1 overflow-hidden border-t border-border'}
>
	{#if items.length === 0}
		<div class="flex items-center justify-center p-8 text-sm text-muted-foreground">Empty</div>
	{:else}
		{#each items as entry, index (getKey ? getKey(entry, index) : index)}
			{@render item(entry)}
		{/each}
	{/if}
</ScrollArea>
