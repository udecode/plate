---
description: Check that every table insert, remove, merge and split command, Enter, Backspace, Delete, paste and delete inside and across cells, typing and paste over a picked cell, and typing right after a merge, leaves a table whose cells cover every slot exactly once and puts each cell's content where the Table section of docs/editor-behavior/markdown-editing-spec.md says, on every span layout of up to three rows and three columns. Use before and after changing packages/platejs/src/features/table or another file in its coverage record, when the table-grid step of pnpm check fails, or when fixing a table structure or cell-editing bug a test or a tester found.
argument-hint: '[check | deep | lower | case <identity> | update]'
name: table-grid-commands
metadata:
  skiller:
    source: .agents/rules/table-grid-commands.mdc
---

# Table grid commands

Handle $ARGUMENTS. `check`, or no argument, runs the gate. `deep` runs `--all` and compares its failures with Findings. `lower` runs `--lower` after a fix removes a known finding. `case <identity>` runs `--case=<identity>` to print one case's full detail. `update` brings the verification in line with changed code, as Coverage record says.

**The property.** A user runs one table command on a table whose cells span rows and columns in any layout. Afterward every slot of the table belongs to exactly one cell, and each cell's content sits where the spec's Table section puts it: an inserted row or column holds only new empty cells, a removed row or column takes only its own cells and shortens the spans that cross it, a merge keeps every merged cell's content in row-major order in one cell, a split leaves the content in the first slot, Enter, Backspace, Delete and paste stay inside their cell, deleting a cell range or a picked cell clears those cells and keeps the table's shape, and typing or pasting over a picked cell replaces its content. A merge leaves the merged cell picked, so typing right after it replaces that cell's content and keeps its spans.

**The harm.** A broken grid draws cells in the wrong columns or drops them, and content that moves to another cell or disappears is lost work. Table took ten fixes in the two months before 2026-10-24, such as a9919f48f9, and the two Plite fixes d13c7b8765 and 8e107e7413 since then kept cells whole under Enter, paste and range deletes. Tests found each one a case at a time, and `grid.spec.ts` and `mutation.spec.ts` in `packages/platejs/src/features/table/lib/internal` sample about a hundred span layouts.

## What it checks

`packages/platejs/scripts/table-grid-commands.ts` runs the real `BaseTablePlugin` in a headless editor from `platejs`, with `allowCellSpanEditing` on. It checks the TypeScript code itself, not a model of it.

1. **Layouts.** Every way to cut a grid of up to `--rows` rows and `--cols` columns into rectangles, 411 layouts at the gate. Each cell holds one paragraph with its own letter, `a` to `i` in reading order, so content that moves or doubles shows.
2. **Commands.** Through `editor.plugin(BaseTablePlugin).update`: `insertRow` and `insertColumn` before and after a cell, `removeRow` and `removeColumn` at a cell and over a cell range, `split` at every spanning cell, and `merge` over a cell range, alone and followed by typing `k`. Through `editorCommands`: Enter at both ends of a cell, Backspace at its start, Delete at its end, a paste of an open two-paragraph slice `P¶Q` at its end, `deleteFragment` over a text range from one cell to another, `deleteFragment` over one cell or a cell range picked as nodes with `selection.setNodes`, and typing `k` or pasting `P¶Q` over one picked cell. A cell range is the smallest rectangle that holds both cells and that no cell crosses.
3. **Gate and `--all`.** `--all` runs every command at every cell and every pair of cells. The gate runs each insertion line once, each removed row or column range once, the pair of corner cells of each rectangle no cell crosses once, a range removal only where the rectangle spans the whole table across, and the cell edits, the commands over a picked cell and typing after a merge only on layouts smaller than three by three.
4. **The oracle.** The script lays the stored table out itself and never calls the plugin's `compileTableGrid`. Each row places each cell at its first free slot, a span must be a whole number of at least 1, a row span must not run past the table, and every slot must hold exactly one cell. It then compares that layout with the law of the command:
   - `table-grid`: a table whose cells do not cover every slot exactly once, a span that is not a whole number, a row span past the table, a table with no cells, or two tables.
   - `table-content`: a table that differs from what the law gives. An insertion passes when taking the new line out gives the original table back and every slot on that line belongs to a new empty cell inside the line or to a cell that crosses it. A new cell may copy a neighbor row's column spans, because the spec asks only for empty cells. Every other command must give one exact table: no table when it removes every row or column, and the unchanged table when the plugin refuses a range removal that does not span the whole table.
   - `table-throws`: a command that throws.
