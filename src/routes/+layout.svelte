<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { workspace } from '$lib/stores/workspace.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import FileEditIcon from '@lucide/svelte/icons/file-edit';
	import SendIcon from '@lucide/svelte/icons/send';
	import GavelIcon from '@lucide/svelte/icons/gavel';
	import ForwardIcon from '@lucide/svelte/icons/forward';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import InboxListPane from './inbox/ListPane.svelte';
	import DraftsListPane from './drafts/ListPane.svelte';
	import SentListPane from './sent/ListPane.svelte';
	import ActionablesListPane from './ActionablesListPane.svelte';
	import DevPanel from '$lib/components/DevPanel.svelte';

	let { children } = $props();

	type NavView = 'inbox' | 'drafts' | 'sent' | 'decide' | 'delegate' | 'ignore';
	type NavPath = '/inbox' | '/drafts' | '/sent' | '/decide' | '/delegate' | '/ignore';

	const currentView = $derived.by((): NavView => {
		const path = page.url.pathname;
		if (path.startsWith('/drafts')) return 'drafts';
		if (path.startsWith('/sent')) return 'sent';
		if (path.startsWith('/decide')) return 'decide';
		if (path.startsWith('/delegate')) return 'delegate';
		if (path.startsWith('/ignore')) return 'ignore';
		return 'inbox';
	});

	const draftMessages = $derived(workspace.getOutgoingMessages(false));
	const sentMessages = $derived(workspace.getOutgoingMessages(true));

	const mailNavItems: { view: NavView; path: NavPath; label: string; icon: typeof InboxIcon }[] = [
		{ view: 'inbox', path: '/inbox', label: 'Inbox', icon: InboxIcon },
		{ view: 'drafts', path: '/drafts', label: 'Drafts', icon: FileEditIcon },
		{ view: 'sent', path: '/sent', label: 'Sent', icon: SendIcon }
	];

	const actionNavItems: { view: NavView; path: NavPath; label: string; icon: typeof GavelIcon }[] =
		[
			{ view: 'decide', path: '/decide', label: 'Decide', icon: GavelIcon },
			{ view: 'delegate', path: '/delegate', label: 'Delegate', icon: ForwardIcon },
			{ view: 'ignore', path: '/ignore', label: 'Ignore', icon: EyeOffIcon }
		];

	function navCount(view: NavView): number {
		switch (view) {
			case 'inbox':
				return workspace.inboxCount;
			case 'drafts':
				return draftMessages.length;
			case 'sent':
				return sentMessages.length;
			case 'decide':
				return workspace.getActionablesByAction('decide').filter((a) => a.status === 'open').length;
			case 'delegate':
				return workspace.getActionablesByAction('delegate').filter((a) => a.status === 'open')
					.length;
			case 'ignore':
				return workspace.getActionablesByAction('ignore').length;
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane defaultSize={15} minSize={12} maxSize={20}>
			<div class="flex h-full flex-col border-r border-border">
				<div class="flex items-center justify-between px-4 py-3">
					<h1 class="text-sm font-semibold tracking-tight">Innate</h1>
					<DevPanel />
				</div>
				<Separator />
				<nav class="flex flex-col gap-0.5 p-2">
					{#each mailNavItems as item}
						{@const isActive = currentView === item.view}
						{@const count = navCount(item.view)}
						<Button
							variant={isActive ? 'secondary' : 'ghost'}
							class="h-8 w-full justify-start gap-2 px-2 text-sm"
							href={resolve(item.path)}
						>
							<item.icon class="size-4 shrink-0" />
							<span class="flex-1 text-left">{item.label}</span>
							{#if count > 0}
								<span class="text-xs text-muted-foreground tabular-nums">{count}</span>
							{/if}
						</Button>
					{/each}
				</nav>

				<Separator class="mx-2" />

				<nav class="flex flex-col gap-0.5 p-2">
					<span class="px-2 pb-1 text-xs font-medium text-muted-foreground">Actionables</span>
					{#each actionNavItems as item}
						{@const isActive = currentView === item.view}
						{@const count = navCount(item.view)}
						<Button
							variant={isActive ? 'secondary' : 'ghost'}
							class="h-8 w-full justify-start gap-2 px-2 text-sm"
							href={resolve(item.path)}
						>
							<item.icon class="size-4 shrink-0" />
							<span class="flex-1 text-left">{item.label}</span>
							{#if count > 0}
								<span class="text-xs text-muted-foreground tabular-nums">{count}</span>
							{/if}
						</Button>
					{/each}
				</nav>
			</div>
		</Resizable.Pane>

		<Resizable.Handle />

		<Resizable.Pane defaultSize={30} minSize={20} maxSize={45}>
			<div class="flex h-full min-h-0 flex-col overflow-hidden border-r border-border">
				{#if currentView === 'inbox'}
					<InboxListPane />
				{:else if currentView === 'drafts'}
					<DraftsListPane />
				{:else if currentView === 'sent'}
					<SentListPane />
				{:else if currentView === 'decide'}
					<ActionablesListPane action="decide" title="Decide" />
				{:else if currentView === 'delegate'}
					<ActionablesListPane action="delegate" title="Delegate" />
				{:else if currentView === 'ignore'}
					<ActionablesListPane action="ignore" title="Ignore" />
				{/if}
			</div>
		</Resizable.Pane>

		<Resizable.Handle />

		<Resizable.Pane defaultSize={55}>
			<div class="flex h-full min-h-0 flex-col overflow-hidden">
				{@render children()}
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
