Read [Codex playbook execution](../references/codex-playbooks.md) for the tool, lifecycle, and proof mapping before executing this recipe. Preserve the steps below; record any unavailable capability or inapplicable step explicitly.

### Pause safely

**You own a clean stop. Leave a checkpoint a cold-start agent can resume from.** For "pause safely", "I need to go offline", "restart Cursor", or "board my flight", and when context is about to compact or summarize. This is explicit only. On "keep going", "going to bed, keep going", or "don't stop", do not pause. Those mean continue, and Autonomous run already checkpoints per iteration.

1. Stop at a safe boundary. Finish the current atomic step or back out of it. Never stop mid-edit in a known-broken state. Start nothing new, and cancel any nested subagents.
2. Don't cross an irreversible line to pause. No PR and no push unless you already had one out.
3. Make the work durable. Commit uncommitted edits as one clear `wip:` commit on the current branch so nothing is lost. If the tree is broken, say so in the commit body in one line.
4. Write the resume note off-context. Capture intent, what you were doing, progress and what's verified, current state, next steps, key files, and gotchas. For the compaction trigger write it to a file like `/tmp/<slug>-resume.md`, because the in-context plan won't survive summarization. If a show-me-your-work trail exists, point at it instead of duplicating it.

**Reply:** where you are in the loop, what's on disk versus still in your head (paths, no diff dumps), the commits you made and whether the tree is clean, and the first action on resume. This is a pause, not a final report. Resume is the Session pickup playbook reading this note.
