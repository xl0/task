
We maintain 2 important files besides `CLAUDE.md`:
- `CODE.md`: An in-depth summarry of the current state of the codebase.
- `PLAN.md`: Planning for the codebase. Contains both high-level birds eye view plan, as well as a lower-level todo.

IMPORTANT: At the start of each conversation, always fully read `CODE.md`. You may read `PLAN.md` when relevant to the task.
    You may update the files as you go, but keep the updates concise.
    Don't turn it into a changelog - only reflect the current state. 

## Guidelines

- Always use bun/bunx, not npm
- Use shadcn components when possible. You can install new components.
- Don't do excessive speculative try/catch with fall-backs. Only catch real errors, and default to a clear fail/error message, don't implement fallback solutions.
If we are adding experimental features, no need to gate them - we can always just remove them later.
- Avoid shallow abstractions. Avoid single-use abstractions.
- Don't keep legacy interface/formats around - this is an MVP, there is not need for backwards compat at all.


- Try to use small edits where possible. Unless you are really replacing the whole file content, edit the file, don't delete and rewrit from scratch.
- Don't use sed or other hacks to edit files. Re-read and retry using tools.

- Run `bun run check` and `agent-browser` after major changes:
> agent-browser console --clear && agent-browser errors --clear
> agent-browser navigate ...
> agent-browser console && agent-browser errors
- Unless you are debuggin an active issue, just do a quick check - no screenshots, no or minimal navigation.


Note: we likely already have a dev server running on localhost:5173

- Keep the end of turn summaries very concise.


## UI

- Keep it clean, err on the side of minimalism.
- Avoid adding custom colors, styles or fonts per element - use the one pre-defined in layout.css

## Lovely Docs

The current project will have documentation for many libraries inside ./lovely-docs/.
IMPORTANT: At the START of EVERY session, find all ./lovely-docs/*/`LLM_MAP.md` and read them.
If documentation exists for a library you're about to use, always read the relevant sections before using a feature for the first time.