# Table selection and mounted interaction

Page: https://claude.ai/artifact/W5cQoXKaRJYjvFAGaXEtaW

Plate owns table semantics. `TablePlugin` keeps one private selection projection per mounted view and binds it straight to the canonical cell hosts, so selecting cells paints without re-rendering them. The public painter hook and the copied row and table overlay owner are gone, and Plite has no table marker, table selection API or generic scalar host channel. The 2026-10-04 audit kept this design: the replacements below already lost on benchmark and native proof, and nothing new reopened them. Table also declares its grid roles, so Plite keeps a table's rows and cells when a range removal crosses the table's edge. `node tooling/scripts/review-ledger.mjs show table` prints the full review and plan history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Implicit table selection reads | Use the canonical table snapshot; explicit targets and transaction drafts keep priority. |
| Authored snapshot and root scope | The Plite view wrapper scopes snapshot and root reads together. |
| Range and exact-node paint | One private `TablePlugin` projection. A range keeps span closure; an exact cell, row or table selection stays exact, mixed tables included. |
| Host delivery | A private binding composes into the canonical `TableCellPlugin` host ref, updates only affected keys and cleans up on replacement, detach and unmount, Strict Mode included. |
| Known cell path reads | Read through the pure grid, without selection compilation or native key indexing; the registry static cell passes its path ([content-root locations](../2026-09-30-content-root-locations-execution.md)). |
| Public React attributes | `render.useViewElementAttributes` snapshots and custom-component props stay complete. A custom cell forwards `props.attributes` and its ref once to `<td>` or `<th>`. |
| Edge paste | Expanding a table by paste updates `columnWidths` with the same internal policy as column insertion. |
| Resize | Keeps its math, pointer and commit owners; accessibility and hit targets are separate questions. |
| Range removal across a table edge | Table declares its grid, row and cell roles, and Plite's range removal owns the rule. A range keeps every editable grid it reaches into unless it covers the grid and reaches past an edge. A kept grid keeps every row and cell, a covered cell keeps one emptied block, an edge cell loses only the covered text, and nothing joins into or out of a cell. A void, atom or read-only grid goes whole like any other block. |
| Where writing lands after such a removal | The range's start, the first covered cell that can take text, the point after the removal, the point before it, or a new paragraph when the document empties, whichever comes first. Typing, paste, node insert and split refuse when none can. |
| Selecting from outside a table into a cell | `editor.update.selection.set` grows the selection to the whole table, so Delete removes it. Only a selection of the whole document stays as it is. A mouse drag keeps exactly what you dragged, because it never goes through that command, so Delete keeps the table and clears only the selected text. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Plite `CellSelection` or table markers | Plite stays table-neutral, and the private Plate owner passes scale and native proof. |
| Public painter hook and copied overlay context | Deleted; no app needs to paint selection itself. |
| Generic scalar host channel | Slower in the 30-packet owner probe and no independent public job remains. |
| Table command wrappers for cross-edge removal | Raw transactions, IME replacement, merges and text moves reach Plite's removal without a command, so wrappers leave the grid breakable. |
| Refuse grid cells that can hold no child | The base builds such a schema and deletes in it, and a cell whose default is a table with empty rows still holds no text. |
| Continue a node merge at the removal's caret alone | A removal that lands on the next table's first cell, as a delete should, still lets the merge pull that cell out. |
| Read blocks as the base did for ranges whose ends sit in different cells | It lets a range that starts at an image in one cell move its start into the cell before, and the planner then removes the whole table. |
| Keep programmatic selections exact and clamp only native drags | The base's Table test pins the widening for `editor.update.selection.set`, and a native drag's import writes through `tx.selection.set`, which no select command wraps. |
| Clean up under the common ancestor of the range's ends | When the piece before a table spans blocks at two depths in a container, that ancestor is the container, and the cleanup removes the kept table's emptied cells. |
| Land typed text in the next writable text after the range | It writes into text the range never reached. |
| Clean up only blocks between each step's ends | Removing an image at a step's end moves that end into the cleared cell next to it, and cleanup then removes the cell. |
| Check every landing with the text block check | A text after a required paragraph can take typing where it stands, and that check refused it. |

The 2026-09-17 owner probe ran the repaired painter, an explicit scalar channel and the private binder over 30 interleaved packets per cohort. The binder passed every budget with zero selection-induced cell renders: selection p95 17.9, 210.6 and 1819.6 ms for normal, large and stress documents, against 18.4, 218.8 and 2537.5 ms before ([design](../2026-09-17-table-selection-host-projection-design.md)). Native held drag, contraction, sparse paint, clipboard, resize interference, subscriptions, undo and deferred layout passed 14 of 14 in Chromium. These are dated results, not current proof.

## What other editors do

Not compared in this scope's reviews. They weighed Plite and Plate owners only; `docs/research/sources/` holds the editor pages to compare against.

## Main changes

- Table selection paint moved from a public painter hook and copied overlay context into one private per-view binder inside `TablePlugin`.
- Plite's range removal plans around every element whose schema declares `structure: { kind: 'grid' }`, in `delete-text-grid.ts`. It reads each end's grid levels in one descent, plans once on rootless points, removes whole any node that holds no text between a range end and the planned grid, anchors every step's target before the first step runs, and records where writing lands. `prepareRemoval` decides before anything changes and `applyRemoval` writes. Typing, slice landing, node insert, split, merge and text moves go through them or `removeText`.
- `editor.point` and `state.points` read a node's edge from its first or last text through one reader in `editor/point.ts`. `isStructuralEdge` there decides whether a range covers a node, for the planner, the whole-block shortcuts and the `fragment.delete` and `text.insert` commands.
- `isEditablePath` in `core/writable-text.ts` walks a path's ancestors for void, atom and read-only elements, and the planner, the landing check and the block lookup call it.
- A delete's highest-block lookup stops at each end's own cell, and cleanup after a delete inside one block removes only the blocks the delete emptied at its end.
- A merge after a range removal continues only when both blocks sit in one cell or outside every grid.
- `BaseTablePlugin` declares the grid roles on table, row and cell, so `plitejs/diff` compares tables by rows and cells, and its selection clamp exempts only a range over the whole root.

## Open work

- The host map assumes one canonical host per node key per mounted view; a custom cell that drops or duplicates the ref breaks it. owner: the next table review. stop: a review that covers custom cells.
- No physical-device proof; mount evidence is a distribution of per-process p95 values. owner: the next table review. stop: a device lane for tables.
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
