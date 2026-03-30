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

function parseSenderName(from: string): string {
	const angleMatch = from.match(/^(.+?)\s*<.+>$/);
	if (angleMatch) return angleMatch[1].trim();

	const parenMatch = from.match(/^(.+?)\s*\((.+)\)$/);
	if (parenMatch) return `${parenMatch[1].trim()} (${parenMatch[2].trim()})`;

	return from;
}

function truncate(body: string, len = 100): string {
	const line = body.split('\n').find((l) => l.trim().length > 0) ?? body;
	return line.length > len ? line.slice(0, len) + '...' : line;
}

export function parseRawMessages(json: unknown): Message[] {
	if (!Array.isArray(json)) throw new Error('Expected a JSON array of messages');

	return json.map((r: RawMessage) => ({
		id: `m${r.id}` as MessageId,
		channel: r.channel,
		senderName: parseSenderName(r.from),
		subject: r.subject,
		channelName: r.channel_name,
		receivedAt: r.timestamp,
		summary: r.subject ?? truncate(r.body),
		text: r.body,
		read: false
	}));
}
