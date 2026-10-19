# Repair the table-edge range removal after its third review

Status: executed; the decision log's ship row names the landed commit
Topic: table
Playbook: bug-fix

## Brief

### What will change?

The card asked that deleting from a paragraph into a table cell keep the table. A review found the first fix broke other cases, so this redoes it. Now the table stays and only what you selected goes away.

### What could go wrong?

Editors with tables get a new schema fingerprint, so older snapshots, history and shared rooms won't match. Deletes inside containers changed too. Some edge cases still act as before or throw, and the Close lists them and the proof's gaps.

## Teach

A table is a grid of rows and cells. Plite, the editor core, deletes a selection the same way everywhere. It drops the blocks in between, keeps the first block, and joins what's left of the last block into it.

Table only steps in when both ends of the selection are inside one table. So a selection from a paragraph into a cell treated the table's rows and cells like ordinary blocks, and a delete could take the whole table.

Now Table tells Plite which nodes are its grid, rows and cells, and Plite plans around any table the selection reaches into. The table keeps every row and cell, a fully selected cell keeps one empty line, and typed text goes to the first nearby spot that can take it.

## Demo

1. Start the Plate site with `pnpm --filter www dev --port 3297` and open http://localhost:3297/docs/table. Drag from the start of the paragraph under the Table heading into the table's first cell, so the paragraph and "Plugin" are selected. ![before](artifacts/2026-10-18-table-boundary-delete/demo/3-drag-selection.png)
2. Press Delete. The paragraph and the "Plugin" cell empty, and the table keeps its four rows and four columns. ![after](artifacts/2026-10-18-table-boundary-delete/demo/4-drag-after-delete.png)

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Empty blocks beside a delete inside a container | Kept, because cleanup removes only the blocks the delete emptied at its end, never the block where the range started or its container (look) | Removed, as before this change | old cleanup | small |
| Selecting from a paragraph into a cell from code | The selection grows to the whole table, as before, so Delete removes it. A mouse drag doesn't grow, so Delete keeps the table (answer) | The selection stops before the table, so Delete keeps it | stop before table | big |
| Merge after a range removal next to a table | Stops at the cell's edge, so no cell text leaves the table | Pulls the cell's text out, as before | merge into cells | small |
| Cells whose schema lets them hold nothing | Stay allowed, and a delete that covers one leaves it empty | The schema refuses them when the editor starts | refuse empty cells | detail |
| Paste, typing or an insert when no spot next to the range can take text | Refuses before writing anything (look) | Writes into text further from the range | write past range | small |
| Building after the third plan review | Builds now (look) | Waits for the owner's word | hold | small |
| A range inside one read-only, atom or void cell | Stays open, so the ordinary removal takes the cell as at base (look) | Protect the cell, so a delete keeps it and typing lands outside it or refuses; costs a planner rule for ranges inside one cell, its tests and another diff round | protect locked cells | small |
| A range that reaches a read-only grid and an editable grid | Stays open, so every grid it reaches takes the ordinary removal as at base (look) | Treat the read-only grid as one block and plan the editable one; costs rebuilding the range-edge rule that broke five tests, and another diff round | plan past locked grids | small |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Range removal across a table edge | Table declares its grid, row and cell roles, and Plite's range removal owns the rule. A range keeps every editable grid it reaches into unless it covers the grid and reaches past an edge. A kept grid keeps every row and cell, a covered cell keeps one emptied block, an edge cell loses only the covered text, and nothing joins into or out of a cell. A void, atom or read-only grid goes whole like any other block. |
| added | Where writing lands after such a removal | The range's start, the first covered cell that can take text, the point after the removal, the point before it, or a new paragraph when the document empties, whichever comes first. Typing, paste, node insert and split refuse when none can. |
| added | Selecting from outside a table into a cell | `editor.update.selection.set` grows the selection to the whole table, so Delete removes it. Only a selection of the whole document stays as it is. A mouse drag keeps exactly what you dragged, because it never goes through that command, so Delete keeps the table and clears only the selected text. |

