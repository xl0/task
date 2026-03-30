<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
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

	function updateRecipient(value: string) {
		workspace.updateOutgoingMessage(message.id, { recipient: value });
	}

	function updateSubject(value: string) {
		workspace.updateOutgoingMessage(message.id, { subject: value });
	}

	function updateBody(value: string) {
		workspace.updateOutgoingMessage(message.id, { body: value });
	}

	function onRecipientInput(event: Event) {
		updateRecipient((event.currentTarget as HTMLInputElement).value);
	}

	function onSubjectInput(event: Event) {
		updateSubject((event.currentTarget as HTMLInputElement).value);
	}

	function onBodyInput(event: Event) {
		updateBody((event.currentTarget as HTMLTextAreaElement).value);
	}
</script>

<div class="flex flex-col gap-1 border-b border-border px-6 py-4">
	<div class="flex items-center gap-2">
		<h2 class="flex-1 text-base font-semibold">{message.subject ?? 'Untitled message'}</h2>
		<Badge variant="secondary" class="shrink-0 text-xs">{editable ? 'draft' : 'sent'}</Badge>
		{#if message.channel}
			<Badge variant="outline" class="shrink-0 text-xs">{channelLabel[message.channel]}</Badge>
		{/if}
	</div>
	<p class="text-sm text-muted-foreground">To {message.recipient ?? 'recipient not set'}</p>
	{#if linkedActionable}
		<p class="text-xs text-muted-foreground">
			From {linkedActionable.action} actionable: {linkedActionable.title}
		</p>
	{/if}
</div>

<ScrollArea class="flex-1 overflow-hidden">
	<div class="flex flex-col gap-4 px-6 py-4">
		{#if editable}
			<div class="flex flex-col gap-1.5">
				<label
					for="draft-recipient"
					class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Recipient</label
				>
				<input
					id="draft-recipient"
					class="h-9 w-full border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
					value={message.recipient ?? ''}
					oninput={onRecipientInput}
					placeholder="name@company.com"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label
					for="draft-subject"
					class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Subject</label
				>
				<input
					id="draft-subject"
					class="h-9 w-full border border-input bg-background px-3 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
					value={message.subject ?? ''}
					oninput={onSubjectInput}
					placeholder="Message subject"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label
					for="draft-body"
					class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Body</label
				>
				<textarea
					id="draft-body"
					class="min-h-[280px] w-full resize-y border border-input bg-background px-3 py-2 text-sm leading-relaxed ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
					value={message.body}
					oninput={onBodyInput}
				></textarea>
			</div>
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
