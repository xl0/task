import type { Actionable } from '$lib/types';

export const mockActionables: Actionable[] = [
	// === DECIDE ===
	{
		id: 'a1',
		messageIds: ['m16', 'm9', 'm2'],
		outgoingMessageIds: ['o1'],
		action: 'decide',
		title: 'Payment service: rollback vs hotfix',
		summary:
			'3% checkout failures from partial API migration. Tom needs a decision within the hour — rollback (safe, 2-week setback) or hotfix (fast, risky).',
		priority: 'high',
		status: 'open'
	},
	{
		id: 'a2',
		messageIds: ['m19', 'm12'],
		outgoingMessageIds: ['o2'],
		action: 'decide',
		title: 'Northwind deal terms changed',
		summary:
			'Legal dropped from 2-year/120k to 1-year/60k ARR. Accept or push back? Answer needed by EOD.',
		priority: 'high',
		status: 'open'
	},
	{
		id: 'a3',
		messageIds: ['m1', 'm3', 'm10', 'm15', 'm18', 'm20'],
		outgoingMessageIds: ['o3'],
		action: 'decide',
		title: 'Thursday scheduling conflict',
		summary:
			'Sarah Chen investor meeting and leadership sync both at 2pm Thursday. Laura moved sync to 3pm; Sarah offers 10am. Confirm final schedule.',
		priority: 'high',
		status: 'open'
	},
	{
		id: 'a4',
		messageIds: ['m13'],
		outgoingMessageIds: ['o4'],
		action: 'decide',
		title: 'Benefits package sign-off',
		summary: 'Alex needs sign-off by Friday — provider deadline is the 21st or rate is lost.',
		priority: 'medium',
		status: 'open'
	},
	{
		id: 'a5',
		messageIds: ['m8'],
		outgoingMessageIds: ['o5'],
		action: 'decide',
		title: 'VP Engineering candidate interviews',
		summary:
			'Rachel sent 4 candidates. Recommends Candidate A (ex-Stripe) and C (ex-Datadog). Schedule intro calls.',
		priority: 'medium',
		status: 'open'
	},

	// === DELEGATE ===
	{
		id: 'a6',
		messageIds: ['m13'],
		outgoingMessageIds: ['o6'],
		action: 'delegate',
		title: 'Hybrid policy team concerns',
		summary:
			'Engineering grumbling about hybrid policy rollout. Alex wants to address before it escalates. Delegate to Alex to draft a response plan.',
		priority: 'medium',
		status: 'open'
	},
	{
		id: 'a7',
		messageIds: ['m1', 'm10', 'm18'],
		outgoingMessageIds: ['o7'],
		action: 'delegate',
		title: 'Revenue projections for Meridian',
		summary:
			'Sarah needs updated revenue projections before Thursday. Delegate to finance to prepare.',
		priority: 'high',
		status: 'open'
	},

	// === IGNORE ===
	{
		id: 'a8',
		messageIds: ['m4'],
		outgoingMessageIds: [],
		action: 'ignore',
		title: 'Phishing email — seczure-verify.com',
		summary: 'Fake security alert from spoofed domain. Delete and report.',
		priority: 'low',
		status: 'open'
	},
	{
		id: 'a9',
		messageIds: ['m11'],
		outgoingMessageIds: [],
		action: 'ignore',
		title: 'Tech Digest newsletter',
		summary: 'Weekly AI newsletter. No action needed.',
		priority: 'low',
		status: 'open'
	},
	{
		id: 'a10',
		messageIds: ['m5', 'm6', 'm17'],
		outgoingMessageIds: [],
		action: 'ignore',
		title: 'Horizon timeline — resolved',
		summary: 'David and Lisa aligned on revised 10-week phased timeline. No action needed.',
		priority: 'low',
		status: 'done'
	},
	{
		id: 'a11',
		messageIds: ['m14'],
		outgoingMessageIds: [],
		action: 'ignore',
		title: 'Marketing Q2 plan — FYI',
		summary: 'Mark shared Q2 plan. No decisions needed.',
		priority: 'low',
		status: 'open'
	},
	{
		id: 'a12',
		messageIds: ['m7'],
		outgoingMessageIds: [],
		action: 'ignore',
		title: 'Sunday dinner with Mum',
		summary: 'Personal — confirm attendance, bring wine.',
		priority: 'low',
		status: 'open'
	}
];
