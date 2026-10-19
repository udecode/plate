# Keep a table's grid when a range removal crosses its edge

Status: superseded by the 2026-10-19 repair plan, which carries its delta and lands both
Topic: table
Playbook: bug-fix

## Brief

### What will change?

Delete, typing, Enter and paste over a range crossing a table's edge keep every row and cell when code passes that range or sets it inside a transaction. Select-all then Delete empties a document that starts with a table.

### What could go wrong?

Editors with tables get a new schema fingerprint, so old snapshots, history and Yjs rooms stop matching. Selecting into a table with the select command still selects all of it, while a mouse drag keeps its exact range. Node edits ending at a table's first cell still land inside it.

## Teach

A table is a grid of rows and cells. Plite, the editor core, removes a selected range the same way everywhere: it drops the blocks the range covers, keeps the first block and joins the rest of the last block into it.

Table's handlers act only when both ends of the range sit in one table. With one end outside, Plite treats cells and rows as plain blocks. A covered cell goes and the cells after it move left, covered rows go, and the paragraph after the table joins a cell.

Now Table declares its grid roles. Plite keeps any grid a range reaches into unless the range covers it and goes past an edge. A kept grid keeps every row and cell. A fully covered cell keeps one empty block, and an edge cell loses only the covered text. A text move that would leave a grid behind refuses.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Selecting from a paragraph into a cell with the select command | The selection still widens to the whole table, so Delete removes it. A mouse drag never reaches that widening and keeps its range (answer) | The selection stops before the table, so Delete keeps it | stop before table | big |
| Which edits keep the grid | Every edit path, inside transactions too, except a node insert, split or merge that ends at a table's first cell, which the next table review owns | Only the delete, type, Enter and paste commands | commands only | big |
| Node insert, split or merge over a range that ends at a table's first cell | Still lands in that cell, as before, while this stays open (look) | Lands before the table, at the cost of changing how every removal trims a range that ends at a block's start, plus another review round | fix hanging insert | small |
| Two review findings that fail the same way before this change: a one-cell table selected exactly, and typing over select-all on a document that starts with a table | Fixed here, since each is a removal that skipped the table rule (look) | Undo both fixes and state each gap instead | revert base-matching fixes | small |
| Table diffs | Tables compare row by row and cell by cell | Tables keep comparing as plain blocks | plain table diff | small |
| Selecting out of a document's first table with the select command | Stops at the table's end, like any other table | Keeps crossing the edge from the first cell | keep first-table drag | small |
| A text move that would leave a table behind | Refuses, so nothing moves | Moves the text and copies the table's rows along | move table rows | small |
| A cell the range covers whole | Keeps its first block, emptied, when you can type in it; one that starts with an image or another block you can't type into becomes an empty paragraph | Keeps its images and loses only text | keep cell images | small |
| Paragraph between two kept tables | Stays, emptied | Goes, so the two tables touch | drop middle paragraph | detail |
| Range inside one table, set inside a transaction | Clears the covered text cell by cell | Clears the whole rectangle, like the command | rectangle in transactions | detail |

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| added | Range removal across a table edge | Plite's range removal keeps every declared grid it reaches into unless the range covers it and reaches past an edge; Table declares its grid roles. A kept grid keeps every row and cell, and nothing joins into or out of a cell. |

| Delta | Alternative | Why it lost |
| --- | --- | --- |
| added | Table command wrappers for cross-edge removal | Raw transactions, IME replacement, merges and text moves reach Plite's removal without a command, so wrappers leave the grid breakable. |

## Main changes

- Plite's `deleteText` plans a range that reaches into a schema `structure: { kind: 'grid' }` element before any other removal path. A grid the range covers and reaches past goes as one node, and a range of whole top-level blocks that keeps no grid still removes those blocks whole. Any other grid, a grid the range spans exactly included, keeps every row and cell. One change empties the cells the range covers whole, keeping a first editable text block with its first text's properties or taking the cell's default child, the at most two edge cells lose their covered text, and the pieces outside the grid are removed as ranges of their own.
- The removal returns its caret and whether it kept a grid. Typing over an explicit range, slice landing, node insert, split and merge continue at that caret instead of reading the selection, and a merge stops when the removal kept a grid. A range that ends at the start of a grid's first cell is pulled back out of the grid before any planning, so a node insert, split or merge there still acts inside that cell; the next table review owns that gap, listed under Open work.
- The highest-block lookup in `deleteText` stops at the nearest grid cell, so empty-structure cleanup after an edge cell loses text stays inside that cell.
- Typing over a whole document takes the one-paragraph shortcut only when the document starts with an editable text block, so a document that starts with a grid goes through the removal.
- `resolveDeletedRange` returns nothing for a range whose removal keeps a grid, so a text move over it refuses as lossy.
- `BaseTablePlugin` declares the grid roles on table, row and cell, so `plitejs/diff` also compares tables by rows and cells.
- Table's selection clamp exempts only a range whose edges are its root's first and last points, instead of every range that starts in a document's first table.

## Steps

- [x] Public-boundary tests that fail today, one per failure mode, in Plate's table delete spec and a Plite raw contract.
- [x] Plite planner and executor in `deleteText`, slice landing, and `insertNodes` and `splitNodes` continuing at the removal caret.
- [x] Table declares its grid roles; the clamp exemption narrows; the selection spec follows the locked drag law.
- [x] Check table diff output with the grid declared.
- [x] Law lines in the editing spec and the Plite vision; the schema field's doc comment.
- [x] Push panel round 1 fixes: the returned caret, the planner before the whole-block path, cleared cells, the cleanup exemption, node merge and the move refusal.
- [ ] Owner rows in the table and editing subjects.
- [x] Push panel round 2 fixes: cleanup bounded at the cell, the caret for explicit typing, cleared cells keeping text properties, cells with no default, merge after a grid removed whole, a grid spanned exactly, typing over a document that starts with a grid, and atoms and read-only blocks in covered cells.
- [x] Push panel round 3, which sent five mechanisms back to planning in the 2026-10-19 repair plan.
- [ ] Verify (package tests, typecheck, lint, crossing cost, hand drive), changeset and land, after the repair plan's build.

## Open work

- A node insert, split or merge over a range that ends at the start of a table's first cell acts inside that cell, as at base. The removal first pulls the range back to the paragraph before the table, so no grid removal runs, and a merge then joins the cell's first block out of the table and drops the cell. owner: the next table review. stop: a fix that plans the grid on the caller's range before unhanging it. Once it lands, drop the limit from the Plite vision grid bullet, the changeset's node edit sentence, the caret bullet under Main changes and the Defaults row on which edits keep the grid.
- The grid removal executor takes a `gridOnly` flag, passes its caret out through closures, and lives in `delete-text.ts`, apart from its planner in `delete-text-grid.ts`. owner: the 2026-10-19 repair plan. stop: its build, which moves the executor beside the planner and drops the flag and closures.
- `replaceChildRunsChange` repeats `replaceChildrenChange` without its guards. owner: the next table review. stop: a root-change cleanup.
