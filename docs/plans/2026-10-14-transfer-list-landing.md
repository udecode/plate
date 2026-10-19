# Copied text drops land like a paste

Status: executed, 2026-10-14; uncommitted in the working tree, waiting on your commit
Topic: dnd
Playbook: bug-fix

## Brief

### What will change?

Copied text you drop, such as list items from another editor, now lands like a paste at the drop point. Block drags keep their depths. A review caught two gaps, now fixed. It is uncommitted, and tests pass.

### What could go wrong?

Paste plugins now reshape copied text drops too. The paste steps are duplicated until a follow-up merges them. Another session is reworking paste in the same folder. The browser test fakes the drag; no tool can do a real one.

## Teach

Transfer is Plite's one action for moving or copying content, and drag and drop runs through it. A dropped text selection lands at a point inside a block. Dropped whole blocks land at an edge between blocks.

Before a paste lands, it asks a hook called the landing read where its content goes. List plugs into that hook, so pasted list items take the depth of the item under the caret and their children keep their offset. A copied text drop skipped that read and inserted the dragged content as it was. Dropping three nested items from another editor kept their old depths, while pasting the same items moved them to the caret's depth.

Now a copied text drop runs the steps a paste runs. It reads the landing, trims the content to any length limit, and lets a plugin replace an empty block. Moves inside one document and every block drop work as before.

## Main changes

- **A copied text drop lands as a paste.** `runTransfer` in `packages/plitejs/src/core/transfer.ts` sends a copy to a `point` through `readAtSliceFitTarget`, `limitSliceToLength`, `landSlice`, the `replaceEmpty` attempt and `withCommandSliceFit`, in the order the `replaceSlice` command runs them, without command handlers. The landing guard checks the content that actually landed, and a copy the length limit cuts reports a `lossy` diagnostic itself. A move to a point and every edge or wrap landing keep their paths.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Copied text drops | Land like a paste at the drop point | Keep the depths they had; Also re-indent dropped blocks | keep drop depths; reshape block drops | big |
| Paste steps in the drop | Copied into the drop code, the only place I could edit | One shared function for paste and drop | merge landing | small |
| Design exploration | Skipped, since the drop reuses what paste already does | Compare designs for the drop first | design the drop | detail |
| Code review panel | Skipped, because no public call changed and no PR opens | Run a review panel on the diff | panel | detail |
| Browser check for the drop | A copy-modifier drop inside the list demo, since no demo has lists in two editors | Build a two-editor list demo for a cross-editor browser check | cross-editor demo | small |
| Where the proof ran | A clean copy of next with only this patch | The shared checkout, which holds other sessions' edits | proof in main | detail |
| Shared file with the paste landing session | Kept my change in the working tree and told that session (look) | Back it out and hand over a patch until that session lands | hand over patch | small |

## Steps

- [x] Reproduce the copied drop against a paste of the same items on the list demo. `artifacts/2026-10-14-transfer-list-landing/red-list-drop-a1.log`
- [x] Write the failing Plite and List tests, then land the drop through the paste read. `artifacts/2026-10-14-transfer-list-landing/red-plite-contract-a2.log`, `artifacts/2026-10-14-transfer-list-landing/red-list-spec-a1.log`, `artifacts/2026-10-14-transfer-list-landing/candidate-final-a2.patch`
- [x] Run the writing passes, the lint fix and the docs registry build. `artifacts/2026-10-14-transfer-list-landing/comment-sicko/answer.md`, `artifacts/2026-10-14-transfer-list-landing/main-lint-task-a1.log`, `artifacts/2026-10-14-transfer-list-landing/main-build-registry-check-a1.log`
- [x] Hand drive the docs pages and the list demo. `artifacts/2026-10-14-transfer-list-landing/hand-drive-check-a1.log`
- [x] Fix the trail review's findings: a cut copy reports its loss, and a List case covers whole items dropped into an empty paragraph. `artifacts/2026-10-14-transfer-list-landing/red-trimmed-copy-a1.log`, `artifacts/2026-10-14-transfer-list-landing/base-list-empty-line-a1.log`, `artifacts/2026-10-14-transfer-list-landing/mutate/hide-cut-loss-a1.log`, `artifacts/2026-10-14-transfer-list-landing/mutate/guard-expects-shaped-not-replacement-a2.log`
- [x] Run the drop case red at base, then five warm green runs and the full drag and list specs. `artifacts/2026-10-14-transfer-list-landing/base-list-drop-a1.log`, `artifacts/2026-10-14-transfer-list-landing/final-list-drop-a10.log`, `artifacts/2026-10-14-transfer-list-landing/final-www-dnd-list-a2.log`

