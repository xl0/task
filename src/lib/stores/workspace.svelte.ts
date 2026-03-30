import { PersistedState } from 'runed';
import type { Message, OutgoingMessage, MessageId } from '$lib/types';
import { mockMessages } from '$lib/data/mock-messages';

class WorkspaceStore {
	#messages = new PersistedState<Message[]>('workspace:messages', mockMessages);
	#outgoingMessages = new PersistedState<OutgoingMessage[]>('workspace:outgoingMessages', []);

	get messages() {
		return this.#messages.current;
	}
	get outgoingMessages() {
		return this.#outgoingMessages.current;
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
		this.#messages.current = [...this.#messages.current, ...messages];
	}

	clear() {
		this.#messages.current = [];
		this.#outgoingMessages.current = [];
	}
}

export const workspace = new WorkspaceStore();