5. A command that returns `false` counts in the summary's `refused`, and its table must still match the law.
6. It compares the findings with `packages/platejs/scripts/table-grid-commands-baseline.json` through `tooling/scripts/finding-baseline.mjs`. Every finding is filed under `packages/platejs/src/features/table/lib`. An identity names the layout and the command, never the result.

## Run it

Run every command from the repository root.

- `pnpm check:table-grid` checks the gate: 14,471 cases on 411 layouts. It took 34 s at a load average near 55 on 2026-11-23, and 93 s at a load average of 110 when it held 13,590 cases. It prints one JSON summary line, then each finding the baseline does not list. `pnpm check table-grid` runs the same step through the check runner, and Local CI runs it on next after each landing.
- `pnpm check table-grid --light` is the run a session makes before a diff panel, and it runs the gate. The gate is its own light run, because its 90th-percentile time is 65 s. It took 69 s through the check runner at a load average near 125.
- `--all` runs every command at every cell and pair, 56,840 cases, which took 60 s at a load average near 55 on 2026-11-23. `--rows` and `--cols` raise the layout bound. A bound other than the gate's, `--all` or `--case` skips the baseline and exits 1 on any failure.
- `--case='<identity or part of one>'` runs only the cases whose identity contains it and prints each failure's stack, such as `'--case=a b | c d :: pick a delete'`.
- `--jobs=<n>` sets the number of worker processes. It defaults to `CHECK_CORES`, the cores the check runner reserves for the step, and otherwise to the machine's cores up to 16.
- Exit 0 is a pass and exit 1 a finding. Exit 2 is a bad flag or a crashed worker. At the gate the run also fails when it compares other than 14,471 cases, the `GATE_CASES` constant, so a change that drops commands cannot shrink the gate while the baseline still matches. Update the constant only with the reason the count moved.
- After a fix removes a known finding, the gate fails until you run `pnpm check:table-grid --lower`. The baseline never grows. `--init` seeds only a rule the baseline lacks, and `--lower` and `--init` write nothing when the case count misses `GATE_CASES`.

## Read a failure

A finding prints its rule, identity and detail. A table reads row by row, rows split by `|`, each cell its paragraphs joined by `+`, `∅` for an empty paragraph, and `:r2` or `:c2` for its spans:

```text
table-content a b | c d :: pick a delete
  gives b ∅ | c d, not ∅ b | c d

table-grid a :: pick a delete
  the table has no cells
```

Both were findings until the fix of plate-private#265. In the first, the picked cell `a` is removed, `b` moves to the first column and a new empty cell fills the end of the row. Run `--case` on the identity for the stack.

Tell a real bug from a modeling error before you change code:

- **Real bug.** A user can run the command on that layout, and the table breaks or a cell's content lands in another place than the spec's Table section says. Fix the table plugin or the Plite command it runs, then run `--lower`.
- **Modeling error.** The law asks for more than the spec says, as when an insertion law once required one-slot cells and the plugin copies the neighbor row's spans. Fix the script with the reason.
- **Intended change.** A change to what a command does changes the law too. Change the law and the spec's Table section together. Never weaken a law or add a baseline entry to get green.

## Findings

The gate and `--all` find none.

Until the fix of plate-private#265 the gate found 210, all from deleting one cell picked as a node, t_3e344661, and `--all` found 1,526 of the same class. When the picked cell shared a row with another cell, `deleteFragment` removed the cell instead of clearing it, and the row's later cells moved left, as in `a b c :: pick a delete`, which gave `b c`. On a table of one cell it left rows with no cells.

