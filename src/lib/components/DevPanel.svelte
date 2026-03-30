<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { parseRawMessages, assertNoExistingMessageIds } from '$lib/data/ingest';
	import { parseWorkspaceSnapshot, type WorkspaceSnapshot } from '$lib/data/workspace-snapshot';
	import { devStore, PROVIDERS, type Provider } from '$lib/stores/dev-store.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import WrenchIcon from '@lucide/svelte/icons/wrench';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	let fileInput = $state<HTMLInputElement | null>(null);
	let snapshotFileInput = $state<HTMLInputElement | null>(null);
	let parsedMessages: ReturnType<typeof parseRawMessages> = $state([]);
	let importBatchSize = $state(5);
	let fileName = $state('');
	let error = $state('');
	let parsedSnapshot: WorkspaceSnapshot | null = $state(null);
	let snapshotFileName = $state('');
	let snapshotError = $state('');
	let snapshotNotice = $state('');

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		error = '';
		fileName = file.name;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const json = JSON.parse(reader.result as string);
				const messages = parseRawMessages(json);
				assertNoExistingMessageIds(
					messages,
					workspace.messages.map((message) => message.id)
				);
				parsedMessages = messages;
				importBatchSize = Math.min(5, messages.length);
			} catch (err) {
				error = err instanceof Error ? err.message : 'Failed to parse JSON';
				parsedMessages = [];
			}
		};
		reader.readAsText(file);
	}

	function openMessageFilePicker() {
		if (!fileInput) return;
		fileInput.click();
	}

	function handleSnapshotFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		snapshotError = '';
		snapshotNotice = '';
		snapshotFileName = file.name;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				const json = JSON.parse(reader.result as string);
				parsedSnapshot = parseWorkspaceSnapshot(json);
			} catch (err) {
				snapshotError = err instanceof Error ? err.message : 'Failed to parse workspace snapshot';
				parsedSnapshot = null;
			}
		};
		reader.readAsText(file);
	}

	function openSnapshotFilePicker() {
		if (!snapshotFileInput) return;
		snapshotFileInput.click();
	}

	function saveWorkspaceSnapshot() {
		snapshotError = '';
		snapshotNotice = '';

		try {
			const snapshot = workspace.getSnapshot();
			const json = JSON.stringify(snapshot, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `workspace-${new Date().toISOString().replace(/[.:]/g, '-')}.json`;
			a.click();
			URL.revokeObjectURL(url);

			snapshotNotice = `Saved workspace snapshot (${workspace.messages.length} messages).`;
		} catch (err) {
			snapshotError = err instanceof Error ? err.message : 'Failed to save workspace snapshot';
		}
	}

	function loadWorkspaceSnapshot() {
		if (!parsedSnapshot) return;

		snapshotError = '';

		try {
			workspace.loadSnapshot(parsedSnapshot);
			snapshotNotice =
				`Loaded workspace snapshot (${parsedSnapshot.messages.length} messages, ` +
				`${parsedSnapshot.actionables.length} actionables, ` +
				`${parsedSnapshot.outgoingMessages.length} outgoing).`;

			parsedSnapshot = null;
			snapshotFileName = '';
			if (snapshotFileInput) snapshotFileInput.value = '';
		} catch (err) {
			snapshotError = err instanceof Error ? err.message : 'Failed to load workspace snapshot';
		}
	}

	function addMessages(count?: number) {
		error = '';
		const safeCount = count
			? Math.max(1, Math.min(count, parsedMessages.length))
			: parsedMessages.length;
		const toAdd = parsedMessages.slice(0, safeCount);
		workspace.addMessages(toAdd);

		if (safeCount >= parsedMessages.length) {
			parsedMessages = [];
			importBatchSize = 5;
			fileName = '';
			if (fileInput) fileInput.value = '';
			return;
		}

		parsedMessages = parsedMessages.slice(safeCount);
		importBatchSize = Math.min(importBatchSize, parsedMessages.length);
	}

	function clearWorkspace() {
		workspace.clear();
		parsedMessages = [];
		importBatchSize = 5;
		fileName = '';
		error = '';
		parsedSnapshot = null;
		snapshotFileName = '';
		snapshotError = '';
		snapshotNotice = '';
		if (fileInput) fileInput.value = '';
		if (snapshotFileInput) snapshotFileInput.value = '';
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
			<!-- AI Config -->
			<div class="flex flex-col gap-3">
				<h3 class="text-sm font-medium">AI Provider</h3>

				<div class="flex flex-col gap-2">
					<Label class="text-xs">Provider</Label>
					<Select.Root
						type="single"
						value={devStore.provider}
						onValueChange={(v) => {
							if (v) devStore.provider = v as Provider;
						}}
					>
						<Select.Trigger class="h-8 text-xs">{devStore.providerConfig.label}</Select.Trigger>
						<Select.Content>
							{#each PROVIDERS as p (p.id)}
								<Select.Item value={p.id} label={p.label}>{p.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex flex-col gap-2">
					<Label class="text-xs">Model</Label>
					<Select.Root
						type="single"
						value={devStore.model}
						onValueChange={(v) => {
							if (v) devStore.model = v;
						}}
					>
						<Select.Trigger class="h-8 text-xs">{devStore.model}</Select.Trigger>
						<Select.Content>
							{#each devStore.models as model (model)}
								<Select.Item value={model} label={model}>{model}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="flex flex-col gap-2">
					<Label class="text-xs">API Key</Label>
					<Input
						type="text"
						class="h-8 text-xs"
						placeholder={devStore.providerConfig.placeholder}
						value={devStore.apiKey}
						oninput={(e) => {
							devStore.apiKey = e.currentTarget.value;
						}}
					/>
				</div>
			</div>

			<Separator />

			<!-- Import section -->
			<div class="flex flex-col gap-3">
				<h3 class="text-sm font-medium">Import Messages</h3>
				<Input
					bind:ref={fileInput}
					type="file"
					accept=".json"
					onchange={handleFileSelect}
					class="hidden"
				/>

				<Button
					variant="outline"
					size="sm"
					class="h-8 w-fit gap-1.5 text-xs"
					onclick={openMessageFilePicker}
				>
					<FolderOpenIcon class="size-3.5" />
					Open messages JSON
				</Button>

				{#if error}
					<p class="text-xs text-destructive">{error}</p>
				{/if}

				{#if parsedMessages.length > 0}
					<p class="text-xs text-muted-foreground">
						Parsed <strong>{parsedMessages.length}</strong> messages from {fileName}
					</p>
					<div class="flex gap-2">
						<Button size="sm" class="h-7 gap-1.5 text-xs" onclick={() => addMessages()}>
							<UploadIcon class="size-3" />
							Add all {parsedMessages.length}
						</Button>
					</div>
					<div class="flex items-end gap-2">
						<div class="flex flex-col gap-1">
							<Label class="text-xs">Batch size</Label>
							<Input
								type="number"
								min={1}
								max={parsedMessages.length}
								class="h-7 w-24 text-xs"
								value={String(importBatchSize)}
								oninput={(e) => {
									const next = Number.parseInt(e.currentTarget.value, 10);
									if (Number.isNaN(next)) return;
									importBatchSize = Math.max(1, Math.min(next, parsedMessages.length));
								}}
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							class="h-7 gap-1.5 text-xs"
							onclick={() => addMessages(importBatchSize)}
						>
							<UploadIcon class="size-3" />
							Add batch
						</Button>
					</div>
				{/if}
			</div>

			<Separator />

			<!-- Workspace state -->
			<div class="flex flex-col gap-3">
				<h3 class="text-sm font-medium">Workspace</h3>
				<div class="space-y-1 text-xs text-muted-foreground">
					<p>{workspace.messages.length} messages ({workspace.inboxCount} unread)</p>
					<p>{workspace.outgoingMessages.length} outgoing messages</p>
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						class="h-7 gap-1.5 text-xs"
						onclick={() => workspace.reset()}
					>
						Reset workspace
					</Button>
					<Button
						variant="destructive"
						size="sm"
						class="h-7 gap-1.5 text-xs"
						onclick={clearWorkspace}
					>
						<Trash2Icon class="size-3" />
						Clear
					</Button>
				</div>

				<Input
					bind:ref={snapshotFileInput}
					type="file"
					accept=".json"
					onchange={handleSnapshotFileSelect}
					class="hidden"
				/>

				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						class="h-8 gap-1.5 text-xs"
						onclick={openSnapshotFilePicker}
					>
						<FolderOpenIcon class="size-3.5" />
						Import snapshot
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-8 gap-1.5 text-xs"
						onclick={saveWorkspaceSnapshot}
					>
						<DownloadIcon class="size-3.5" />
						Export snapshot
					</Button>
				</div>

				{#if snapshotError}
					<p class="text-xs text-destructive">{snapshotError}</p>
				{/if}

				{#if snapshotNotice}
					<p class="text-xs text-muted-foreground">{snapshotNotice}</p>
				{/if}

				{#if parsedSnapshot}
					<p class="text-xs text-muted-foreground">
						Parsed snapshot from {snapshotFileName}: {parsedSnapshot.messages.length} messages,
						{parsedSnapshot.actionables.length} actionables,
						{parsedSnapshot.outgoingMessages.length} outgoing
					</p>
					<Button size="sm" class="h-7 text-xs" onclick={loadWorkspaceSnapshot}>
						Load snapshot
					</Button>
				{/if}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
