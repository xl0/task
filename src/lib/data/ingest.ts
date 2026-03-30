import type { Message, MessageId } from '$lib/types';

/** Raw shape from docs/Messages JSON.json */
type RawMessage = {
	id: number;
	channel: 'email' | 'slack' | 'whatsapp';
	from: string;
	to?: string;
	subject?: string;
	channel_name?: string;
	timestamp: string;
	body: string;
};

export function parseRawMessages(json: unknown): Message[] {
	if (!Array.isArray(json)) throw new Error('Expected a JSON array of messages');

	const messages = json.map((r: RawMessage) => ({
		id: `m${r.id}` as MessageId,
		channel: r.channel,
		senderName: r.from,
		subject: r.subject,
		channelName: r.channel_name,
		receivedAt: r.timestamp,
		text: r.body,
		read: false
	}));

	const seen = new Set<MessageId>();
	const duplicatesInFile = new Set<MessageId>();
	for (const message of messages) {
		if (seen.has(message.id)) duplicatesInFile.add(message.id);
		seen.add(message.id);
	}

	if (duplicatesInFile.size > 0) {
		const ids = [...duplicatesInFile].sort().join(', ');
		throw new Error(`Import failed: duplicate message IDs in JSON: ${ids}`);
	}

	return messages;
}

export function assertNoExistingMessageIds(messages: Message[], existingIds: Iterable<MessageId>) {
	const existing = new Set(existingIds);
	const collisions: MessageId[] = [];

	for (const message of messages) {
		if (existing.has(message.id)) collisions.push(message.id);
	}

	if (collisions.length > 0) {
		const ids = [...new Set(collisions)].sort().join(', ');
		throw new Error(
			`Import failed: message IDs already exist in workspace: ${ids}. Clear workspace or remove duplicates before importing.`
		);
	}
}
