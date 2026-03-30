import type { Actionable } from '$lib/types';

export const mockActionables: Actionable[] = [
	{
		"id": "a1",
		"messageIds": [
			"m1",
			"m10",
			"m18",
			"m20"
		],
		"action": "decide",
		"title": "Resolve Meridian investor meeting timing and send revenue projections",
		"summary": "Sarah from Meridian wants to proceed with diligence and is flexible to move Thursday’s meeting from 2pm to 10am. Later messages show the internal leadership sync moved to 3pm, removing the conflict, but Sarah still wants confirmation and revenue projections before the call. CEO should decide preferred meeting time and ensure projections are sent before Thursday.",
		"priority": "high",
		"status": "open"
	},
	{
		"id": "a2",
		"messageIds": [
			"m2",
			"m9",
			"m16"
		],
		"action": "decide",
		"title": "Choose rollback vs hotfix for payment service incident and delayed API migration",
		"summary": "Engineering updates escalated from a normal migration status to a live checkout incident affecting about 3% of users. Tom needs a decision within an hour between a safer rollback that costs two weeks and a faster but riskier hotfix. This requires immediate CEO judgment or explicit delegation because the latest message overrides earlier timeline assumptions.",
		"priority": "high",
		"status": "open"
	},
	{
		"id": "a3",
		"messageIds": [
			"m3"
		],
		"action": "ignore",
		"title": "Superseded request to postpone board deck review",
		"summary": "James’s request to push the board deck review was overtaken by his later message confirming finance can provide preliminary numbers and the original Thursday timing should remain. No further action is needed on the earlier postponement request.",
		"priority": "low",
		"status": "done"
	},
	{
		"id": "a4",
		"messageIds": [
			"m4"
		],
		"action": "ignore",
		"title": "Ignore phishing-style security alert",
		"summary": "This message is a suspicious login alert from an unknown domain using urgency and a reset link. It should be treated as phishing and ignored rather than acted on.",
		"priority": "low",
		"status": "done"
	},
	{
		"id": "a5",
		"messageIds": [
			"m5",
			"m6",
			"m17"
		],
		"action": "ignore",
		"title": "Horizon delivery concern resolved with phased client plan",
		"summary": "Initial concern about Horizon being oversold was later resolved internally: Lisa and David aligned on a phased plan with MVP at 6 weeks and full delivery at 10 weeks. Since the internal conflict has been addressed and no CEO action is requested, this can be closed as informational.",
		"priority": "low",
		"status": "done"
	},
	{
		"id": "a6",
		"messageIds": [
			"m7"
		],
		"action": "ignore",
		"title": "Personal family dinner message",
		"summary": "This is a personal WhatsApp message about Sunday dinner plans and not part of company inbox operations. It should be ignored for business triage.",
		"priority": "low",
		"status": "done"
	},
	{
		"id": "a7",
		"messageIds": [
			"m8"
		],
		"action": "delegate",
		"title": "Ask Rachel Kim to schedule VP Engineering intro calls with top candidates",
		"summary": "Rachel shared a vetted shortlist for VP Engineering and recommended prioritizing Candidates A and C, with interviews available next week. Best next step is to delegate a concise reply asking her to set up 30-minute intro calls for those two candidates.",
		"priority": "medium",
		"status": "open"
	},
	{
		"id": "a8",
		"messageIds": [
			"m11"
		],
		"action": "ignore",
		"title": "Ignore AI industry newsletter",
		"summary": "This is a generic newsletter with no specific action requested. It does not need a response or CEO decision.",
		"priority": "low",
		"status": "done"
	},
	{
		"id": "a9",
		"messageIds": [
			"m12",
			"m19"
		],
		"action": "decide",
		"title": "Decide whether to accept Northwind’s revised 1-year contract",
		"summary": "Sales first reported a closed 2-year, 120k ARR Northwind deal, but the latest update says legal will only accept a 1-year term with renewal, reducing ARR to 60k. Priya needs an answer by end of day on whether to accept or push back, so the earlier win announcement is no longer the operative state.",
		"priority": "high",
		"status": "open"
	},
	{
		"id": "a10",
		"messageIds": [
			"m13"
		],
		"action": "delegate",
		"title": "Have Alex address hybrid policy concerns and send benefits package for sign-off",
		"summary": "Alex flagged growing engineering dissatisfaction with the hybrid policy and also needs CEO sign-off on the new benefits package by Friday to preserve pricing. The policy issue should be delegated back to Alex for a recommendation and communication plan, while he also sends the benefits pack for review.",
		"priority": "medium",
		"status": "open"
	},
	{
		"id": "a11",
		"messageIds": [
			"m14"
		],
		"action": "ignore",
		"title": "Marketing Q2 plan noted with no action required",
		"summary": "Mark’s note is a routine FYI on the finalized Q2 marketing plan and explicitly says no decision is needed now. No follow-up is required.",
		"priority": "low",
		"status": "done"
	},
	{
		"id": "a12",
		"messageIds": [
			"m15"
		],
		"action": "ignore",
		"title": "Superseded leadership sync room/time notice",
		"summary": "Laura’s initial confirmation of the Thursday 2pm leadership sync was superseded by her later update moving it to 3pm in a different room. The earlier scheduling note should be closed as outdated.",
		"priority": "low",
		"status": "done"
	}
];