| Delta | Alternative | Why it lost |
| --- | --- | --- |
| added | Table command wrappers for cross-edge removal | Raw transactions, IME replacement, merges and text moves reach Plite's removal without a command, so wrappers leave the grid breakable. |
| added | Refuse grid cells that can hold no child | The base builds such a schema and deletes in it, and a cell whose default is a table with empty rows still holds no text. |
| added | Continue a node merge at the removal's caret alone | A removal that lands on the next table's first cell, as a delete should, still lets the merge pull that cell out. |
| added | Read blocks as the base did for ranges whose ends sit in different cells | It lets a range that starts at an image in one cell move its start into the cell before, and the planner then removes the whole table. |
| added | Keep programmatic selections exact and clamp only native drags | The base's Table test pins the widening for `editor.update.selection.set`, and a native drag's import writes through `tx.selection.set`, which no select command wraps. |
| added | Clean up under the common ancestor of the range's ends | When the piece before a table spans blocks at two depths in a container, that ancestor is the container, and the cleanup removes the kept table's emptied cells. |
| added | Land typed text in the next writable text after the range | It writes into text the range never reached. |
| added | Clean up only blocks between each step's ends | Removing an image at a step's end moves that end into the cleared cell next to it, and cleanup then removes the cell. |
| added | Check every landing with the text block check | A text after a required paragraph can take typing where it stands, and that check refused it. |

## Main changes

- Plite's range removal plans around every element whose schema declares `structure: { kind: 'grid' }`, in `delete-text-grid.ts`. It reads each end's grid levels in one descent, plans once on rootless points, removes whole any node that holds no text between a range end and the planned grid, anchors every step's target before the first step runs, and records where writing lands. `prepareRemoval` decides before anything changes and `applyRemoval` writes. Typing, slice landing, node insert, split, merge and text moves go through them or `removeText`.
- `editor.point` and `state.points` read a node's edge from its first or last text through one reader in `editor/point.ts`. `isStructuralEdge` there decides whether a range covers a node, for the planner, the whole-block shortcuts and the `fragment.delete` and `text.insert` commands.
- `isEditablePath` in `core/writable-text.ts` walks a path's ancestors for void, atom and read-only elements, and the planner, the landing check and the block lookup call it.
- A delete's highest-block lookup stops at each end's own cell, and cleanup after a delete inside one block removes only the blocks the delete emptied at its end.
- A merge after a range removal continues only when both blocks sit in one cell or outside every grid.
- `BaseTablePlugin` declares the grid roles on table, row and cell, so `plitejs/diff` compares tables by rows and cells, and its selection clamp exempts only a range over the whole root.

## Steps

- [x] Plan review panel round 1 on this plan.
- [x] Plan review panel round 2 on the revised plan.
- [x] Plan review panel round 3 on the revised plan.
- [x] Public-boundary tests that fail on the current tree, one per failure mode.
- [x] Text-edge reader and the point reads.
- [x] Grid scope, the block lookup, the empty-start rule and the shortcut's eligibility.
- [x] Cleanup of only the blocks a delete emptied at its end, and edge moves that stay in their cell, with the full Plite and Plate suites.
- [x] Recorded landing, the executor's move, prepare and apply, and every caller on one entry.
- [x] Merge's cell check and the refusal when no landing exists.
- [x] The shared text block check. The third diff review reverted whole-document typing to base's.
- [x] Writing passes, gates and timing.
- [x] Diff panel, hand drive, law lines, changeset and land.

## Open work

