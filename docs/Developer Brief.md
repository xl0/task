# Developer Assessment

## AI Chief of Staff

## Overview

A CEO receives 20+ communications every morning across email, Slack, and WhatsApp. They need an AI system that processes everything, filters the noise, delegates what can be delegated, and surfaces only the decisions that require their attention.

Your task is to build this system.

## Data

- `messages.json` — 20 incoming communications from a single morning.

## Deliverables

A working system with a web UI that produces:

### Triage

Every message classified as:

- **Ignore** — no CEO involvement needed
- **Delegate** — assign to the right person with a drafted handoff. Use names and roles from the messages. Generic delegation is a fail.
- **Decide** — the CEO must act personally

For each: which category and why, and a drafted response matching the tone of the original channel.

### Flags

Anything the CEO should know about. What the issue is, which messages are involved, what you recommend.

### Daily Briefing

One page the CEO reads in under 2 minutes. Must be genuinely useful. If a real CEO wouldn't trust it, it fails.

## Important

- The data contains deliberate traps. Not everything is what it looks like. Your system needs to catch them.
- Later messages may change the picture. Your system should handle that.
- Tone matters. A WhatsApp reply that reads like a corporate email is a fail. Match the channel.

## Technical Requirements

- LLM API (Claude, OpenAI, or equivalent)
- Web UI (React, Next.js, or equivalent). Polished UI is a plus.
- Code on GitHub with a README
- Use of AI dev tools (Claude Code, Cursor, etc.) is encouraged and assessed

## README: What Happens Next

- How your system works
- Key decisions and why
- What you'd improve with more time
- How to run it
- Submit your GitHub repo link
- We review your submission
- If strong: 15-min live interview
- You demo the system and we test it with new data

## Time

Approximately 60 minutes. Not strict. Quality of thinking matters more than completeness.

## Scoring

| Criteria       | What we assess                         |
| -------------- | -------------------------------------- |
| Functionality  | Runs cleanly, handles the data         |
| Output Quality | Classifications, flags, briefing, tone |
| Communication  | Clear explanation, client-ready        |

Each criterion scored 1-5. Total out of 15.

## Context

This is based on a real client project. Strong submissions will directly inform our production build. Top performers will be first in line when the project kicks off.

## Submission

Email both `max@innateaiconsulting.com` and `joseph@innateaiconsulting.com` with:

- GitHub repository link

---

INNATE AI DEVELOPER ASSESSMENT  
`www.innateaiconsulting.com` Confidential
