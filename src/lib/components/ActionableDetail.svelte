<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { Accordion } from 'bits-ui';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import OutgoingDraftEditor from '$lib/components/OutgoingDraftEditor.svelte';
	import MailIcon from '@lucide/svelte/icons/mail';
	import HashIcon from '@lucide/svelte/icons/hash';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import SendIcon from '@lucide/svelte/icons/send';
	import FileEditIcon from '@lucide/svelte/icons/file-edit';
	import type { Actionable, Channel, Message, OutgoingMessage } from '$lib/types';

	let { actionable }: { actionable: Actionable } = $props();

	const linkedOutgoing = $derived(
		workspace.outgoingMessages.filter((message) => message.parentActionableId === actionable.id)
	);

	const drafts = $derived(linkedOutgoing.filter((m) => !m.sent));

	// Build a map of parentMessageId -> outgoing messages
	const repliesByParent = $derived.by(() => {
		const map = new Map<string, OutgoingMessage[]>();
		for (const om of linkedOutgoing) {
			if (om.parentMessageId) {
				const existing = map.get(om.parentMessageId) ?? [];
				existing.push(om);
				map.set(om.parentMessageId, existing);
			}
		}
		return map;
	});

	// Outgoing messages without a parent in this actionable's messages
	const standaloneOutgoing = $derived(
		linkedOutgoing.filter(
			(om) => !om.parentMessageId || !actionable.messageIds.includes(om.parentMessageId)
		)
	);

	// Build unified timeline entries
	type TimelineEntry =
		| { kind: 'incoming'; message: Message; replies: OutgoingMessage[]; time: string }
		| { kind: 'outgoing'; message: OutgoingMessage; time: string };

	const timeline = $derived.by((): TimelineEntry[] => {
		const entries: TimelineEntry[] = [];

		for (const id of actionable.messageIds) {
			const msg = workspace.getMessage(id);
			if (!msg) continue;
			entries.push({
				kind: 'incoming',
				message: msg,
				replies: repliesByParent.get(msg.id) ?? [],
				time: msg.receivedAt
			});
		}

		for (const om of standaloneOutgoing) {
			entries.push({ kind: 'outgoing', message: om, time: om.createdAt ?? '' });
		}

		return entries.sort((a, b) => a.time.localeCompare(b.time));
	});

	const timelineIds = $derived(
		timeline.map((e) => (e.kind === 'incoming' ? e.message.id : e.message.id))
	);

	const priorityVariant: Record<string, string> = {
		high: 'bg-destructive/10 text-destructive border-destructive/20',
		medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
	};

	const channelIcons: Record<Channel, typeof MailIcon> = {
		email: MailIcon,
		slack: HashIcon,
		whatsapp: MessageCircleIcon
	};

	let expandedMessage = $state<string>('');

	function handleMessagesKeydown(e: KeyboardEvent) {
		if (!timelineIds.length) return;
		const tag = (e.target as HTMLElement)?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
		const idx = expandedMessage ? timelineIds.indexOf(expandedMessage as any) : -1;

		switch (e.key) {
			case 'ArrowRight':
				e.preventDefault();
				expandedMessage = timelineIds[idx === -1 ? 0 : idx];
				break;
			case 'ArrowLeft':
				e.preventDefault();
				expandedMessage = '';
				break;
			case 'ArrowDown':
				if (expandedMessage && idx < timelineIds.length - 1) {
					e.preventDefault();
					expandedMessage = timelineIds[idx + 1];
				}
				break;
			case 'ArrowUp':
				if (expandedMessage && idx > 0) {
					e.preventDefault();
					expandedMessage = timelineIds[idx - 1];
				}
				break;
		}
	}

	function messagePreview(msg: Message): string {
		return msg.summary || msg.text.slice(0, 120);
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}

	function sendDraft(draftId: string) {
		workspace.sendOutgoingMessage(draftId as any);
	}
</script>

<svelte:window onkeydown={handleMessagesKeydown} />

