<script lang="ts">
	import { page } from '$app/state';
	import { workspace } from '$lib/stores/workspace.svelte';
	import OutgoingMessageDetail from '$lib/components/OutgoingMessageDetail.svelte';
	import type { OutgoingMessageId } from '$lib/types';

	const messageId = $derived(page.params.id as OutgoingMessageId);
	const message = $derived(workspace.getOutgoingMessage(messageId) ?? null);
</script>

{#if message && !message.sent}
	<OutgoingMessageDetail {message} editable={true} />
{:else}
	<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
		Draft not found
	</div>
{/if}
