# Playtest

A playtest is the agent's own hands-on test of one editor feature, run beside every spec that feature has in every engine. The hand drive proves each changed page loads, and the tester pass sends a person over every page. The playtest covers one feature in depth. The agent drives the feature the way a user of the reference editor would, then improvises, while a script runs the feature's specs in Chromium, Firefox and WebKit plus Plite and attributes each failure to a commit. On 2026-10-16 a pass of this kind ran over suggestions after that feature's build had closed. The runner found two editor bugs, three specs the build left stale and two test-setup problems. The drive found one of those bugs again and two gaps against Google Docs (`docs/plans/artifacts/2026-10-16-suggestions-test/results.md`).

## When

- At a build's close, the runner alone, as Build close says. `node tooling/scripts/playtest.mjs scope <the plan's files>` names each catalog the build touches.
- `verify playtest <feature>`, any time, such as after a verdict or another run touched the feature, runs the whole pass. A standalone pass files findings and edits no product code unless the request asks for fixes.

## Build close

A build runs Run steps 1 and 5 and the Findings section's build rules, and skips the drive and the improvisation. The 2026-10-17 trial put two old suggestion bugs back. A build's unit tests caught one of them, and the runner caught both, the second only in Firefox. On the 2026-10-16 pass, about an hour of driving had caught only the first (`docs/plans/2026-10-16-agent-pass.md`). A build that adds a feature still writes its catalog first, because the runner refuses one without scenario rows.

## Catalog

`docs/editor-behavior/scenarios/<feature>.md` is the feature's scenario catalog. Its front matter holds `feature`, `reference` (the editor whose behavior is the oracle, such as Google Docs' suggesting mode), `routes` (the first is the page the runner waits for), `paths` (the source paths whose change triggers the pass), `www-specs` (relative to `apps/www`) and `plite-specs` (relative to `apps/plite`), each list written `[a, b]`. Below it, a Read back section says how to read the feature's state from the DOM, and a Scenarios table lists `| S<n> | Action | Expected |` rows. The runner refuses a catalog that lacks a field or names a missing path.

- Write Expected from the reference editor, before any drive, never from what Plate does now. Where `docs/vision/` law or `docs/editor-behavior/markdown-editing-spec.md` decides differently, the law wins and the cell starts with `Law:`.
- A feature with no catalog gets one before its first pass. Cover what a user of the reference editor does with the feature: typing, deleting, replacing a selection, splitting and joining blocks, marks, block types, undo and redo, every mode or view, a second author where the feature has authors, saving and reloading, and each control the feature adds. Then add the feature's specs and source paths.
- Each finding the catalog did not predict adds a row, so the next pass covers it. Never change an Expected cell to match a bug.

## Run

1. Start `node tooling/scripts/playtest.mjs specs <feature> --dir <run directory>` in the background. It serves www from source in the www runner's Plite mode and runs the catalog's www specs in each engine and its Plite specs under the Node version `.nvmrc` names. It then reruns each failure at `HEAD` when the tree holds uncommitted work, and at `--base <commit>` when given, each in a fresh proof worktree it removes afterwards. Each run writes its report to the next free `specs-a<N>.md`. To ask whether a plan broke a spec, pass the commit before its first build commit as `--base`. Each step is a `proof.mjs` log, and the whole run stops at 55 minutes, marking what it skipped. Run one at a time; it uses ports 3611 and 3612 unless `--port` names others.
2. Meanwhile, start the `www-drive` server as the hand drive's Setup says and keep one tab on it. Drive every catalog row once at desktop width in light, typing and checking frames as `.agents/pstack/rules/browser.md` says. Hover a control that shows only on hover before clicking it. After each step, read the state the Read back section names and compare it with Expected; a screenshot alone is not the result. Record each row as pass, fail or gap in `<run directory>/results.md`.
3. Then improvise for up to 45 minutes with the six moves in `tester-pass.md`, picking each next action live and watching the caret, selection paint, focus and layout. Start from the moves and rows the newest earlier `results.md` for the feature left untried. Record each move you ran, so the next pass can start elsewhere.
4. Before logging a finding, reproduce it once in a fresh tab, because the built-in pane can stall, as `browser.md` says.
5. When the runner exits, read its report. A failure counts as pre-existing only where a control column says it fails the same way there.

## Findings

Sort each confirmed finding into a product bug, a spec or harness bug, or a parity gap, where the reference editor does something Plate lacks.

- In a build, every product bug and every spec or harness bug in the catalog's specs is a finding of the build, a pre-existing one included. Fix each with a test that fails on it at the old code, as the hand drive's Drift section says. A parity gap that adds a feature, a finding that needs a design call, and a failure whose cause lies outside the feature, such as a shared test harness or the host, get a suggested task instead, as the block's Suggested tasks rule says. After the fixes, run the runner once more on the final tree. What still fails goes under Open work with its suggested task.
- In a standalone pass, offer each finding as a suggested task.

A whole pass's `results.md` in the run directory lists every row and move with its result, the runner's reports and each finding with its fix, test or suggested task.

## Limits

- The built-in browser is Chromium. Firefox and WebKit reach only what the specs assert, and nothing here proves Safari, an OS input method, a native clipboard or a device.
- The 45-minute improvisation finds what it happens to try. The catalog keeps coverage from shrinking between passes; it does not make a pass complete.
