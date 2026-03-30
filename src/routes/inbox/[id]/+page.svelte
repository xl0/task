<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import MailOpenIcon from '@lucide/svelte/icons/mail-open';
	import type { Channel, MessageId } from '$lib/types';

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}

	function channelLabel(ch: Channel): string {
		return ch === 'whatsapp' ? 'WhatsApp' : ch === 'slack' ? 'Slack' : 'Email';
	}

	const messageId = $derived(page.params.id as MessageId);
	const msg = $derived(workspace.getMessage(messageId) ?? null);

	$effect(() => {
		const id = messageId; // tracked: re-runs when id changes
		untrack(() => workspace.markRead(id)); // untracked: doesn't re-trigger from read state change
	});
</script>

{#if msg}
	<div class="flex flex-col gap-1 border-b border-border px-6 py-4">
		<div class="flex items-center gap-2">
			<h2 class="flex-1 text-base font-semibold">{msg.subject ?? msg.senderName}</h2>
			<Button
				variant="ghost"
				size="sm"
				class="h-7 gap-1.5 text-xs text-muted-foreground"
				onclick={() => workspace.markUnread(messageId)}
			>
				<MailOpenIcon class="size-3.5" />
				Mark unread
			</Button>
			<Badge variant="outline" class="shrink-0 text-xs">
				{channelLabel(msg.channel)}
			</Badge>
		</div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span class="font-medium text-foreground">{msg.senderName}</span>
			{#if msg.channelName}
				<span>&middot; {msg.channelName}</span>
			{/if}
			<span>&middot; {formatTime(msg.receivedAt)}</span>
		</div>
		{#if msg.summary}
			<p class="text-sm text-muted-foreground">{msg.summary}</p>
		{/if}
	</div>
	<ScrollArea class="flex-1 overflow-hidden">
		<div class="px-6 py-4">
			<pre class="font-sans text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</pre>
		</div>
	</ScrollArea>
{:else}
	<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
		Message not found
	</div>
{/if}