- A node insert or split whose range ends at the start of a grid's first cell still lands in that cell, because the removal first pulls the range back out of the grid. owner: the next table review. stop: insert and split continue at a landing that never enters a cell the range did not cover.
- A collapsed delete at a grid's edge still joins text across it, as at base, and a forward delete in an empty cell joins the next cell and drops it. owner: the next table review. stop: a review of collapsed deletes at table edges.
- No test drives Table's selection clamp inside a named content root. owner: the table subject. stop: a content-root clamp review.
- A range that starts inside an image at the end of a cell keeps that image, because the range holds no content in that cell; base removes it. owner: the next table review. stop: a planner rule for a range piece that starts inside a void.
- Typing inside a transaction over a range that covers the whole document types into its first block, as at base. It writes into a leading atom, read-only text block or void, and throws when the first block takes no text, such as a table, a code block, columns or a read-only container. Plate's typing goes through the `text.insert` command, which replaces whole blocks first. owner: the next whole-document typing review. stop: one rule for typing over a whole document whose first block cannot take the typed text.
- A range whose edge sits in a read-only grid, or in a grid inside a read-only block, takes the ordinary removal, as at base, so the non-editable block goes whole. When the same range also reaches into an editable grid, that grid gets the ordinary removal too and loses cells: a delete over `[readOnlyGrid(ab, cd), grid(ef, gh, keep), p('after')]` from `ab`@1 to `gh`@1 leaves `[grid(h, keep), p('after')]` on base and on this tree alike. owner: the next table review. stop: the planner treats a non-editable grid as one block and still plans the other grids the range reaches.
- A range inside one void, atom or read-only cell of an editable grid takes the ordinary removal, as at base, so a delete or typing removes that cell from its row and a paste writes into it. owner: the next table review. stop: a removal rule for a range inside one non-editable cell.
- A paste over the whole of a document of a grid, a paragraph and a grid changes nothing, as at base, because the root's default child is a landing only when every top-level block is a grid the range removes whole. owner: the next table review. stop: the emptied-root landing counts every top-level block the range covers.
- No test fails when the grid removal resolves its steps at their planned paths without anchors (mutant `d2-all-unanchored`, 106 of 106 pass), because no known step moves another step's target since the start block stays inside its container. owner: the next table review. stop: a case where one step moves another step's target, or the step anchors dropped with the crossing cost measured.
- Five callers each choose between a grid removal's landing and their own caret: typing, node insert, split, merge and slice writes. A removal that returned one landing for every kind would drop those forks, but each caller's caret after an ordinary range removal would then need its own proof. Slice writes reach the grid removal from both `landSlice` and `writeSliceAtRange` and run it once only because the first call collapses the range. owner: the next table review. stop: one landing for every removal, proven on ordinary ranges.
- `fragment.delete` with an explicit `at` still removes a grid a range spans exactly, and the `text.insert` command replaces it with one block holding the typed text, as at base. owner: the next table review. stop: both commands leave a grid they span exactly to the grid planner.
- A hanging delete from the start of a nested container's block to the start of the next block, a delete from a later block of a container to the end of the document, and a delete or typing from a grid inside a box to the start of the paragraph after the box throw "box cannot contain text" and change nothing. Base throws on the first two and joins that paragraph into a cell on the last. owner: the next table review. stop: the empty-start rule reads the start block inside its container.
- A mouse drag never reaches Table's selection clamp, at base too: the DOM selection import writes through `tx.selection.set` in `runtime-mutation-state.ts`, which bypasses the select command Table wraps. The locked `EDIT-DRAG-*` notes say a drag clamps at a table's edge. A hand drive in Chromium on `/docs/table` dragged from a paragraph into a cell, kept that exact range, and Delete kept the table; the base side is inferred from source, since this change leaves that file alone. Making drags clamp would make that drag select the whole table again, so Delete would remove it. owner: the next table review, which decides whether the law or the import changes. stop: a browser test that drags across a table edge and asserts the law's result.
- Traced from source, not run: an IME composition that starts over a range with no landing still runs the removal (`composition-state.ts:1090`), and the composed text then lands at the nearest text. owner: the next table review. stop: composition start refuses where typing refuses, proven with native input.
- `replaceChildRunsChange` repeats `replaceChildrenChange` without its guards. owner: the next table review. stop: a root-change cleanup.
- A command over a range that crosses a table edge costs about 20 ms more than a transaction making the same edits by hand, on a 100-row table. Applying the command's transaction spec maps every node key through a structural change. The 20 ms comes from unreported diagnosis runs, the cost's growth with the document is read from source, and that clearing a cell's children makes the change structural is inferred. No timing line bounds it. owner: the next table review. stop: a cell clear that keeps simple cells path-stable, measured against this run's crossing cohorts.
- The hot-path lines for Plate and Plite and the crossing scaling line never ran below the load limit of 18 on this tree; every run was inconclusive. owner: the next table review. stop: `paired-config-r4-plate.json`, `paired-config-r4-plite.json` and `paired-config-r7-scale-b.json` in this run's `perf/` folder run on this tree's commit with the host's one-minute load at most 18.

