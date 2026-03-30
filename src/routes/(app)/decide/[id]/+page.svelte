<script lang="ts">
	import { page } from '$app/stores';
	import { workspace } from '$lib/stores/workspace.svelte';
	import ActionableDetail from '$lib/components/actionable-detail.svelte';
	import type { ActionableId } from '$lib/types';

	const actionableId = $derived($page.params.id as ActionableId);
	const actionable = $derived(workspace.getActionable(actionableId) ?? null);
</script>

{#if actionable}
	<ActionableDetail {actionable} />
{:else}
	<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
		Actionable not found
	</div>
{/if}
