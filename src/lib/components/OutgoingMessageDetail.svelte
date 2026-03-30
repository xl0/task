<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import OutgoingDraftEditor from '$lib/components/OutgoingDraftEditor.svelte';
	import type { OutgoingMessage, Channel } from '$lib/types';

	let {
		message,
		editable = false
	}: {
		message: OutgoingMessage;
		editable?: boolean;
	} = $props();

	const linkedActionable = $derived(
		message.parentActionableId ? workspace.getActionable(message.parentActionableId) : null
	);

	const linkedMessages = $derived(
		linkedActionable
			? linkedActionable.messageIds
					.map((id) => workspace.getMessage(id))
					.filter((msg) => msg !== undefined)
			: []
	);

	const channelLabel: Record<Channel, string> = {
		email: 'Email',
		slack: 'Slack',
		whatsapp: 'WhatsApp'
	};

	const destinationLabel = $derived.by(() => {
		if (message.channel === 'slack') {
			return message.channelName?.trim() || 'channel not set';
		}
		return message.recipient?.trim() || 'recipient not set';
	});
</script>

<div class="flex flex-col gap-1 border-b border-border px-6 py-4">
	<div class="flex items-center gap-2">
		<h2 class="flex-1 text-base font-semibold">{message.subject ?? 'Untitled message'}</h2>
		<Badge variant="secondary" class="shrink-0 text-xs">{editable ? 'draft' : 'sent'}</Badge>
		{#if message.channel}
			<Badge variant="outline" class="shrink-0 text-xs">{channelLabel[message.channel]}</Badge>
		{/if}
	</div>
	<p class="text-sm text-muted-foreground">
		{#if message.channel === 'slack'}
			In {destinationLabel}
		{:else}
			To {destinationLabel}
		{/if}
	</p>
	{#if linkedActionable}
		<p class="text-xs text-muted-foreground">
			From {linkedActionable.action} actionable: {linkedActionable.title}
		</p>
	{/if}
</div>

<ScrollArea class="flex-1 overflow-hidden">
	<div class="flex flex-col gap-4 px-6 py-4">
		{#if editable}
			<OutgoingDraftEditor draft={message} />
		{:else}
			<pre class="font-sans text-sm leading-relaxed whitespace-pre-wrap">{message.body}</pre>
		{/if}

		{#if linkedMessages.length > 0}
			<div class="flex flex-col gap-2 border-t border-border pt-4">
				<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Related messages
				</h3>
				{#each linkedMessages as msg (msg.id)}
					<a
						href={resolve('/inbox/[id]', { id: msg.id })}
						class="text-sm text-foreground underline-offset-2 hover:underline"
					>
						{msg.subject ?? msg.senderName}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</ScrollArea>
