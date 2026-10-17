# Table reads a node selection with its direction

Status: partial: the mixed cells-plus-paragraph paste moved to t_96b80fff; the owner commits
Topic: csv
Playbook: bug-fix

This iteration closes the csv subject's Open work item on node selections, which the [2026-10-14 csv plan](2026-10-14-csv-review.md) left open when its diff panel's round-3 revert took its node-selection fix out. It ran as suggested task `task_c1dea721` in its own worktree at `next` `d0209b439a`.

## Brief

### What will change?

Table no longer reads an odd pick of cells, like two diagonal cells, as the box around them. Tab-separated paste and cut leave it alone, and removing rows with a gap does nothing. Cutting a box empties its cells.

### What could go wrong?

A box selection works as before. Pasting over cells plus a paragraph outside the table can still leave a row empty. That fix was promised here, but the editor's paste causes it, so it has its own task.

## Teach

The editor keeps a pick of several table cells as a node selection. It lists the picked cells and says which cell the pick started from and which it ends on. Table reads that selection before it pastes, cuts, moves or removes rows.

Table asked the editor for the current selection and got back one range from the first picked cell to the last. So two diagonal cells read as the two by two box. Paste filled the box and cut cleared it. Removing rows 1 and 3 removed the whole table. Cut had a second bug. The editor's cut ran its delete in a way that skipped Table's handler, so it removed the selected cells instead of emptying them.

Now Table reads the picked cells themselves and keeps the start and end cells, so Shift+Arrow still grows the pick from the right corner. Row and column removal refuse a pick with a gap, and cut goes through Table's handler.

## Main changes

- `readTableSelection` reads the current selection itself. When the editor holds a node selection, it rebuilds the directed `NodeSelection` from `state.selection.nodes()` and the selected node that holds each endpoint of `state.selection()`. Callers no longer pass a `selection` option, so every Table read, cut, paste, move and command sees the cells that were picked. A block node-selected inside a cell maps to that cell.
- `removeRow` and `removeColumn` refuse a multi-cell selection whose view is not complete, so a selection that skips a row or column between its ends removes nothing.
- The Plite view editor's `fragment.delete` lowers to the `deleteFragment` command, as the main editor's already does. Event handlers get the view editor, so a cut now reaches plugin `deleteFragment` handlers, and Table clears the cells it copied instead of removing the cell nodes.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Pasting over cells plus an outside paragraph | Moved to its own task, because the editor's paste removes the cells before Table sees them (look) | Fix it in this task | fix mixed paste | small |
| Speed of the new read | Left unmeasured past noise, because the loaded host hides any difference between the new read and base's (look) | Time it again on a quiet machine | time it | small |
| Typing over a pick inside one cell | Types normally, as before | Clear the whole cell first | clear the cell | detail |
| Comment above the new read | Kept, since it says why the read rebuilds the selection | Cut it, as the comment review asked | cut the comment | detail |
| Release notes | None, since no published beta has these bugs | Add a patch note for each package | add notes | detail |
| The csv page link | A new page at https://claude.ai/artifact/BxtLXphP9DjedPP5M4AHqj, since https://claude.ai/artifact/DJPGknWi38Ff3ou9J6GWmJ no longer opens | Drop the new page | drop the page | detail |

## Completion Gates

| Gate | Evidence | State |
| --- | --- | --- |
| Red at base | `red-base-a2.log`, `plite-red-a1.log` | done |
| Table specs | `table-specs-a3.log`, 286 of 286 | done |
| Mutation proof | `mutate/` logs, 8 mutants over 6 changes caught | done |
| Chromium e2e | `e2e-table-demo-a3.log`, 11 of 11 on the final bytes; `e2e-cut-mutant-a1.log` red without the Plite fix | done |
| Hand drive | `hand-drive-check-a2.log`, 2 cells covered | done |
| Lint | `lint-task-a5.log`, all 11 changed source and test files | done |
| Typecheck | `tc-platejs-table-a2.log`, `tc-platejs-table-react-a1.log` pass; `tc-plitejs-full-a1.log` fails with 2 errors in `test/react/create-editor-options.test.tsx`, the same 2 as at base (`base-tc-plitejs-full-a1.log`) | partial |
| Changeset | skip: no published beta holds the view editor or Table's node-selection storage | skipped |

## Close

Reversal. The csv subject's Open work gave the mixed cells-plus-paragraph paste this plan as its stop. The run found its cause in Plite's paste, which removes the picked blocks in `replaceBlocksAtSite` without the delete command, and moved it to `t_96b80fff`. The plan stays partial until that lands or the owner says "fix mixed paste" here.

What changed. Table reads the current node selection as the cells that were picked, with their start and end cells. The tab-separated paste no longer claims a node selection of three cells or of diagonal cells. Cut clears exactly the cells it copied and refuses a diagonal pick. `removeRow` and `removeColumn` refuse a selection that skips a line. A backward pick still grows from its focus with Shift+Left. The Plite view editor's `fragment.delete` now reaches plugin `deleteFragment` handlers.

Proof and its limits.

