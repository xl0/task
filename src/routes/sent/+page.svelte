<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import DailyBriefDetail from '$lib/components/DailyBriefDetail.svelte';

	const briefing = $derived(workspace.briefing);
</script>

{#if briefing}
	<DailyBriefDetail {briefing} />
{:else}
	<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
		Select a sent message
	</div>
{/if}
