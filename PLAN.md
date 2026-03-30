# PLAN

## High-Level Plan

- Keep the app client-only with one persisted Workspace store as the source of truth.
- Make the agent loop the primary engine for inbox triage, draft creation, and daily briefing generation.
- Keep UI state in the URL and keep business state in Workspace.
- Favor explicit, typed tool calls over hidden prompt-only reasoning.
- Optimize for fast iteration (no backward-compat layer during MVP).

## Milestones

1. Stabilize agent triage quality and output consistency.
2. Complete end-to-end outgoing message lifecycle (draft -> send -> sent view).
3. Replace remaining mock-derived outputs with loop-generated outputs.
4. Add regression coverage for workspace tools and core loop flows.

## Todo

- [ ] Improve agent loop reliability
  - [ ] Tighten system prompt for deterministic categorization and summaries
  - [ ] Add guardrails for contradictory updates across related messages
- [ ] Finalize outgoing message flow
  - [ ] Generate/update drafts from loop for `decide` and `delegate` actionables
  - [ ] Implement send action that marks draft as sent and updates routing/list placement
- [ ] Finalize daily briefing generation
  - [ ] Generate briefing markdown from current workspace state each loop run
  - [ ] Ensure stale briefing content is replaced cleanly on re-run
- [ ] Add validation and test coverage
  - [ ] Add smoke tests for `insert_*`/`update_*` tool behavior and relation integrity
  - [ ] Add loop-level smoke test using a representative imported message set