- **Red first.** The new paste, removal and cut specs fail at `d0209b439a` (`red-base-a2.log`). The Plite view-delete spec fails at `HEAD` (`plite-red-a1.log`). The Shift+Left and in-cell Tab specs pass at base too, and guard the new read against the round-3 regression and a deep path.
- **Mutation proof.** Eight mutants cover six changes, and each fails its named case. The node read dropped fails cut and paste. The read without direction fails Shift+Left, the deep-path mapping fails in-cell Tab, and the `complete` check fails in each removal. The view lowering removed fails Table cut and the Plite command spec. The deep-path mutant first survived, which is why the in-cell Tab spec exists.
- **Specs.** The Table specs pass 286 of 286 on the final bytes (`table-specs-a3.log`). The plitejs bun suite passes 3,824 of 3,832, and its React suite 1,426 of 1,427. The 9 failures hit the same assertions at base (`base-yjs-exclusive-a1.log`, `base-kernel-audit-a1.log`).
- **Chromium e2e.** The table-demo e2e passes 11 of 11 on the final bytes, with a new native cut case, and that case fails with the Plite lowering removed. The node-selection marquee e2e fails at line 241 because its expected selection lacks the `mode: 'block'` that `NodeSelection` has required since `c646b6a484`. That test is now `t_2967500b`. The run checked it with the four source files swapped to `HEAD` inside this worktree, a method the Git rule forbids. The swap was restored byte for byte.
- **Hand drive.** It covered `/docs/table` and `/blocks/table-demo` at 1280 px. Backspace over a two by two pick emptied those four cells and kept the table's shape. Native cut in the built-in browser did not fire, so only the Playwright run proves native cut.
- **Speed.** The timing is inconclusive. On a host at load 26 to 56, run-to-run noise on the cache-miss read of a 60 by 60 node selection is larger than any difference from base, and a reliable no-regression verdict needs a quiet host (`split-a1.log`, `miss-interleaved-a2.log`). This is lab-only timing from source under bun.
- **Not proven.** Safari, Firefox and mobile cut and paste were not driven.

Counts. The Completion Gates hold 8 rows: 6 done, 1 partial (the typecheck) and 1 skipped (the changeset).

The run commits nothing, per the Delivery rule; the owner commits.

### Attention

Reviewed by gpt-6.1-sol at xhigh (`trail/answer.md`), on frozen commit `ac8f057f8f`. Each finding and what the run did with it follows.

- **The mixed paste deferral, critical.** `Status:` is now partial and the Close opens with the reversal. The original node-selection paste probe and its output are saved as `probe-mixed-node-paste-command.txt` and `probe-mixed-node-paste-output.txt`.
- **The speed claim.** The Speed line now says inconclusive and no longer calls cache hits unchanged. A labeled inconclusive row and an accepted row with the word "time it" record the acceptance.
- **The writing passes.** `deslop` and `no-comments` ran again through their skills on the final diff. Comment-sicko kept the one comment under the project override (`comment-sicko-2/reply.md`). The first reply is saved as `comment-sicko/reply.md`.
- **The side findings.** The run dismissed both in logged rows. Plite's fallback for an unmapped endpoint covers a null selection, which Table's caller never passes, and `t_f4db102b` merges the two copies. `probe-cache-a1.log` shows the cached view does not go stale.
- **Lint and typecheck width.** Lint now covers the e2e file, where it caught a `no-shadow` error that the run fixed. The Table React partition and the whole plitejs package now typecheck, and the plitejs failure has its base control.
- **Base attribution.** The plitejs test and typecheck rows now name their `base-red:` owners. The plan no longer calls the marquee e2e failure pre-existing. A stale test causes it, and `t_2967500b` owns it.
- **The unlogged write.** A late started row now lists `command-spec.test.ts`.
- **Skipped method gates.** The log records them as gaps. The run reloaded `verify` after the compaction but not `poteto-mode`. No `how`, `why` or `architect` ran. The lead ran at high on an xhigh card.
- **The Brief.** Its wording now matches what the tests assert.
- **Missing pivots.** The log now records the surviving deep-path mutant, the wrong bun runner and the lint root error.
- **The blocked `node -e`.** The log records both attempts as slips.

## Open work

- A node selection that mixes table cells and an outside paragraph pastes into empty table rows, because Plite's paste removes the selected blocks itself and never asks Table's delete handler (`probe-mixed-node-paste-output.txt` in the run directory). owner: zbeyens. stop: `t_96b80fff` lands, or 2026-11-30.
- A range delete from a paragraph into one table cell removes the whole table, cells outside the range included, at base too. owner: zbeyens. stop: a Table boundary-delete plan, or 2026-11-30.
- Table, AIChatPlugin and Plite's own `getCurrentNodeSelection` each rebuild the directed node selection, because `state.selection()` returns its range. owner: zbeyens. stop: a public Plite read of the current node selection lands, or 2026-11-30.
- Other Plite view-editor transaction methods, such as marks, text deletion, breaks and block toggles, may skip their command lowering the way `fragment.delete` did. owner: zbeyens. stop: an audit of view-editor lowering, or 2026-11-30.
- The node-selection marquee e2e expects a node selection without `mode`. owner: zbeyens. stop: `t_2967500b` lands, or 2026-11-30.
