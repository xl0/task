<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { workspace } from '$lib/stores/workspace.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import MailIcon from '@lucide/svelte/icons/mail';
	import HashIcon from '@lucide/svelte/icons/hash';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import type { Channel, MessageId } from '$lib/types';

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}

	const selectedMessageId = $derived.by((): MessageId | null => {
		const match = page.url.pathname.match(/^\/inbox\/(m\d+)$/);
		return match ? (match[1] as MessageId) : null;
	});

	const channelIcons: Record<Channel, typeof MailIcon> = {
		email: MailIcon,
		slack: HashIcon,
		whatsapp: MessageCircleIcon
	};
</script>

<div class="flex items-center justify-between px-4 py-3">
	<h2 class="text-sm font-semibold">Inbox</h2>
	<Button
		variant="ghost"
		size="sm"
		class="h-6 text-xs text-muted-foreground"
		onclick={() => workspace.markAllUnread()}
	>
		Mark all unread
	</Button>
</div>

<ScrollArea class="flex-1 overflow-hidden border-t border-border">
	{#each workspace.messages as msg (msg.id)}
		{@const isSelected = selectedMessageId === msg.id}
		{@const ChannelIcon = channelIcons[msg.channel]}
		<a
			href={resolve('/inbox/[id]', { id: msg.id })}
			class="flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left no-underline transition-colors hover:bg-accent/50
				{isSelected ? 'bg-accent' : ''}
				{!msg.read ? '' : 'opacity-60'}"
		>
			<div class="flex items-center gap-2">
				{#if !msg.read}
					<span class="size-1.5 shrink-0 rounded-full bg-foreground"></span>
				{/if}
				<span class="flex-1 truncate text-sm {!msg.read ? 'font-semibold' : 'font-normal'}">
					{msg.senderName}
				</span>
				<span class="shrink-0 text-xs text-muted-foreground">{formatTime(msg.receivedAt)}</span>
			</div>
			<div class="flex items-center gap-2">
				<ChannelIcon class="size-3 shrink-0 text-muted-foreground" />
				<span class="truncate text-xs text-muted-foreground">{msg.summary}</span>
			</div>
		</a>
	{/each}
</ScrollArea>
