import { PersistedState } from 'runed';
import type {
	Message,
	OutgoingMessage,
	Actionable,
	DailyBriefing,
	MessageId,
	ActionableId,
	OutgoingMessageId
} from '$lib/types';
import { mockMessages } from '$lib/data/mock-messages';
import { mockActionables } from '$lib/data/mock-actionables';
import { mockOutgoingMessages } from '$lib/data/mock-outgoing-messages';
import { mockDailyBriefing } from '$lib/data/mock-daily-briefing';

class WorkspaceStore {
	#messages = new PersistedState<Message[]>('workspace:messages', mockMessages);
	#actionables = new PersistedState<Actionable[]>('workspace:actionables', mockActionables);
	#outgoingMessages = new PersistedState<OutgoingMessage[]>(
		'workspace:outgoingMessages',
		mockOutgoingMessages
	);
	#briefing = new PersistedState<DailyBriefing | null>('workspace:briefing', mockDailyBriefing);

	constructor() {
		this.#messages.current = this.#sortMessagesById(this.#messages.current);
	}

	get messages() {
		return this.#messages.current;
	}
	get actionables() {
		return this.#actionables.current;
	}
	get outgoingMessages() {
		return this.#outgoingMessages.current;
	}
	get briefing() {
		return this.#briefing.current;
	}

	getActionable(id: ActionableId): Actionable | undefined {
		return this.#actionables.current.find((a) => a.id === id);
	}

	getOutgoingMessage(id: OutgoingMessageId): OutgoingMessage | undefined {
		return this.#outgoingMessages.current.find((m) => m.id === id);
	}

	getOutgoingMessages(sent: boolean): OutgoingMessage[] {
		return this.#outgoingMessages.current
			.filter((m) => m.sent === sent)
			.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
	}

	getActionablesByAction(action: Actionable['action']): Actionable[] {
		const priority = { high: 0, medium: 1, low: 2 };
		return this.#actionables.current
			.filter((a) => a.action === action)
			.sort((a, b) => priority[a.priority] - priority[b.priority]);
	}

	get inboxCount(): number {
		return this.#messages.current.filter((m) => !m.read).length;
	}

	getMessage(id: MessageId): Message | undefined {
		return this.#messages.current.find((m) => m.id === id);
	}

	markRead(id: MessageId) {
		const msg = this.#messages.current.find((m) => m.id === id);
		if (msg) msg.read = true;
	}

	markUnread(id: MessageId) {
		const msg = this.#messages.current.find((m) => m.id === id);
		if (msg) msg.read = false;
	}

	markAllUnread() {
		for (const msg of this.#messages.current) {
			msg.read = false;
		}
	}

	addMessages(messages: Message[]) {
		this.#messages.current = this.#sortMessagesById([...this.#messages.current, ...messages]);
	}

	setMessages(messages: Message[]) {
		this.#messages.current = this.#sortMessagesById(messages);
	}

	setActionables(actionables: Actionable[]) {
		this.#actionables.current = actionables;
	}

	setOutgoingMessages(outgoingMessages: OutgoingMessage[]) {
		this.#outgoingMessages.current = outgoingMessages;
	}

	setBriefing(briefing: DailyBriefing | null) {
		this.#briefing.current = briefing;
	}

	updateOutgoingMessage(id: OutgoingMessageId, patch: Partial<OutgoingMessage>) {
		const msg = this.#outgoingMessages.current.find((m) => m.id === id);
		if (!msg) return;

		if (patch.recipient !== undefined) msg.recipient = patch.recipient;
		if (patch.subject !== undefined) msg.subject = patch.subject;
		if (patch.body !== undefined) msg.body = patch.body;
		if (patch.channel !== undefined) msg.channel = patch.channel;
		if (patch.channelName !== undefined) msg.channelName = patch.channelName;
	}

	sendOutgoingMessage(id: OutgoingMessageId) {
		const msg = this.#outgoingMessages.current.find((m) => m.id === id);
		if (!msg || msg.sent) return;
		msg.sent = true;
		msg.createdAt = new Date().toISOString();
	}

	reset() {
		this.#messages.current = this.#sortMessagesById(mockMessages);
		this.#actionables.current = mockActionables;
		this.#outgoingMessages.current = mockOutgoingMessages;
		this.#briefing.current = mockDailyBriefing;
	}

	clear() {
		this.#messages.current = [];
		this.#actionables.current = [];
		this.#outgoingMessages.current = [];
		this.#briefing.current = null;
	}

	#sortMessagesById(messages: Message[]) {
		return [...messages].sort((a, b) => this.#messageIdNumber(a.id) - this.#messageIdNumber(b.id));
	}

	#messageIdNumber(id: MessageId) {
		return Number.parseInt(id.slice(1), 10);
	}
}

export const workspace = new WorkspaceStore();
