<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { workspace } from '$lib/stores/workspace.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import FileEditIcon from '@lucide/svelte/icons/file-edit';
	import SendIcon from '@lucide/svelte/icons/send';
	import MailIcon from '@lucide/svelte/icons/mail';
	import HashIcon from '@lucide/svelte/icons/hash';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import type { Channel, MailboxView, MessageId } from '$lib/types';
	import DevPanel from '$lib/components/dev-panel.svelte';

	let { children } = $props();

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}

	const currentView = $derived.by((): MailboxView => {
		const path = $page.url.pathname;
		if (path.startsWith('/drafts')) return 'drafts';
		if (path.startsWith('/sent')) return 'sent';
		return 'inbox';
	});

	const selectedMessageId = $derived.by((): MessageId | null => {
		const match = $page.url.pathname.match(/^\/inbox\/(m\d+)$/);
		return match ? (match[1] as MessageId) : null;
	});

	const navItems: { view: MailboxView; href: string; label: string; icon: typeof InboxIcon }[] = [
		{ view: 'inbox', href: '/inbox', label: 'Inbox', icon: InboxIcon },
		{ view: 'drafts', href: '/drafts', label: 'Drafts', icon: FileEditIcon },
		{ view: 'sent', href: '/sent', label: 'Sent', icon: SendIcon }
	];

	const channelIcons: Record<Channel, typeof MailIcon> = {
		email: MailIcon,
		slack: HashIcon,
		whatsapp: MessageCircleIcon
	};
</script>

<div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
	<Resizable.PaneGroup direction="horizontal">
		<!-- Nav sidebar -->
		<Resizable.Pane defaultSize={15} minSize={12} maxSize={20}>
			<div class="flex h-full flex-col border-r border-border">
				<div class="flex items-center justify-between px-4 py-3">
					<h1 class="text-sm font-semibold tracking-tight">Innate</h1>
					<DevPanel />
				</div>
				<Separator />
				<nav class="flex flex-col gap-0.5 p-2">
					{#each navItems as item}
						{@const isActive = currentView === item.view}
						{@const count =
							item.view === 'inbox'
								? workspace.inboxCount
								: item.view === 'drafts'
									? workspace.outgoingMessages.filter((m) => !m.sent).length
									: workspace.outgoingMessages.filter((m) => m.sent).length}
						<Button
							variant={isActive ? 'secondary' : 'ghost'}
							class="justify-start gap-2 h-8 px-2 text-sm w-full"
							href={item.href}
						>
							<item.icon class="size-4 shrink-0" />
							<span class="flex-1 text-left">{item.label}</span>
							{#if count > 0}
								<span class="text-xs tabular-nums text-muted-foreground">{count}</span>
							{/if}
						</Button>
					{/each}
				</nav>
			</div>
		</Resizable.Pane>

		<Resizable.Handle />

		<!-- Message list -->
		<Resizable.Pane defaultSize={30} minSize={20} maxSize={45}>
			<div class="flex h-full min-h-0 flex-col overflow-hidden border-r border-border">
				<div class="flex items-center justify-between px-4 py-3">
					<h2 class="text-sm font-semibold">
						{currentView === 'inbox'
							? 'Inbox'
							: currentView === 'drafts'
								? 'Drafts'
								: 'Sent'}
					</h2>
					{#if currentView === 'inbox'}
						<Button
							variant="ghost"
							size="sm"
							class="h-6 text-xs text-muted-foreground"
							onclick={() => workspace.markAllUnread()}
						>
							Mark all unread
						</Button>
					{/if}
				</div>
				<Separator />
				<ScrollArea class="flex-1 overflow-hidden">
					{#if currentView === 'inbox'}
						{#each workspace.messages as msg (msg.id)}
							{@const isSelected = selectedMessageId === msg.id}
							{@const ChannelIcon = channelIcons[msg.channel]}
							<a
								href="/inbox/{msg.id}"
								class="flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50 no-underline
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
									<span class="truncate text-xs text-muted-foreground">
										{msg.summary}
									</span>
								</div>
							</a>
						{/each}
					{:else if currentView === 'drafts'}
						{#if workspace.outgoingMessages.filter((m) => !m.sent).length === 0}
							<div class="flex items-center justify-center p-8 text-sm text-muted-foreground">
								No drafts
							</div>
						{/if}
					{:else}
						{#if workspace.outgoingMessages.filter((m) => m.sent).length === 0}
							<div class="flex items-center justify-center p-8 text-sm text-muted-foreground">
								No sent messages
							</div>
						{/if}
					{/if}
				</ScrollArea>
			</div>
		</Resizable.Pane>

		<Resizable.Handle />

		<!-- Message detail -->
		<Resizable.Pane defaultSize={55}>
			<div class="flex h-full min-h-0 flex-col overflow-hidden">
				{@render children()}
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
