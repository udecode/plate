# Verification Blocker Fixes

## Goal

Get the post-coverage verification slice back to green by fixing the remaining type and build blockers in `tag`, `tabbable`, and `docx-io`, then rerun the relevant checks.

## Relevant Learnings

- Filtered package typecheck can still fail until workspace-built exports exist.
- `docx-io` has hit this exact built-export trap before.

## Plan

1. Rerun narrowed tests and filtered typecheck against the current patches.
2. If `docx-io` still fails, fix the smallest real source or config seam.
3. Run `lint:fix`.
4. If filtered typecheck is clean but root build is still suspect, build the minimal upstream package graph needed to prove the repo state.

## Progress

- Skills reloaded after compaction.
- Relevant learnings checked.
- Waiting on fresh narrowed verification.
