import type { Message } from '$lib/types';

export const mockMessages: Message[] = [
	{
		id: 'm1',
		channel: 'email',
		senderName: 'Sarah Chen <sarah.chen@meridianventures.com>',
		subject: 'Follow-up: Series B timeline',
		receivedAt: '2026-03-18T08:12:00Z',
		summary:
			'Wants to lock in Thursday 2pm for due diligence; needs revenue projections by Wednesday.',
		text: "Hi,\n\nGreat catching up last week. As discussed, we'd like to move forward with the due diligence process. Can we lock in a meeting this Thursday at 2pm to go through the financials? I'll have our analysts on the call as well.\n\nWould also appreciate the updated revenue projections by Wednesday if possible.\n\nBest,\nSarah",
		read: false
	},
	{
		id: 'm2',
		channel: 'slack',
		senderName: 'tom.bradley',
		channelName: '#engineering',
		receivedAt: '2026-03-18T08:34:00Z',
		summary: 'API migration ~60% done, on track for Friday. Auth refactor might add a day.',
		text: 'heads up - the API migration is about 60% done. should be wrapped by friday. no blockers right now but flagging that we might need an extra day if the auth refactor takes longer than expected.',
		read: false
	},
	{
		id: 'm3',
		channel: 'whatsapp',
		senderName: 'James (COO)',
		receivedAt: '2026-03-18T08:45:00Z',
		summary: 'Asks to push board deck review to next week — waiting on Q1 numbers.',
		text: "Morning. Quick one - can we push the board deck review to next week? I'm still waiting on the Q1 numbers from finance and don't want to present half-baked figures.",
		read: false
	},
	{
		id: 'm4',
		channel: 'email',
		senderName: 'noreply@seczure-verify.com',
		subject: 'URGENT: Unusual login detected on your account',
		receivedAt: '2026-03-18T09:01:00Z',
		summary: 'Phishing email — fake security alert from spoofed domain seczure-verify.com.',
		text: "We detected an unusual sign-in to your account from an unrecognized device in Lagos, Nigeria. If this wasn't you, please verify your identity immediately by clicking the link below to secure your account.\n\nVerify Now: https://seczure-verify.com/auth/reset?token=8f3k2j\n\nIf you do not verify within 24 hours, your account will be permanently suspended.\n\nSecurity Team",
		read: false
	},
	{
		id: 'm5',
		channel: 'slack',
		senderName: 'lisa.park',
		channelName: '#product',
		receivedAt: '2026-03-18T09:15:00Z',
		summary: 'Horizon demo went well, client happy. Next iteration in two weeks, no changes.',
		text: "FYI the Horizon project demo went well with the client yesterday. They're happy with the direction and want to see the next iteration in two weeks. No changes requested.",
		read: false
	},
	{
		id: 'm6',
		channel: 'email',
		senderName: 'David Morrison <david.m@company.com>',
		subject: 'Horizon project - concerns',
		receivedAt: '2026-03-18T09:22:00Z',
		summary: 'Flags timeline mismatch — client expects 6 weeks, realistic estimate is 10-12.',
		text: "Hey,\n\nWanted to flag something about Horizon. I was on the client call yesterday and I think we're overselling the timeline. The client thinks we'll have the full platform ready in 6 weeks but realistically we're looking at 10-12 weeks minimum given the current resourcing. Lisa presented it as on track but I don't think that's accurate.\n\nThink we need to have an honest conversation internally before the next client touchpoint.\n\nDavid",
		read: false
	},
	{
		id: 'm7',
		channel: 'whatsapp',
		senderName: 'Mum',
		receivedAt: '2026-03-18T09:30:00Z',
		summary: "Sunday dinner invite — dad's lasagne. Bring the wine from last time.",
		text: "Hi love, just checking if you're still coming for dinner on Sunday? Dad's making his lasagne. Let me know so I can get the shopping in. Also your sister says hi and wants to know if you can bring that wine from last time xx",
		read: false
	},
	{
		id: 'm8',
		channel: 'email',
		senderName: 'Rachel Kim <rachel.kim@techstaffing.io>',
		subject: 'Candidate shortlist for VP Engineering role',
		receivedAt: '2026-03-18T09:45:00Z',
		summary:
			'Four pre-screened VP Eng candidates. Recommends Candidate A (ex-Stripe) and C (ex-Datadog).',
		text: "Hi,\n\nAs discussed, please find attached the shortlist of 4 candidates for the VP Engineering position. All have been pre-screened and are available for interviews starting next week.\n\nI'd recommend prioritising Candidate A (ex-Stripe) and Candidate C (ex-Datadog) based on your requirements. Happy to set up 30-min intro calls whenever works.\n\nLet me know how you'd like to proceed.\n\nBest,\nRachel",
		read: false
	},
	{
		id: 'm9',
		channel: 'slack',
		senderName: 'tom.bradley',
		channelName: '#engineering',
		receivedAt: '2026-03-18T10:05:00Z',
		summary:
			'API migration blocked — payment service dependency issue. Timeline may slip to next Wednesday.',
		text: 'update on the API migration - just found a dependency issue with the payment service. going to need to pause and figure this out. might push the timeline back to next wednesday. will keep you posted.',
		read: false
	},
	{
		id: 'm10',
		channel: 'whatsapp',
		senderName: 'James (COO)',
		receivedAt: '2026-03-18T10:20:00Z',
		summary:
			'Reverses earlier request — keep board deck Thursday. Asks to confirm 2pm investor meeting with Sarah.',
		text: "Actually ignore my earlier message about pushing the board deck. Just spoke to finance and they can get me preliminary numbers by tomorrow. Let's keep the original Thursday slot. Also can you confirm we have the investor meeting at 2pm Thursday? Sarah from Meridian is expecting us.",
		read: false
	},
	{
		id: 'm11',
		channel: 'email',
		senderName: 'newsletter@techdigest.com',
		subject: "This week in AI: 5 trends you can't ignore",
		receivedAt: '2026-03-18T10:30:00Z',
		summary: 'Newsletter — AI regulation, funding rounds, agentic workflows. Low priority.',
		text: "Good morning,\n\nThis week's roundup covers the latest in AI regulation, new funding rounds, and why every CEO should be paying attention to agentic workflows.\n\n1. EU AI Act enforcement begins...\n2. Anthropic raises another $2B...\n3. Why agents are replacing dashboards...\n4. The hidden cost of AI technical debt...\n5. Interview: How one startup cut costs 40% with AI ops...\n\nRead the full newsletter at techdigest.com/weekly\n\nUnsubscribe",
		read: false
	},
	{
		id: 'm12',
		channel: 'slack',
		senderName: 'priya.sharma',
		channelName: '#sales',
		receivedAt: '2026-03-18T10:45:00Z',
		summary: 'Closed Northwind deal — 120k ARR, 2-year contract. Onboarding starts April 1st.',
		text: 'closed Northwind deal!! 120k ARR, 2 year contract. they want onboarding to start april 1st. @tom.bradley can eng support the integration timeline?',
		read: false
	},
	{
		id: 'm13',
		channel: 'whatsapp',
		senderName: 'Alex (Head of People)',
		receivedAt: '2026-03-18T11:00:00Z',
		summary:
			'Two things: engineering grumbling about hybrid policy; needs benefits package sign-off by Friday.',
		text: "hey so um yeah I wanted to talk to you about something, it's not super urgent or anything but basically I had a chat with a couple of the engineering team yesterday and there's some grumbling about the new hybrid policy, like people feel it was kind of sprung on them without much consultation you know, and I think maybe we should address it before it becomes a bigger thing, oh and also completely separately I need your sign-off on the new benefits package by end of day Friday because the provider needs confirmation before the 21st or we lose the rate, anyway let me know when you have 5 mins to chat about the hybrid thing",
		read: false
	},
	{
		id: 'm14',
		channel: 'email',
		senderName: 'Mark Zhang <mark.z@company.com>',
		subject: 'Quick update - marketing Q2 plan',
		receivedAt: '2026-03-18T11:15:00Z',
		summary:
			'FYI only — Q2 marketing plan finalised. New brand campaign, +20% paid spend. No action needed.',
		text: "Hi,\n\nJust wanted to let you know the Q2 marketing plan is finalised and the team is executing. No decisions needed from your end right now - just keeping you in the loop.\n\nHighlights: launching the new brand campaign in April, increasing paid spend by 20%, and testing two new channels (podcast sponsorships and LinkedIn thought leadership).\n\nWill share the full deck at next month's all-hands.\n\nMark",
		read: false
	},
	{
		id: 'm15',
		channel: 'email',
		senderName: 'Laura Singh <laura.s@company.com>',
		subject: 'RE: Thursday meeting',
		receivedAt: '2026-03-18T11:30:00Z',
		summary: 'Leadership sync confirmed Thursday 2pm — conflicts with Sarah Chen investor meeting.',
		text: 'Hi,\n\nConfirming the leadership team sync is booked for Thursday at 2pm in the main boardroom. Agenda: Q1 review, hiring update, and Horizon project status.\n\nPlease let me know if you need anything added to the agenda.\n\nThanks,\nLaura',
		read: false
	},
	{
		id: 'm16',
		channel: 'slack',
		senderName: 'tom.bradley',
		channelName: '#engineering',
		receivedAt: '2026-03-18T11:45:00Z',
		summary:
			'URGENT: Payment service issue hitting 3% of live checkouts. Needs rollback vs hotfix decision within an hour.',
		text: "update on the payment service dependency - it's worse than I thought. the issue affects live transactions, not just the migration. we're seeing intermittent failures on checkout for about 3% of users right now. need a decision on whether to roll back the partial migration or push through a hotfix. rolling back is safer but sets us back 2 weeks. hotfix is faster but risky. need an answer in the next hour.",
		read: false
	},
	{
		id: 'm17',
		channel: 'email',
		senderName: 'David Morrison <david.m@company.com>',
		subject: 'RE: Horizon project - update',
		receivedAt: '2026-03-18T12:00:00Z',
		summary:
			'Resolved — Lisa and David aligned on revised 10-week timeline with phased delivery. No action needed.',
		text: "Hey,\n\nFollowing up on my earlier email. I spoke to Lisa and we've aligned. She agrees the 6-week timeline was optimistic. We're going to present a revised 10-week timeline to the client at the next touchpoint and frame it as a phased delivery (MVP at 6 weeks, full platform at 10).\n\nSo this is handled - no action needed from you on this anymore.\n\nDavid",
		read: false
	},
	{
		id: 'm18',
		channel: 'whatsapp',
		senderName: 'Sarah Chen (Meridian Ventures)',
		receivedAt: '2026-03-18T12:15:00Z',
		summary:
			'Offers to move Thursday to 10am. Needs revenue projections before the call — partners meeting following Monday.',
		text: "Hi - just checking in on Thursday. I realise 2pm might clash with your internal meetings. Happy to do 10am instead if that's easier? Let me know. Also just to flag, our partners meeting is the following Monday so ideally we'd have the revenue projections before Thursday's call.",
		read: false
	},
	{
		id: 'm19',
		channel: 'slack',
		senderName: 'priya.sharma',
		channelName: '#sales',
		receivedAt: '2026-03-18T12:30:00Z',
		summary:
			'Northwind deal terms changed by legal — dropped to 1-year/60k ARR. Needs decision by EOD.',
		text: "bit of an issue with the Northwind deal I announced earlier. their legal team just came back and said they can't sign the 2-year term. they want 1 year with an option to renew. that drops the deal to 60k ARR. do we accept or push back? they're expecting an answer by end of day.",
		read: false
	},
	{
		id: 'm20',
		channel: 'email',
		senderName: 'Laura Singh <laura.s@company.com>',
		subject: 'RE: Thursday meeting - room change',
		receivedAt: '2026-03-18T12:45:00Z',
		summary: 'Leadership sync moved to 3pm in small meeting room — resolves the 2pm conflict.',
		text: "Hi,\n\nSmall update - the main boardroom is booked for a client visit on Thursday afternoon. I've moved the leadership sync to 3pm in the small meeting room instead. Updated calendar invite sent.\n\nThanks,\nLaura",
		read: false
	}
];
