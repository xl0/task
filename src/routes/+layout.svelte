<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Accordion } from 'bits-ui';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { workspace } from '$lib/stores/workspace.svelte';
	import type { Actionable, ActionableId, Channel, MessageId, OutgoingMessage, OutgoingMessageId } from '$lib/types';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import FileEditIcon from '@lucide/svelte/icons/file-edit';
	import SendIcon from '@lucide/svelte/icons/send';
	import MailIcon from '@lucide/svelte/icons/mail';
	import HashIcon from '@lucide/svelte/icons/hash';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import GavelIcon from '@lucide/svelte/icons/gavel';
	import ForwardIcon from '@lucide/svelte/icons/forward';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import SidebarListPane from './SidebarListPane.svelte';
	import DevPanel from '$lib/components/DevPanel.svelte';

	let { children } = $props();

	type NavView = 'inbox' | 'drafts' | 'sent' | 'decide' | 'delegate' | 'ignore';

	const currentView = $derived.by((): NavView | null => {
		const path = page.url.pathname;
		if (path === '/') return null;
		if (path.startsWith('/drafts')) return 'drafts';
		if (path.startsWith('/sent')) return 'sent';
		if (path.startsWith('/decide')) return 'decide';
		if (path.startsWith('/delegate')) return 'delegate';
		if (path.startsWith('/ignore')) return 'ignore';
		return 'inbox';
	});

	const draftMessages = $derived(workspace.getOutgoingMessages(false));
	const sentMessages = $derived(workspace.getOutgoingMessages(true));
	const decideActionables = $derived(workspace.getActionablesByAction('decide'));
	const delegateActionables = $derived(workspace.getActionablesByAction('delegate'));
	const ignoreActionables = $derived(workspace.getActionablesByAction('ignore'));
	const openSection = $derived(currentView ?? '');

	const selectedMessageId = $derived.by((): MessageId | null => {
		const match = page.url.pathname.match(/^\/inbox\/(m\d+)$/);
		return match ? (match[1] as MessageId) : null;
	});

	const selectedOutgoingMessageId = $derived.by((): OutgoingMessageId | null => {
		const match = page.url.pathname.match(/^\/(drafts|sent)\/(o\d+)$/);
		return match ? (match[2] as OutgoingMessageId) : null;
	});

	const selectedActionableId = $derived.by((): ActionableId | null => {
		const match = page.url.pathname.match(/^\/(decide|delegate|ignore)\/(a\d+)$/);
		return match ? (match[2] as ActionableId) : null;
	});

	const channelIcons: Record<Channel, typeof MailIcon> = {
		email: MailIcon,
		slack: HashIcon,
		whatsapp: MessageCircleIcon
	};

	const priorityVariant: Record<string, string> = {
		high: 'bg-destructive/10 text-destructive border-destructive/20',
		medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
	};

	type NavSection = {
		id: NavView;
		label: string;
		icon: typeof MailIcon;
		items: () => any[];
		count: () => number;
		kind: 'inbox' | 'outgoing' | 'actionable';
		heading?: string;
	};

	const navSections: NavSection[] = [
		{
			id: 'inbox', label: 'Inbox', icon: InboxIcon, kind: 'inbox',
			items: () => workspace.messages,
			count: () => workspace.inboxCount,
		},
		{
			id: 'drafts', label: 'Drafts', icon: FileEditIcon, kind: 'outgoing',
			items: () => draftMessages,
			count: () => draftMessages.length,
		},
		{
			id: 'sent', label: 'Sent', icon: SendIcon, kind: 'outgoing',
			items: () => sentMessages,
			count: () => sentMessages.length,
		},
		{
			id: 'decide', label: 'Decide', icon: GavelIcon, kind: 'actionable',
			items: () => decideActionables,
			count: () => decideActionables.filter((a) => a.status === 'open').length,
			heading: 'Actionables',
		},
		{
			id: 'delegate', label: 'Delegate', icon: ForwardIcon, kind: 'actionable',
			items: () => delegateActionables,
			count: () => delegateActionables.filter((a) => a.status === 'open').length,
		},
		{
			id: 'ignore', label: 'Ignore', icon: EyeOffIcon, kind: 'actionable',
			items: () => ignoreActionables,
			count: () => ignoreActionables.length,
		},
	];

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
	<Resizable.PaneGroup direction="horizontal" autoSaveId="layout:main">
		<Resizable.Pane defaultSize={36} minSize={18} maxSize={55}>
			<div class="flex h-full min-h-0 flex-col overflow-hidden border-r border-border">
				<div class="flex items-center justify-between px-4 py-3">
					<a href={resolve('/')} class="text-sm font-semibold tracking-tight no-underline">Innate</a>
					<DevPanel />
				</div>
				<Separator />
				<Accordion.Root
					type="single"
					value={openSection}
					class="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-2"
				>
					{#each navSections as section (section.id)}
						{#if section.heading}
							<div class="px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground">
								{section.heading}
							</div>
						{/if}
						<Accordion.Item value={section.id} class="flex min-h-0 flex-col border-b border-border/50 data-[state=open]:flex-1">
							<Accordion.Header>
								<Accordion.Trigger
									onclick={() => goto(resolve(openSection === section.id ? '/' : `/${section.id}`))}
									class="flex h-8 w-full items-center gap-2 px-2 text-left text-sm hover:bg-accent/50"
								>
									<section.icon class="size-4 shrink-0" />
									<span class="flex-1">{section.label}</span>
									{#if section.count() > 0}
										<span class="text-xs text-muted-foreground tabular-nums">{section.count()}</span>
									{/if}
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content class="min-h-0 flex-1 overflow-hidden">
								<SidebarListPane items={section.items()} getKey={(item: any) => item.id}>
									{#snippet item(entry: any)}
										{#if section.kind === 'inbox'}
											{@const msg = entry}
											{@const isSelected = selectedMessageId === msg.id}
											{@const ChannelIcon = channelIcons[msg.channel as Channel]}
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
										{:else if section.kind === 'outgoing'}
											{@const msg = entry as OutgoingMessage}
											{@const isSelected = selectedOutgoingMessageId === msg.id}
											<a
												href={resolve(`/${section.id}/[id]`, { id: msg.id })}
												class="flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left no-underline transition-colors hover:bg-accent/50
													{isSelected ? 'bg-accent' : ''}"
											>
												<div class="flex items-center gap-2">
													<span class="flex-1 truncate text-sm font-medium">
														{msg.subject ?? (section.id === 'drafts' ? 'Draft message' : 'Sent message')}
													</span>
													{#if msg.createdAt}
														<span class="shrink-0 text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
													{/if}
												</div>
												<span class="truncate text-xs text-muted-foreground">
													To {msg.recipient ?? (section.id === 'drafts' ? 'recipient TBD' : 'recipient unknown')}
												</span>
											</a>
										{:else}
											{@const act = entry as Actionable}
											{@const isSelected = selectedActionableId === act.id}
											<a
												href={resolve(`/${act.action}/${act.id}`)}
												class="flex w-full flex-col gap-1.5 border-b border-border px-4 py-3 text-left no-underline transition-colors hover:bg-accent/50
													{isSelected ? 'bg-accent' : ''}
													{act.status === 'done' ? 'opacity-50' : ''}"
											>
												<div class="flex items-center gap-2">
													<span class="flex-1 truncate text-sm font-medium">{act.title}</span>
													{#if act.priority !== 'low'}
														<Badge
															variant="outline"
															class="h-5 shrink-0 text-[10px] {priorityVariant[act.priority]}"
														>
															{act.priority}
														</Badge>
													{/if}
												</div>
												<span class="truncate text-xs text-muted-foreground">{act.summary}</span>
												{#if act.messageIds.length > 0}
													<span class="text-xs text-muted-foreground">
														{act.messageIds.length} message{act.messageIds.length > 1 ? 's' : ''}
													</span>
												{/if}
											</a>
										{/if}
									{/snippet}
								</SidebarListPane>
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</div>
		</Resizable.Pane>

		<Resizable.Handle />

		<Resizable.Pane defaultSize={64}>
			<div class="flex h-full min-h-0 flex-col overflow-hidden">
				{@render children()}
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
