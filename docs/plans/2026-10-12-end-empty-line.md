# End and Home keep the caret on its line

Status: executed; waiting on your commit
Page: https://claude.ai/artifact/LW1BfdRkBvNc5E2qa2mJKj
Playbook: bug-fix

## Brief

### What will change?

Pressing End in an empty line, or at the end of a line, now leaves the caret where it is instead of jumping to the next line. Home does the same at the start of a line. Control+A and Control+E on a Mac get the same fix.

### What could go wrong?

Option+Up and Option+Down still jump to the start of the next paragraph, where Mac apps go to its end. I left that alone. Firefox wouldn't start on this machine, so the new test only ran in Chromium.

## Teach

Home and End move the caret to the start or end of its line. In Plite a line is the text block the caret sits in, such as a paragraph.

Before this fix, Home and End borrowed the step that Option+Up and Option+Down use. That step moves to the next line edge in the direction you press. If the caret is already on that edge, like in an empty line or at the end of a line, the next edge belongs to the neighboring line, so the caret jumped there.

Now Home, End, Control+A and Control+E take that step only if it stays inside the caret's own block. Otherwise the caret doesn't move. Option+Up and Option+Down work as before.

## Demo

1. Start the www dev server in source mode on port 3297 and open `http://localhost:3297/dev/authored-review?intent=plain&fixture=page`. Click at the end of "Second line", press Cmd+Backspace to empty it, then press End. Before the fix the caret jumped to the start of "Last line"; now it stays in the empty line, and typing "ab" lands there. ![before](artifacts/2026-10-12-end-empty-line/before-end-empty-line.png) ![after](artifacts/2026-10-12-end-empty-line/after-plain-end-then-ab.png)
2. Open the same route with `intent=edit` and repeat the gesture. The caret stays in the emptied line. ![after](artifacts/2026-10-12-end-empty-line/after-edit-end.png)
3. On `http://localhost:3298/examples/plite/plaintext`, type three lines with an empty middle one. Press End in the empty line, Home in the empty line, and End at the end of the first line. The caret stays where it is each time.
4. On a Mac, press Option+Down at the end of the first line. The caret still moves into the next paragraph.

## Main changes

- Home and End, plus Control+A and Control+E on macOS, now produce their own model-owned command, a `line-boundary` move. Option+Up and Option+Down keep the existing `line` step, so the paragraph walk and every test that pins the `line` axis stay as they were.
- `getLineBoundaryPoint` in `packages/plitejs/src/react/editable/line-boundary.ts` owns the rule. It takes the existing `unit: 'line'` step and keeps it only when the target stays inside the point's text block. The plain-text caret path in `caret-engine.ts` and the command path in `mutation-controller.ts` both call it, and a content-root selection maps the command onto content-root's own Home/End move.
- The public `Hotkeys` object from `plitejs/dom` is unchanged. The new `isMoveLineStart` and `isMoveLineEnd` matchers live in `dom/internal`, because `Hotkeys.isMoveLineBackward` and `isMoveLineForward` are published and still match Home and End.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Public hotkey helpers | Leave them as they are and match Home and End inside Plite (look) | Change the public line-move helpers so they stop matching Home and End | split hotkeys | small |
| Option+Up and Option+Down | Keep jumping to the start of the next paragraph | Jump to the end of the next paragraph, like Mac apps | mac paragraph keys | small |
| End with text selected | Each end of the selection moves to the edge of its own line, as before | Drop the selection and put the caret at the end of the last selected line | collapse on end | detail |
| How the line edge is found | Reuse the old step and keep it only inside the block | Jump straight to the block's first or last character, which can put the caret inside an inline element you can't select | direct edge | detail |

## Close

**Reversals and deviations.** The first build split the published `Hotkeys.isMoveLineBackward` and `isMoveLineForward` so they stopped matching Home and End. That changed a public `plitejs/dom` export. The project's Public API rule sends such a change through `best-api repair`, and this bug fix does not need it, so I reverted that part. Home and End now match through internal matchers, and every proof below reran on those final bytes. The deslop pass dropped an `as const` and its spreads from the new test. The comment review reshaped one JSDoc to say "text block" instead of "line".

**What landed, in the working tree on `next`, uncommitted.** Product: `dom/utils/hotkeys.ts`, `dom/internal/index.ts`, `react/editable/caret-engine.ts`, `editing-kernel.ts`, `editable-command-types.ts`, `mutation-controller.ts` (one hunk beside another session's staged work), `content-root-navigation-actions.ts`, and the new `line-boundary.ts`, all under `packages/plitejs/src`. Test: three cases in `apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`. Changeset: `.changeset/plite-line-boundary-keys.md`.

**Proof.** All of it ran in a detached worktree at `HEAD` 6fa1169c5e plus this fix, because other sessions were editing plitejs in this checkout.

- Before the fix. With only the new test applied, the three new cases failed in Chromium. End in the empty line moved the caret to the start of "Last line", Home in the empty line moved it to the end of "First line", and End at the end of "First line" moved it into the empty line (`base-red-a1.log`).
- Acceptance. Five warm Chromium runs on the final code, with retries off, each passed all three new cases (`accept-final-chromium-a1.log` to `-a5.log`).
- Package. `pnpm --filter plitejs typecheck` passed 13 of 13 tasks. Every plitejs test partition passed when run one at a time (`serial-summary-a1.txt`). The authored partition needed a second run, because its first timed out the two property laws under Limits; the second passed all 687 tests. The react partition passed 1437.
- Neighbors. The plaintext, mentions, multi-root, content-completion and examples suites passed 111, with 1 skipped. Authored-changes passed 49 and the richtext line-axis cases passed 3. The 6 authored-changes cases and 2 focus-blur cases that already fail at `HEAD` still fail, with the same errors.
- Your route. Your gesture on `/dev/authored-review`, in plain and Editing intent, now keeps the caret in the emptied line. Option+Down still steps to the next paragraph, and Control+E and Home stay put (`reporter-route-replay-a1.md`).
- Lint passes on the 8 product files. The lint config ignores the browser test file.

The logs live in `docs/plans/artifacts/2026-10-12-end-empty-line/`.

**Limits.** The new cases skip WebKit and mobile, like their neighbor. Firefox never launched on this machine. Its own sandbox setup failed, also with the shell sandbox turned off, so the browser matrix's Firefox lane will be the first Firefox run of the new cases. Content roots were checked live in the Synced Blocks example only. Two authored-tree property laws, randomized with no fixed seed, timed out while this machine's load average sat between 30 and 67. Both passed alone and in the second serial run. Their partition loads none of the changed files, so it runs the same code as `HEAD`.

**Counts.** 19 items: 16 done, 3 skipped with reasons, 0 partial, 0 blocked, 0 open. The run's todo record is `docs/plans/artifacts/2026-10-12-end-empty-line/todo.md`.

**Open work.**

- Firefox run of the three new cases. owner: zbeyens. stop: the next `pnpm check:plite:browser-matrix` run passes them in Firefox, or shows a Firefox-only failure to fix.
- Three stale plitejs scripts, `test:entrypoint:hyperscript`, `test:entrypoint:pagination-react` and `test:entrypoint:root`, exit with a usage error because `run-entrypoint-task.mjs` knows no such partition. owner: zbeyens. stop: the scripts are fixed or deleted. Tracked as a suggested task in this session.
