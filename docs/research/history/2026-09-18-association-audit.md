# Feature history migration audit

Observed 2026-09-18. Read-only repository audit; the classified associations are imported into [review-index.json](../review-index.json), not product verification.

## Coverage

- 248 inspected documents associated across all 64 existing scopes: 191 plans, 29 decisions, 25 reports, one specification and two lessons.
- Inspected title, objective/current verdict, lifecycle statements and relevant closure/decision sections; did not replay historical product proof.
- All existing indexed plan/decision documents and all non-artifact Markdown references from immutable records were inspected, then scoped candidate additions were inspected. The shared Plite/core/view decisions deliberately retain multiple question associations.
- Table, Suggestions and Comments were examined first and more deeply. Table topology, resize, native fragment proposals, canonical API, projection and host-delivery histories remain distinguishable.
- 911 existing scope-candidate pairs across 765 distinct documents remain unresolved. Their filenames are discovery evidence only. They remain in the canonical index and generated hubs as candidates, not promoted to associations or progress.
- Two content-checked false associations are rejected explicitly: GitHub PR comment publication is not the Comments feature; HTML-in-canvas runtime exploration is not embedded Excalidraw.

## Import contract

- `rows` are content-inspected associations. `disposition: historical` means preserve dated work and conclusions; it does not assert either success or failure.
- `reviewReferences` contains immutable reviews citing the document, plus explicit IDs found in the document. A later review citing an older plan is not the governing review for that plan.
- `reviewBasis` is populated only for four recoverable primary plans. Empty means unknown/unbound, never inherit the latest review just to fill a field.
- `contentSha256` captures the observed document version. Parent edits and concurrent work may invalidate it; reread and fingerprint final documents before recording outcomes.
- `observedStatus` records actual visible lifecycle labels outside fenced code. Multiple labels are a real migration problem. An empty list is not proof that a plan is incomplete: some old plans have phase-table closure or handoff prose instead.
- `workKind` distinguishes accepted implementation plans from completed research/design/verification. It does not claim that their declared acceptance was met.
- `missingCurrentLinks` identifies six content-confirmed existing decision pages absent from their scopes: Table, Collaboration, UI, Transactions, Reads and Large Documents.
- `scopeAudit` preserves legacy flags as unbound reports; migration must not turn adopted/verified into new certified outcomes.

## Priority contradictions

- **table:** Plan contains completed September 18 Strict Mode lifecycle cleanup and rejected deletion trials after September 17 latest review. Decision must discover this later execution without reopening topology/resize. Bind a historical outcome with explicit proof limits and reconcile decision summary.
- **suggestions:** Decision says edit/markup unsupported and adoption unimplemented; plan says Complete across native, Plate, product roots, docs, doctrine and browser. Reconcile implementation summary from completed plan; do not certify missing source-bound receipts.
- **comments:** Latest attachment/discovery plan is Gated: native runtime not execution-ready and product source unchanged. Earlier completed history plan is not proof for corrected unrelated-typing attachment contract. Show design gate as active and retain prior history closure as bounded historical outcome.
- **clipboard:** Decision says product adoption and production proof incomplete; plan begins Complete and claims every clipboard-owned proof gate passed. Reconcile plan completion, keeping scope proof claims unbound until evidence is actually fingerprint-bound.
- **table:** Deferred spec still proposes native table-area rectangle algebra; later closure explicitly retains structural core insertion and extension-owned grid paste. Mark old target superseded navigation and link completed plan/current Table decision; retain rejected proposal.
- **plate-api:** Historical objective deletes editor.plugin/tx.plugin; explicit September 14 correction restores descriptor portals for reusable consumers. Retain question-specific reversal, use current correction and decision rather than first objective as current target.
- **diff:** Design/probes complete but 43 production acceptance families uncertified; plan completion is not implementation adoption. Use work_kind design and unknown/unbound product proof.
- **ui:** Dated audit plan contains subsequent execution of 46 families and 637 contracts. Initial read-only objective is historical; current execution claims closure and final receipts are under ignored artifacts. Associate inspected affected feature scopes, retain a versioned summary of final verification, and keep imported proof limits explicit.

## Primary lifecycle cleanup targets

| Plan | Observed duplicate status lines |
| --- | --- |
| suggestion-package-over-authored-changes | 5, 91, 189, 266 |
| authored-direct-editing-with-visible-suggestions | 3, 48 |
| comments-history-api | 3, 209 |
| table-selection-host-projection-design | 3, 9 |

The table host-delivery benchmark has no standalone lifecycle Status line. Its closure is in benchmark/handoff sections. Keep one authoritative current lifecycle and label earlier step outcomes explicitly as history.

## Preservation and uncertainty

- Historical records are untouched. No Git mutation, product code, generated output or repository Markdown was changed by this audit.
- Keep rejected native Table marker/scalar-channel directions, authored-load alternatives, Comments sidebar reversal and code-performance failed experiments discoverable.
- Preserve the September 14 correction restoring reusable Plate descriptor portals after the earlier Plate core objective deleted them; reading only the initial objective gives the wrong target.
- Full Plate UI extraction is a cross-feature execution plan whose current completion comes after its preserved read-only objective. Its substantive affected families are associated. Durable final verification is still linked through ignored artifacts and needs a versioned summary; the plan claim alone is not a source-bound receipt.
- Do not import the April HTML-in-canvas brainstorm under embedded canvas merely to cover the scope. The inspected Excalidraw package review and full UI execution are the appropriate associations.
- Supersede the deferred native table-fragment specification individually. The mixed docs/plite tree contains retained specifications and research; no tree-wide historical downgrade is justified.

Concurrent activity: root repaired Suggestions and Table summaries during this audit; Comments owns a concurrent gated design update. Re-read those live files before editing, and treat contradiction entries as observed pre-reconciliation evidence.

## Integration disposition

The Table and Suggestions summaries and clipboard adoption summary are reconciled
with their later reported execution. Table’s older native rectangle proposal is
marked superseded. The latest Comments design remains explicitly gated in its
current decision. Plate descriptor-portal reversal stays in its existing current
decision, structural Diff stays design-only, and the [UI closure summary](../../editor-audits/reports/2026-09-07-plate-ui-execution.md)
preserves the final report and rejected cut. Missing original proof bindings
remain unknown in imported execution records. Six missing decision links are
repaired. Primary active plan metadata uses one authoritative lifecycle status;
ambiguous historical lifecycle labels remain visible tracking gaps.
