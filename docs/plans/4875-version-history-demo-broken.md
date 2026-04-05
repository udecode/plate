# Issue 4875

## Goal

Fix the version history demo so the editable revision works normally, renders diffs, and stops crashing during the edit and save flow.

## Source Of Truth

- GitHub issue: `#4875`
- Title: `Version history demo broken`
- URL: `https://github.com/udecode/plate/issues/4875`

## Scope

1. Inspect the version history demo and nearby diff/editor patterns.
2. Check `docs/solutions/` for relevant learnings.
3. Reproduce the broken behavior locally.
4. Add the smallest sane regression coverage.
5. Implement the minimal fix.
6. Verify with targeted tests plus required package/app checks.
7. Create or update the PR, then sync back to the issue if verification passes.

## Findings

- Issue report says the demo only accepts typed characters, blocks arrow/delete behavior, shows no diff, and often crashes after editing then saving a revision.
- This is a browser-surface bug in `apps/www`, so local browser repro and final browser verification are required.
- No directly relevant existing solution doc surfaced from the first `docs/solutions/` scan.
- Local browser repro showed repeated Slate path lookup failures for `{"text":". Try removing it."}` after editing near the inline void.
- Root cause: the demo reused the same Slate node objects across the live editor, saved revisions, and read-only comparison editors. That aliasing breaks Slate DOM path resolution and also makes revisions mutate with the current draft, so diffs disappear.
- Keeping the diff plugin out of the editable editor is also the right shape; only the diff pane needs diff rendering behavior.

## Progress

- [x] Fetch issue and comments.
- [x] Read repo instructions and task workflow.
- [x] Start repo-style planning file.
- [x] Inspect implementation and reproduce.
- [x] Add regression coverage.
- [x] Implement fix.
- [x] Verify.
- [ ] PR + issue sync.

## Verification

- `bun test apps/www/src/registry/examples/version-history-demo.spec.tsx`: pass
- `pnpm install`: pass
- `pnpm turbo build --filter=./apps/www`: pass
- `pnpm turbo typecheck --filter=./apps/www`: pass
- `pnpm lint:fix`: pass
- Local browser repro at `http://localhost:3002/docs/examples/version-history`: pass
  - edit + arrow key + backspace no longer throws Slate path errors
  - saving creates `Revision 2`
  - diff pane renders the change instead of staying unchanged