<Resizable.PaneGroup direction="horizontal" autoSaveId="layout:actionable">
	<Resizable.Pane defaultSize={45} minSize={25}>
		<div class="flex h-full min-h-0 flex-col">
			<div class="flex flex-col gap-1 border-b border-border px-6 py-4">
				<div class="flex items-center gap-2">
					<h2 class="flex-1 text-base font-semibold">{actionable.title}</h2>
					{#if actionable.priority !== 'low'}
						<Badge
							variant="outline"
							class="shrink-0 text-xs {priorityVariant[actionable.priority]}"
						>
							{actionable.priority}
						</Badge>
					{/if}
					{#if actionable.status === 'done'}
						<Badge variant="secondary" class="shrink-0 text-xs">done</Badge>
					{/if}
				</div>
				<p class="text-sm text-muted-foreground">{actionable.summary}</p>
			</div>
			{#if drafts.length > 0}
				<ScrollArea class="flex-1 overflow-hidden">
					{#each drafts as draft (draft.id)}
						<div class="flex flex-col gap-3 px-6 py-4">
							<div class="flex items-center gap-2">
								<FileEditIcon class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="flex-1 text-xs font-medium text-muted-foreground">Draft reply</span>
								<Button size="sm" onclick={() => sendDraft(draft.id)}>
									<SendIcon class="mr-1.5 size-3.5" />
									Send
								</Button>
							</div>
							<OutgoingDraftEditor {draft} />
						</div>
						{#if drafts.length > 1}
							<Separator />
						{/if}
					{/each}
				</ScrollArea>
			{/if}
		</div>
	</Resizable.Pane>

	{#if timeline.length > 0}
		<Resizable.Handle />
		<Resizable.Pane defaultSize={55} minSize={30}>
			<div class="flex h-full min-h-0 flex-col border-l border-border">
				<div class="px-4 py-3">
					<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
						Related messages ({timeline.length})
					</h3>
				</div>
				<Separator />
				<ScrollArea class="flex-1 overflow-hidden">
					<Accordion.Root type="single" bind:value={expandedMessage}>
						{#each timeline as entry (entry.kind === 'incoming' ? entry.message.id : entry.message.id)}
							{#if entry.kind === 'incoming'}
								{@const msg = entry.message}
								{@const ChannelIcon = channelIcons[msg.channel]}
								<Accordion.Item value={msg.id} class="border-b border-border/50">
									<Accordion.Header>
										<Accordion.Trigger
											class="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/50"
										>
											<div class="flex items-center gap-2">
												<ChannelIcon class="size-3.5 shrink-0 text-muted-foreground" />
												<span class="flex-1 truncate text-sm font-medium">
													{msg.senderName}
												</span>
												{#if msg.channelName}
													<span class="shrink-0 text-xs text-muted-foreground"
														>{msg.channelName}</span
													>
												{/if}
												<span class="shrink-0 text-xs text-muted-foreground">
													{formatTime(msg.receivedAt)}
												</span>
											</div>
											{#if msg.subject}
												<span class="truncate text-xs">{msg.subject}</span>
											{/if}
											<span class="text-xs text-muted-foreground">
												{messagePreview(msg)}
											</span>
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content class="overflow-hidden">
										<div class="border-t border-border/30 bg-muted/30 px-4 py-3">
											<pre
												class="font-sans text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</pre>
										</div>
									</Accordion.Content>
								</Accordion.Item>
								{#each entry.replies as reply (reply.id)}
									{@const ReplyIcon = reply.sent ? SendIcon : FileEditIcon}
									<div
										class="ml-4 border-b border-l-2 border-border/50 border-b-border/50 px-4 py-3 {reply.sent
											? 'bg-accent/30'
											: 'bg-blue-500/5'}"
									>
										<div class="mb-2 flex items-center gap-2">
											<ReplyIcon class="size-3.5 shrink-0 text-muted-foreground" />
											<Badge variant="outline" class="h-5 text-[10px]">
												{reply.sent ? 'sent' : 'draft'}
											</Badge>
											<span class="text-xs text-muted-foreground">
												{#if reply.channelName}
													{reply.channelName}
												{:else}
													To {reply.recipient ?? 'TBD'}
												{/if}
											</span>
											{#if reply.createdAt}
												<span class="ml-auto shrink-0 text-xs text-muted-foreground">
													{formatTime(reply.createdAt)}
												</span>
											{/if}
										</div>
										{#if reply.subject}
											<div class="mb-1 text-xs font-medium">{reply.subject}</div>
										{/if}
										<pre
											class="font-sans text-sm leading-relaxed whitespace-pre-wrap">{reply.body}</pre>
									</div>
								{/each}
							{:else}
								{@const om = entry.message}
								{@const OmIcon = om.sent ? SendIcon : FileEditIcon}
								<Accordion.Item value={om.id} class="border-b border-border/50">
									<Accordion.Header>
										<Accordion.Trigger
											class="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent/50"
										>
											<div class="flex items-center gap-2">
												<OmIcon class="size-3.5 shrink-0 text-muted-foreground" />
												<Badge variant="outline" class="h-5 text-[10px]">
													{om.sent ? 'sent' : 'draft'}
												</Badge>
												<span class="flex-1 truncate text-sm font-medium">
													{om.subject ?? (om.sent ? 'Sent message' : 'Draft')}
												</span>
												{#if om.createdAt}
													<span class="shrink-0 text-xs text-muted-foreground">
														{formatTime(om.createdAt)}
													</span>
												{/if}
											</div>
											<span class="truncate text-xs text-muted-foreground">
												{#if om.channelName}
													{om.channelName}
												{:else}
													To {om.recipient ?? 'TBD'}
												{/if}
											</span>
										</Accordion.Trigger>
									</Accordion.Header>
									<Accordion.Content class="overflow-hidden">
										<div
											class="border-t border-border/30 px-4 py-3 {om.sent
												? 'bg-accent/30'
												: 'bg-blue-500/5'}"
										>
											{#if om.subject}
												<div class="mb-1 text-xs font-medium">{om.subject}</div>
											{/if}
											<pre
												class="font-sans text-sm leading-relaxed whitespace-pre-wrap">{om.body}</pre>
										</div>
									</Accordion.Content>
								</Accordion.Item>
							{/if}
						{/each}
					</Accordion.Root>
				</ScrollArea>
			</div>
		</Resizable.Pane>
	{/if}
</Resizable.PaneGroup>
