export type Channel = 'email' | 'slack' | 'whatsapp';

export type MessageId = `m${number}`;
export type ActionableId = `a${number}`;
export type OutgoingMessageId = `o${number}`;

export type Message = {
	id: MessageId;
	channel: Channel;
	senderName: string;
	subject?: string;
	channelName?: string;
	receivedAt: string;
	summary?: string;
	text: string;
	read?: boolean;
};

export type Actionable = {
	id: ActionableId;
	messageIds: MessageId[];
	action: 'ignore' | 'delegate' | 'decide';
	title: string;
	summary: string;
	priority: 'low' | 'medium' | 'high';
	status: 'open' | 'done';
};

export type OutgoingMessage = {
	id: OutgoingMessageId;
	parentActionableId?: ActionableId;
	parentMessageId?: MessageId;
	recipient?: string;
	subject?: string;
	channel?: Channel;
	channelName?: string;
	body: string;
	createdAt?: string;
	sent: boolean;
};

export type DailyBriefing = {
	generatedAt: string;
	markdown: string;
};
