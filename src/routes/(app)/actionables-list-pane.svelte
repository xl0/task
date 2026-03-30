<script lang="ts">
	import { page } from '$app/stores';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import type { Actionable, ActionableId } from '$lib/types';

	let {
		action,
		title
	}: {
		action: Actionable['action'];
		title: string;
	} = $props();

	const selectedActionableId = $derived.by((): ActionableId | null => {
		const match = $page.url.pathname.match(/^\/(decide|delegate|ignore)\/(a\d+)$/);
		return match ? (match[2] as ActionableId) : null;
	});

	const actionables = $derived(workspace.getActionablesByAction(action));

	const priorityVariant: Record<string, string> = {
		high: 'bg-destructive/10 text-destructive border-destructive/20',
		medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
	};
</script>

<div class="px-4 py-3">
	<h2 class="text-sm font-semibold">{title}</h2>
</div>

<ScrollArea class="flex-1 overflow-hidden border-t border-border">
	{#each actionables as act (act.id)}
		{@const isSelected = selectedActionableId === act.id}
		<a
			href="/{act.action}/{act.id}"
			class="flex w-full flex-col gap-1.5 border-b border-border px-4 py-3 text-left no-underline transition-colors hover:bg-accent/50
				{isSelected ? 'bg-accent' : ''}
				{act.status === 'done' ? 'opacity-50' : ''}"
		>
			<div class="flex items-center gap-2">
				<span class="flex-1 truncate text-sm font-medium">{act.title}</span>
				{#if act.priority !== 'low'}
					<Badge variant="outline" class="h-5 shrink-0 text-[10px] {priorityVariant[act.priority]}">
						{act.priority}
					</Badge>
				{/if}
			</div>
			<span class="truncate text-xs text-muted-foreground">{act.summary}</span>
			{#if act.messageIds.length > 0}
				<span class="text-xs text-muted-foreground"
					>{act.messageIds.length} message{act.messageIds.length > 1 ? 's' : ''}</span
				>
			{/if}
		</a>
	{/each}
	{#if actionables.length === 0}
		<div class="flex items-center justify-center p-8 text-sm text-muted-foreground">
			No actionables
		</div>
	{/if}
</ScrollArea>
