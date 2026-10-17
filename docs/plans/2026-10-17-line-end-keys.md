# Home, End and their Shift variants stay on the line

Status: executed: uncommitted on next, waiting on your commit
Page: https://claude.ai/artifact/VWTFNHe9PUaA1eTCjN73Sg
Playbook: bug-fix

## Brief

### What will change?

On a Mac, Shift+End and Shift+Home now select to the line's edge, not the document's. End and Home stop at a line break in code blocks, and End no longer jumps into a synced block. The fix sits in next's working tree, waiting for your commit.

### What could go wrong?

On a wrapped paragraph, Home and End still go to the paragraph's edge, not the wrapped line's edge. That's its own suggested task, because the caret there needs extra drawing work. Backspace after Shift+End over a whole line deletes the line, where the card expected an empty line to stay. Every check ran in Chromium on a Mac. The review of the decision log found nothing critical, and its warnings are in the Close.

## Teach

Home and End move the caret to the start or end of its line. Shift+Home and Shift+End stretch the selection there. Plite handles these keys itself, because the browser's version can land somewhere Plite can't use, like inside an inline element.

Before this fix, Plite handled only the plain keys. Shift+End went to the browser, and a Mac binds it to "select to the end of the document". Plite also treated a whole text block as one line, so End in a code block skipped every line break. And next to a synced block, a separate step ran first and moved End into that block.

Now one matcher reads every line key Plite handles, and one function finds the line's edge. That edge is the nearest line break, or the block's edge when the line has none. Line keys never move the caret into a synced block or any other editor root.

## Demo

Run the www dev server with `pnpm --filter www dev --port 3297` and use a Mac, since the Shift keys only changed there.

1. Open `http://localhost:3297/blocks/editor-default`. Type "One", Enter, "Two words", Enter, "Three". Press Up, Home, then Shift+End. Only "Two words" is selected. Before, the selection ran on into "Three".
   ![after](artifacts/2026-10-17-line-end-keys/demo/editor-default-shift-end-after.png)
2. Open `http://localhost:3297/blocks/playground`. Click inside "hello" in the code block, press End, then Shift+Home. Only "function hello() {" is selected. Before, End skipped the line break and went to the end of the code block, the same failure the plaintext test caught on next.
   ![after](artifacts/2026-10-17-line-end-keys/demo/playground-code-shift-home-after.png)
3. Open `http://localhost:3297/examples/plite/plaintext`. Click the text, press End, Shift+Enter, type "abc def", then press Home and Shift+End. Only "abc def" is selected. Before, Home went to the start of the first line.
   ![after](artifacts/2026-10-17-line-end-keys/demo/plaintext-soft-break-shift-end-after.jpg)
4. Open `http://localhost:3297/examples/plite/synced-blocks`. Click "p1", press End, then Shift+Home. The caret stays on "p1", and "p1" gets selected. Before, End moved the caret into the synced block below it.
   ![after](artifacts/2026-10-17-line-end-keys/demo/synced-blocks-end-after.png)

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a line is for Home and End | The text between line breaks, or the whole paragraph when it has none (look) | The wrapped line on screen, as Windows does, built now with its own caret drawing | wrapped lines | big |
| Shift+Home and Shift+End on Windows and Linux | Leave them to the browser, which already stops at the wrapped line's edge. The exception is a selection that already reaches into a synced block, where Plite moves it to the paragraph's edge (look) | Handle them in Plite like End, which would stretch to the paragraph's edge on a wrapped paragraph | own shift everywhere | small |
| Backspace after Shift+End selects a whole line | Backspace removes the whole line, because Plite deletes a block when a selection covers all of its text. The locked rule for a block after a closed Details, which the reporter's playground test checks, depends on that. The card expected an empty line to stay (look) | Keep an empty line, as Chrome does, which needs the delete rule to tell a typed text range from a whole-block pick | keep empty line | small |
| Control+A and Control+E on a Mac | Stop at the line break, like Mac apps | Follow Home and End | ctrl follows home | detail |
| Line moves sent as commands | Move each end of the selection, like the keys already do | Keep dropping the selection to one end | command collapse | detail |
| Who writes the code | I write it, because a brief for a worker would be as long as the change | Hand the coding to Codex | codex build | detail |

## Main changes

- `getLineBoundaryKeyboardMove` in `packages/plitejs/src/dom/utils/hotkeys.ts`, exported through `dom/internal`, replaces `isMoveLineStart` and `isMoveLineEnd` and returns `{ extend, reverse }`, the shape `getDocumentBoundaryKeyboardMove` returns. Home and End match everywhere. Apple hosts add Shift+Home, Shift+End, Control+A, Control+E and their Shift variants. The published `Hotkeys` object is unchanged.
- `getLineBoundaryPoint` in `packages/plitejs/src/react/editable/line-boundary.ts` stops at the nearest `\n` inside the point's text block, and falls back to the existing `unit: 'line'` step kept inside that block. `getLineBoundarySelection` turns it into a selection: with `extend` only the focus moves, otherwise each end moves to its own line's edge. The caret engine and the mutation controller both call it, so the command path no longer collapses an expanded selection.
- Content-root navigation never moves a `line` action across a root edge, and a root-local `line` move inside a content root uses `getLineBoundaryPoint`.

## Steps