## What a pass proves

Bugs planted on this tree showed where the gate holds:

- A mutant where `removeRow` in `packages/platejs/src/features/table/lib/internal/mutation.ts` keeps the row span of a cell that crosses the removed rows gives 86 more `table-content` findings, all `removeRow`, such as `a b c:r2 | d e | f g h :: removeRow d` giving `a b c:r2 ∅ | f g h`. The table's repair fixes the span that runs past the table, so the break shows as content in the wrong place, not as `table-grid`.
- Before the fix of plate-private#265, the gate found 714 more `table-content` findings. All 285 typing-after-merge cases failed, as in `a b c :: merge a..b type k`, which gave `k c`, not `k:c2 c`. The merge leaves one cell picked, and the table's typing, paste and delete counted only two picked cells or more as a cell selection. 131 of the 298 `pick … type k` cases and all 298 `pick … paste P¶Q` cases failed for the same reason.
- t_3e344661's own case, a one-cell table whose picked cell is deleted, failed as `table-grid` with `the table has no cells` before that fix. The script reports it only because its own layout counts a table with no cells as broken; the plugin's `compileTableGrid` reports no problem for it.

## Coverage record

Synced at `test(platejs): check that every table command keeps a valid grid on every small span layout`. The verification describes these files as they stand there:

| File | What the check exercises |
| --- | --- |
| `packages/platejs/src/features/table/lib/BaseTablePlugin.ts` | the update methods, the cell selection each one reads, merge, split and the table's repair after a change |
| `packages/platejs/src/features/table/lib/internal/mutation.ts` | the plans for inserting and removing rows and columns |
| `packages/platejs/src/features/table/lib/internal/grid.ts` | the plugin's own grid, which the commands read |
| `packages/platejs/src/features/table/lib/internal/selection.ts` | the rectangle a cell range selects, and whether a selection holds whole cells |
| `packages/plitejs/src/core/editor-commands.ts` | `deleteFragment`, `delete`, `insertBreak` and `replaceSlice` |
| `packages/plitejs/src/core/node-selection.ts` | deleting cells picked as nodes |
| `packages/plitejs/src/transforms-text/delete-text-grid.ts` | deleting a text range across cells |
| `packages/plitejs/scripts/check-harness.ts` | the flags, workers and gate the check shares |

To see whether the verification needs another look, find the sync commit with `git log --oneline -1 --grep "every table command keeps a valid grid"`, then run `git log --oneline <that commit>..HEAD --` with the table's files and `packages/platejs/scripts/table-grid-commands.ts`. For each commit it lists, read the diff and confirm three things. A new table command, or a new option of one, is a command in the script or a line in What it does not cover. The laws still compare with the table the script built and laid out itself, never with `compileTableGrid` or another output of the plugin. A rule added to the spec's Table section that changes what a command does is in its law. Move the sync commit in this file forward, naming its subject, only after that check and a run of `pnpm check:table-grid`.

## What it does not cover

- Tables larger than three by three, which `--rows` and `--cols` reach, two tables, nested tables and a table inside another block, such as Details.
- Cells that hold their text directly, as in the Plite tables example. d13c7b8765 and 8e107e7413 fixed those cells in Plite, and Plate's `tableCell` holds paragraphs.
- Header cells and rows, borders, backgrounds, column widths, row heights, resizing and `allowCellSpanEditing` off.
- Paste of copied cells or a table, which `EDIT-TABLE-PASTE-EXPAND-001` covers, and a range with one end outside the table, `EDIT-TABLE-RANGE-EDGE-001`.
- Where the selection lands after a command, and undo and redo of a table command.
- `editorCommands.delete` called directly on a picked cell, which still removes the cell. Backspace and Delete in the browser send `deleteFragment` for a node selection, which the check runs.
- Tab and arrow navigation, cell selection by pointer or keyboard, and the browser.

`/pstack:maintain-formal-verification-skill` brings this verification back in line after changes that did not recheck it.
