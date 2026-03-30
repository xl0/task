<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import type { Channel, OutgoingMessage } from '$lib/types';

	let { draft }: { draft: OutgoingMessage } = $props();

	const channelLabel: Record<Channel, string> = {
		email: 'Email',
		slack: 'Slack',
		whatsapp: 'WhatsApp'
	};

	function onChannelChange(value: string) {
		const channel = value as Channel;
		workspace.updateOutgoingMessage(draft.id, { channel });
		if (channel !== 'slack') {
			workspace.updateOutgoingMessage(draft.id, { channelName: undefined });
		}
	}

	function onChannelNameInput(event: Event) {
		workspace.updateOutgoingMessage(draft.id, {
			channelName: (event.currentTarget as HTMLInputElement).value
		});
	}

	function onRecipientInput(event: Event) {
		workspace.updateOutgoingMessage(draft.id, {
			recipient: (event.currentTarget as HTMLInputElement).value
		});
	}

	function onSubjectInput(event: Event) {
		workspace.updateOutgoingMessage(draft.id, {
			subject: (event.currentTarget as HTMLInputElement).value
		});
	}

	let bodyTextarea = $state<HTMLTextAreaElement | null>(null);

	function resizeBodyTextarea(node: HTMLTextAreaElement) {
		node.style.height = 'auto';
		node.style.height = node.scrollHeight + 'px';
	}

	function onBodyInput(event: Event) {
		const node = event.currentTarget as HTMLTextAreaElement;
		workspace.updateOutgoingMessage(draft.id, {
			body: node.value
		});
		resizeBodyTextarea(node);
	}

	$effect(() => {
		draft.body;
		if (!bodyTextarea) return;
		resizeBodyTextarea(bodyTextarea);
	});
</script>

<div class="flex items-center gap-2">
	<Select.Root
		type="single"
		value={draft.channel ?? 'email'}
		onValueChange={(value) => {
			if (value) onChannelChange(value);
		}}
	>
		<Select.Trigger class="h-8 w-[120px] text-xs">
			{channelLabel[(draft.channel ?? 'email') as Channel]}
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="email" label="Email">Email</Select.Item>
			<Select.Item value="slack" label="Slack">Slack</Select.Item>
			<Select.Item value="whatsapp" label="WhatsApp">WhatsApp</Select.Item>
		</Select.Content>
	</Select.Root>
	{#if draft.channel === 'slack'}
		<Input
			class="h-8 flex-1 text-xs"
			value={draft.channelName ?? ''}
			oninput={onChannelNameInput}
			placeholder="#channel"
		/>
	{:else}
		<Input
			class="h-8 flex-1 text-xs"
			value={draft.recipient ?? ''}
			oninput={onRecipientInput}
			placeholder="Recipient"
		/>
	{/if}
</div>

{#if draft.channel !== 'slack'}
	<Input
		class="h-8 w-full text-xs"
		value={draft.subject ?? ''}
		oninput={onSubjectInput}
		placeholder="Subject"
	/>
{/if}

<Textarea bind:ref={bodyTextarea} class="w-full" value={draft.body} oninput={onBodyInput} />