## Close

Reversals and deviations come first.

- The Defaults pick said a drag from a paragraph into a cell widens to the whole table, so Delete removes it, and the third plan review's dismissal of the card's literal steps rested partly on that. A hand drive in Chromium found that a mouse drag keeps its exact range, so Delete keeps the table and clears only the covered text, which is what the card asks for. The source shows why. The drag's selection import runs `tx.selection.set` inside `editor.update`, and only the one-shot `editor.update.selection.set` lowers to the select command that Table's clamp wraps (`editor-lifecycle-api.ts`, `runtime-mutation-state.ts`). This change leaves both files alone, so base should behave the same, which is inferred and was not driven. The changeset, the spec entry, both plans and the subject now say so. The dismissal stands on the base's selection test and the locked drag law, and Open work tracks that the law's clamp never reaches a native drag.
- Three fixes went back to base's behavior after diff reviews found their replacements lost content: whole-document typing in rounds 2 and 3, and the start-block rule for a hanging range in round 3. Typing inside a transaction over a whole document types into its first block, as at base.
- The crossing timing line compared unlike work in its first run, a command against a transaction and two edits against one. It was repaired after that run, and `perf/budget-r7.md` in the run folder records the repair.

Plite's range removal now plans every editable grid a range reaches into and records where typing, paste, node insert, split and merge continue. Table declares its grid roles, and its clamp exempts only a whole-document range. `editor.point` and `state.points` read a node's edges from its text, and cleanup after a delete inside one block removes only the blocks it emptied at its end. The decision log's ship row names the commit.

Proof, from each row's scope:

- `grid-removal-contract.test.ts` passes 103 tests on a schema-declared grid, and Plate's table specs pass 249, among them the card's range through delete, typing and paste.
- On the final tree, plitejs lint reports 0 warnings and 0 errors on the ten changed files, and its typecheck exits 0. The forced turbo run passes 19 of 21 tasks and fails only the react partition's authority audit, which fails the same way at base. Plate's suite passes 3779 tests and fails the same seven as base, and Plate's tsc prints base's 249 errors line for line.
- A hand drive in Chromium on `/docs/table` ran the card's range. A delete through the browser handle kept the 4x4 table and emptied the paragraph and the "Plugin" cell, and an insert of W kept the table with W in the paragraph. A mouse drag over the same range followed by the Delete key kept the table. `hand-drive.mjs check` passes for `/docs/table` at desktop width.
- The crossing ratio line passes. A transaction over the crossing range costs 1.016 of the same edits made by hand, and one that also removes a table costs 1.009, against 1.25, with planted arms at 3.5 and 4.0 and the load at most 11.67. The hot-path lines for Plate and Plite and the crossing scaling line stayed inconclusive in every run, with the load between 18.16 and 149.17 against a limit of 18. CPU-time diagnostics, not lines, read the collapsed delete at a median of 0.94 of base on Plate over seven alternating pairs, and the per-keystroke collapsed delete at a median of 1.05 of base on Plite at a load near 70, too noisy to call either way.
- The landing ran only lint, because the owner said to skip the tests. The attempt before it passed 23 of 24 affected check steps, www's included once this change regenerated www's editor schema for the grid roles. Only two CLI watch cases failed, at their 60-second timeout under load, and both passed when the CLI suite ran alone on this change.

Proof stops short of Firefox and Safari, the other drag direction and a native paste. Three timing lines stayed inconclusive, and no line bounds the command's constant cost of mapping node keys through a structural change.

The card's one ask is done. The first plan ran three diff review rounds, and this plan ran three plan review rounds and three diff review rounds, the cap. Of the critical findings, the first plan applied 16, dismissed 2 and sent 7 here; this plan applied 25, dismissed 1 and left 2 open, both failing the same way at base.

The open work, each item with its owner and stop, moved to the subject file's Open work.
