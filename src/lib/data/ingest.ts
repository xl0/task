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

	return json.map((r: RawMessage) => ({
		id: `m${r.id}` as MessageId,
		channel: r.channel,
		senderName: r.from,
		subject: r.subject,
		channelName: r.channel_name,
		receivedAt: r.timestamp,
		text: r.body,
		read: false
	}));
}