## Open work

On 2026-10-15 the open items moved to `docs/plans/topics/dnd.md` Open work, and the dnd page item closed when this plan moved onto that page.

## Close

**Deviations.** The decision-trail review found two real defects after the first close, and both are fixed. A point copy that the length limit cut reported no loss; it now reports one. The guard line the first Close called equivalent for shipped landings was not: whole list items copied into an empty paragraph would have reported a false loss. A List case now covers that. This plan first had its own page, because the renderer refused the drag and drop page while `docs/plans/2026-10-06-dnd-side-drop-columns.md` kept the old brief questions; task_2f940dc2 repaired that plan on 2026-10-15 and moved this one onto the drag and drop page. The browser case sits in `apps/www/tests/browser/list-keys.spec.ts`, beside the paste cases it compares with, and copies inside one editor with the copy modifier, because no demo loads lists in two editors. The suggested-task ledger refused a `started` row for this run's own task_f529d5ce: its offer lists all of `apps/www/tests/browser`, which overlaps the open "Now: Fix the two failing table-selection cases" task, and only the run that offered that task can retag it. This run wrote only `list-keys.spec.ts` there, and the ledger refuses `landed` for the same reason, so the task still shows as offered. The required docs registry build also rewrote four generated files outside the brief's list: `apps/www/public/r/clipboard-docs.json`, `dnd-docs.json`, `registry.json` and `registry-docs.json`.

**What landed.** `runTransfer` lands a copy to a point through the paste landing sequence. Its guard checks the landed content, and a copy the length limit cuts reports a `lossy` diagnostic. Three Plite contract cases, a List describe of three cases and one Chromium case cover it. The dnd and clipboard guides in both languages and `EDIT-CLIPBOARD-LIST-LANDING-001` say so. Everything sits uncommitted on `next`. `transfer.ts` merges cleanly with another session's uncommitted edit to the same file, and the paste landing session that owns that folder was told.

**Proof.** At base, the two landing contract cases, both List cross-editor cases and the browser drop case fail for the named defect; the browser drop puts the copied children at indent 2 where the paste puts them at 4. The cut-copy case failed on the first candidate and passes now. All five mutants on the final bytes are caught. On a clean copy of `next` at 2591fb926a plus this patch, the drop case passed five warm runs with retries off, and the full dnd and list-keys specs pass 39 cases. The two that fail also fail at base. The Plite suite fails its ten base cases plus three 5-second timeouts at a load average near 66. Each timed-out case passes when rerun on the candidate, and none of their files calls transfer. The storage test also passes at base under the same load. In `main`, the contracts and List spec pass, the lint fix changes nothing and flags only a cast that also fails at base, and the docs registry is fresh. The hand drive covered the four guide pages and the list demo at desktop width, redriven after the fix.

**Limits.** No tool here can start a native text drag, so the browser case and the hand drive fire the drop's drag events in the page after a real mouse selection. Only Chromium ran. The cross-editor drop is proven in the model; the browser case copies inside one editor. The `lossy` message text repeats `transfer-guard.ts`, which the brief kept out of reach.

**Counts.** Six steps, all done. Five open items at close. task_2f940dc2 landed on 2026-10-15; the other four, two of them suggested tasks, are in the drag and drop page's Open work with owners. task_db3cd1c2 and task_46ac463d wait for task_5a7ba11c.

**Attention.** reviewed by gpt-6.1-sol @xhigh

- Fixed. A point copy the length limit cut reported no loss.
- Fixed. The guard line called equivalent was not, for whole list items dropped into an empty paragraph.
- Kept. The browser check copies inside one editor, not between two. The cross-editor demo word builds one.
- Kept. `transfer.ts` changed while the paste landing session owns its folder. The hand over patch word backs it out.
- Recorded. The registry build rewrote four generated files outside the brief's list.
- Corrected. The reproduction step cited the first drag attempt, which inserted nothing; it now cites the red run.
- Kept. No design comparison ran. The one open design question is the shared landing helper, task_db3cd1c2.
- Nit. Code reading and a probe ran before PR 5168 merged. The reproduction and every edit came after.
