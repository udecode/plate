# Table selection and mounted interaction

Plate owns table semantics. `TablePlugin` keeps one private selection projection per mounted view and binds it straight to the canonical cell hosts, so selecting cells paints without re-rendering them. The public painter hook and the copied row and table overlay owner are gone, and Plite has no table marker, table selection API or generic scalar host channel. The 2026-10-04 audit kept this design: the replacements below already lost on benchmark and native proof, and nothing new reopened them. `node tooling/scripts/review-ledger.mjs show table` prints the full review and plan history.

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

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Plite `CellSelection` or table markers | Plite stays table-neutral, and the private Plate owner passes scale and native proof. |
| Public painter hook and copied overlay context | Deleted; no app needs to paint selection itself. |
| Generic scalar host channel | Slower in the 30-packet owner probe and no independent public job remains. |

The 2026-09-17 owner probe ran the repaired painter, an explicit scalar channel and the private binder over 30 interleaved packets per cohort. The binder passed every budget with zero selection-induced cell renders: selection p95 17.9, 210.6 and 1819.6 ms for normal, large and stress documents, against 18.4, 218.8 and 2537.5 ms before ([design](../2026-09-17-table-selection-host-projection-design.md)). Native held drag, contraction, sparse paint, clipboard, resize interference, subscriptions, undo and deferred layout passed 14 of 14 in Chromium. These are dated results, not current proof.

## What other editors do

Not compared in this scope's reviews. They weighed Plite and Plate owners only; `docs/research/sources/` holds the editor pages to compare against.

## Main changes

- Table selection paint moved from a public painter hook and copied overlay context into one private per-view binder inside `TablePlugin`.

## Open work

- The host map assumes one canonical host per node key per mounted view; a custom cell that drops or duplicates the ref breaks it. owner: the next table review. stop: a review that covers custom cells.
- No physical-device proof; mount evidence is a distribution of per-process p95 values. owner: the next table review. stop: a device lane for tables.