- [x] Reproduce Shift+End on the reporter's route. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/base-details-shift-end-a1.log`.
- [x] Pick the design through `architect`. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/architect/judge-verdict.md`.
- [x] Write the failing tests first and see each fail on next for its named defect: Shift+End and Shift+Home in plaintext, End and Home at a line break in plaintext, End before a synced block, and the restored Shift+End step in `details-caret`. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/red-plaintext-b1-a1.log`, `red-synced-b1-a1.log` and `base-details-shift-end-a1.log` beside it.
- [x] Build the matcher, the owner, its callers and the content-root guard. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/green-new-b1-a1.log`.
- [x] Prove the new cases green in five warm Chromium runs with retries off. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/warm-new-r1-a1.log` to `warm-new-r5-a1.log` and `warm-details-caret-r1-a1.log` to `warm-details-caret-r5-a1.log` beside it.
- [x] Rerun the neighbors: the plaintext, mentions, multi-root, synced-blocks and richtext line-axis suites, the `details-*` and Shift+Home www specs, and the plitejs typecheck and unit partitions that load the changed files. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/final-neighbors-plite-a1.log`, `final-neighbors-www-a1.log`, `final-typecheck-plitejs-a1.log`, `final-unit-react-a1.log` and `final-unit-dom-a1.log` beside it.
- [x] Hand drive the changed files on the playground and Synced Blocks routes. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/hand-drive-check-a1.log`.
- [x] Run the writing passes, add the changeset and run lint on the task's files. Proof: `docs/plans/artifacts/2026-10-17-line-end-keys/checkout-lint-task-a1.log`.
- [x] Land the patch on next's working tree. Proof: `docs/plans/artifacts/chips/task_4505cc97.patch` applied with `git apply`, after `git apply --check --whitespace=error-all` passed.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Red before the fix | `red-plaintext-b1-a1.log` and `red-synced-b1-a1.log` fail each new case on next for its named defect, and `base-details-shift-end-a1.log` fails the reporter's Shift+End step |
| Five warm green runs | 5 of 5 runs pass the 5 new cases and the 14 `details-caret` cases with retries off |
| Neighbors | Plite 342 passed and 4 skipped by their own project conditions, www 211 passed; plitejs typecheck and the react partition fail only where next fails |
| Hand drive | `hand-drive-check-a1.log` covers editor-default, playground, Plite plaintext and Plite synced-blocks at desktop width in light |
| Lint | `checkout-lint-task-a1.log` finds 0 errors in the 9 linted task files on the checkout after landing |

## Close

Reversals and deviations come first.

- The card expected Backspace after Shift+End over "Two words" to leave an empty line. It removes the line instead, because Plite deletes a block when a selection covers all of its text, and the locked rule for a block after a closed Details depends on that. The Defaults row keeps it, and "keep empty line" reverses it.
- The brief also named macOS Control+Shift+A and Control+Shift+E. Both already selected to the line's edge on next through Chromium's own line binding, so a test for them could not fail before the fix. They ran once on next and once on the fix, both green, and got no regression test (`red-ctrl-shift-base-a1.log`, `green-ctrl-shift-a1.log`).
- The design pick planned kernel-trace assertions in the browser tests. They were dropped, because the tests already read the selection the user sees.

The patch `docs/plans/artifacts/chips/task_4505cc97.patch` landed in next's working tree with no commit. It holds the key matcher, the line-edge function and its two callers, the content-root guard, five new browser tests, the restored Shift+End step in `details-caret`, the changeset, this plan and its decision log.

Proof, from the decision log's rows:

- Each new test failed on next for its named defect, and the reporter's Shift+End step failed in `details-caret`.
- Five warm runs with retries off each passed the 5 new cases and the 14 `details-caret` cases.
- The neighbor suites passed on the final bytes. Plite had 342 passed and 4 skipped by their own project conditions, and www had 211 passed.
- The plitejs typecheck and react unit partition fail only where next fails: the `create-editor-options` type test and the kernel-authority audit.
- The hand drive covered editor-default, playground, Plite plaintext and Plite synced-blocks at desktop width in light.
- Lint found 0 errors on the checkout after landing.

Every browser run was Chromium on macOS, so Firefox, WebKit, Windows and Linux are unproven. A wrapped paragraph still goes to the paragraph's edge. All 9 steps are done.

Attention, reviewed by gpt-6.1-sol @xhigh on the decision log at frozen commit `2af46baa21`. It found no critical issue.

- Warning: the Backspace row cited a rule that covers only a block after a closed Details. The row and the Defaults row now name the real cause, and the default stays a look call.
- Warning: wrapped-line Home and End stay with suggested task t_3dce3af0. Every case the card names is a line break or a block edge, not a wrapped line.
- Warning: macOS Control+Shift+A and Control+Shift+E had no Chromium proof. They now ran on next and on the fix, as above.
- Nit: the Windows and Linux default missed one case, a selection that already reaches into a synced block. The Defaults row names it now.
- Nit: the planned kernel-trace assertions never landed. The decision log now records that they were dropped.

## Open work

- Home and End on a wrapped paragraph stop at the wrapped line's edge, with the caret drawn on the right line. owner: zbeyens. stop: that suggested task lands or is dropped. Tracked as suggested task t_3dce3af0 in `docs/plans/suggested-tasks.decisions.tsv`, with the arena's design and the caret probe in `docs/plans/artifacts/2026-10-17-line-end-keys/`.
