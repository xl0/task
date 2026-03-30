<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { parseRawMessages } from '$lib/data/ingest';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	let fileInput: HTMLInputElement;
	let parsedMessages: ReturnType<typeof parseRawMessages> = $state([]);
	let fileName = $state('');
	let addCount = $state(0);
	let error = $state('');

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		error = '';
		fileName = file.name;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const json = JSON.parse(reader.result as string);
				const startOrder = workspace.messages.length;
				parsedMessages = parseRawMessages(json, startOrder);
				addCount = parsedMessages.length;
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to parse JSON';
				parsedMessages = [];
			}
		};
		reader.readAsText(file);
	}

	function addMessages(count?: number) {
		const toAdd = count ? parsedMessages.slice(0, count) : parsedMessages;
		workspace.addMessages(toAdd);
		parsedMessages = [];
		fileName = '';
		addCount = 0;
		if (fileInput) fileInput.value = '';
	}

	function clearWorkspace() {
		workspace.clear();
		parsedMessages = [];
		fileName = '';
		addCount = 0;
		error = '';
		if (fileInput) fileInput.value = '';
	}
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<Button variant="ghost" size="icon" class="size-7">
			<WrenchIcon class="size-3.5" />
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="w-[360px]">
		<Sheet.Header>
			<Sheet.Title>Dev Panel</Sheet.Title>
			<Sheet.Description>Import messages and manage workspace state.</Sheet.Description>
		</Sheet.Header>

		<div class="flex flex-col gap-4 px-4">
			<!-- Import section -->
			<div class="flex flex-col gap-3">
				<h3 class="text-sm font-medium">Import Messages</h3>
				<input
					bind:this={fileInput}
					type="file"
					accept=".json"
					onchange={handleFileSelect}
					class="text-sm file:mr-2 file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground"
				/>

				{#if error}
					<p class="text-xs text-destructive">{error}</p>
				{/if}

				{#if parsedMessages.length > 0}
					<p class="text-xs text-muted-foreground">
						Parsed <strong>{parsedMessages.length}</strong> messages from {fileName}
					</p>
					<div class="flex gap-2">
						<Button size="sm" class="h-7 text-xs gap-1.5" onclick={() => addMessages()}>
							<UploadIcon class="size-3" />
							Add all {parsedMessages.length}
						</Button>
						{#if parsedMessages.length > 5}
							<Button
								variant="outline"
								size="sm"
								class="h-7 text-xs"
								onclick={() => addMessages(5)}
							>
								Add 5
							</Button>
						{/if}
						{#if parsedMessages.length > 1}
							<Button
								variant="outline"
								size="sm"
								class="h-7 text-xs"
								onclick={() => addMessages(1)}
							>
								Add 1
							</Button>
						{/if}
					</div>
				{/if}
			</div>

			<Separator />

			<!-- Workspace state -->
			<div class="flex flex-col gap-3">
				<h3 class="text-sm font-medium">Workspace</h3>
				<div class="text-xs text-muted-foreground space-y-1">
					<p>{workspace.messages.length} messages ({workspace.inboxCount} unread)</p>
					<p>{workspace.outgoingMessages.length} outgoing messages</p>
				</div>
				<div class="flex gap-2">
					<Button
						variant="destructive"
						size="sm"
						class="h-7 text-xs gap-1.5"
						onclick={clearWorkspace}
					>
						<Trash2Icon class="size-3" />
						Clear workspace
					</Button>
				</div>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
