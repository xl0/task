import type { OutgoingMessage } from '$lib/types';

export const mockOutgoingMessages: OutgoingMessage[] = [
	{
		"id": "o1",
		"parentActionableId": "a1",
		"parentMessageId": "m18",
		"recipient": "Sarah Chen <sarah.chen@meridianventures.com>",
		"subject": "Re: Follow-up: Series B timeline",
		"channel": "email",
		"channelName": "",
		"body": "Hi Sarah,\n\nThanks for the flexibility. Thursday at 10am works well on our side.\n\nWe’ll send the updated revenue projections ahead of the call.\n\nBest,\n[CEO Name]",
		"createdAt": "2026-03-30T16:12:42.478Z",
		"sent": false
	},
	{
		"id": "o2",
		"parentActionableId": "a2",
		"parentMessageId": "m16",
		"recipient": "tom.bradley",
		"subject": "Re: payment service issue",
		"channel": "slack",
		"channelName": "#engineering",
		"body": "Tom — prioritize customer impact and roll back the partial migration if that is the safest way to stabilize checkout. Once contained, send me a short note with root cause, expected recovery timing, and whether we need customer comms.",
		"createdAt": "2026-03-30T16:12:42.478Z",
		"sent": false
	},
	{
		"id": "o3",
		"parentActionableId": "a7",
		"parentMessageId": "m8",
		"recipient": "Rachel Kim <rachel.kim@techstaffing.io>",
		"subject": "Re: Candidate shortlist for VP Engineering role",
		"channel": "email",
		"channelName": "",
		"body": "Hi Rachel,\n\nThanks for sending this through.\n\nPlease go ahead and set up 30-minute intro calls next week for Candidate A and Candidate C. If possible, please send over a few scheduling options and any additional notes from your pre-screen conversations that would be helpful ahead of the calls.\n\nBest,\n[CEO Name]",
		"createdAt": "2026-03-30T16:12:42.478Z",
		"sent": false
	},
	{
		"id": "o4",
		"parentActionableId": "a9",
		"parentMessageId": "m19",
		"recipient": "priya.sharma",
		"subject": "Re: Northwind term",
		"channel": "slack",
		"channelName": "#sales",
		"body": "Priya — let’s accept the 1-year term with renewal option rather than lose the deal. Please see if you can preserve expansion language or a pricing step-up on renewal, and confirm back once legal is aligned.",
		"createdAt": "2026-03-30T16:12:42.478Z",
		"sent": false
	},
	{
		"id": "o5",
		"parentActionableId": "a10",
		"parentMessageId": "m13",
		"recipient": "Alex (Head of People)",
		"subject": "Re: hybrid policy + benefits",
		"channel": "whatsapp",
		"channelName": "",
		"body": "Thanks Alex — please put together a short recommendation on the hybrid-policy feedback, including what you’re hearing, the main risks, and how you suggest we address it with the team. Also send me the benefits package for sign-off by Friday so I can review in time.",
		"createdAt": "2026-03-30T16:12:42.479Z",
		"sent": false
	}
];
