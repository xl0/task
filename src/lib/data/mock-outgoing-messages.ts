import type { OutgoingMessage } from '$lib/types';

export const mockOutgoingMessages: OutgoingMessage[] = [
	{
		id: 'o1',
		parentActionableId: 'a1',
		parentMessageId: 'm16',
		recipient: 'tom.bradley@innate.com',
		subject: 'Decision: rollback payment migration now',
		channel: 'email',
		body: 'Tom,\n\nPlease start the rollback immediately and post a status update every 30 minutes until checkout failures are back to baseline.\n\nAfter rollback, share a short root-cause summary and a proposed hotfix plan for next sprint.\n\nThanks.',
		createdAt: '2026-03-18T11:32:00Z',
		sent: false
	},
	{
		id: 'o2',
		parentActionableId: 'a2',
		parentMessageId: 'm19',
		recipient: 'sarah.chen@meridian.vc',
		subject: 'Northwind terms and next step',
		channel: 'email',
		body: 'Sarah,\n\nThanks for sharing the revised terms. We can proceed on a 1-year structure if we include a pre-agreed expansion checkpoint after month six tied to adoption milestones.\n\nIf that works, I can have legal turn this around today.\n\nBest,',
		createdAt: '2026-03-18T11:45:00Z',
		sent: false
	},
	{
		id: 'o3',
		parentActionableId: 'a3',
		parentMessageId: 'm1',
		recipient: 'james@innate.com',
		subject: 'Thursday schedule lock',
		channel: 'email',
		body: 'James,\n\nPlease lock Thursday as follows:\n- 10:00 Meridian (Sarah)\n- 15:00 leadership sync\n\nSend the final calendar updates today and confirm all attendees have accepted.\n\nThanks.',
		createdAt: '2026-03-18T11:52:00Z',
		sent: false
	},
	{
		id: 'o4',
		parentActionableId: 'a4',
		parentMessageId: 'm13',
		recipient: 'alex@innate.com',
		subject: 'Benefits package approval',
		channel: 'email',
		body: 'Alex,\n\nApproved on my side. Please submit the provider paperwork before Friday and confirm once filed so we keep the quoted rate.\n\nThanks.',
		createdAt: '2026-03-18T12:05:00Z',
		sent: false
	},
	{
		id: 'o5',
		parentActionableId: 'a5',
		parentMessageId: 'm8',
		recipient: 'rachel.kim@searchpartners.com',
		subject: 'VP Engineering interviews: Candidate A and C',
		channel: 'email',
		body: "Rachel,\n\nLet's move forward with Candidate A and Candidate C first. Please send me two interview slots for each next week and copy recruiting ops.\n\nBest,",
		createdAt: '2026-03-18T12:18:00Z',
		sent: false
	},
	{
		id: 'o6',
		parentActionableId: 'a6',
		parentMessageId: 'm13',
		recipient: 'alex@innate.com',
		subject: 'Please own hybrid policy response',
		channel: 'email',
		body: 'Alex,\n\nCan you own this and send me a draft response plan by tomorrow morning? Please include immediate comms, manager talking points, and a short FAQ for the team.\n\nThanks.',
		createdAt: '2026-03-18T10:42:00Z',
		sent: true
	},
	{
		id: 'o7',
		parentActionableId: 'a7',
		parentMessageId: 'm18',
		recipient: 'finance@innate.com',
		subject: 'Need Meridian revenue projections by Wednesday',
		channel: 'slack',
		body: 'Please prepare updated revenue projections for the Meridian diligence call. I need final numbers and assumptions by Wednesday 4pm.',
		createdAt: '2026-03-18T10:58:00Z',
		sent: true
	}
];
