<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import DailyBriefDetail from '$lib/components/DailyBriefDetail.svelte';
	import AgentChatDetail from '$lib/components/AgentChatDetail.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	const briefing = $derived(workspace.briefing);
</script>

<div class="h-full overflow-y-auto">
	{#if briefing}
		<DailyBriefDetail {briefing} />
	{:else}
		<div class="px-6 py-5 text-sm text-muted-foreground">No daily brief yet</div>
	{/if}

	<Separator />

	<AgentChatDetail />
</div>
