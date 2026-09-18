---
title: Clipboard interchange and content fitting
type: decision
status: proposed
updated: 2026-09-18
review_scope: clipboard
current_review: 2026-09-13-clipboard-transfer-convergence
review_history:
  - ../review-records/2026-09-13-clipboard-transfer-convergence.json
reconciled_executions:
  - 2026-09-18-table-edge-paste-regression
  - 2026-09-18-recovered-2026-09-13-clipboard-transfer-policy
---

# Clipboard interchange and content fitting

Status: Review complete — Pursue. The selected design and reported adoption are in
the [clipboard transfer plan](../../plans/2026-09-13-clipboard-transfer-policy.md).
That plan is Complete and reports every clipboard-owned proof gate closed.
The September 18 history migration recovers this later execution claim but
does not replay it or recover a complete original source/receipt binding.
Current proof is explicitly unknown; the old proposed/planned summary is not
a reason to execute the same adoption again.

The `2026-09-18-table-edge-paste-regression` execution verifies one current
Plate format-policy consumer: a closed table slice pasted at the bottom-right
edge grows both dimensions, retains all four cells and updates the table's
column-width metadata atomically. The neutral Plite clipboard and fitting
contracts remain unchanged; the repair stays in the Plate table paste owner.

Question: What does transfer preserve across schemas and editor instances, and
can one content-fitting owner replace feature-specific paste repair?

Scope and acceptance: assess all 10 clipboard census groups plus their
decision-critical Plite DOM and Plate consumers. Record one disposition per
group, compare keep/change/add/delete/merge/move/replacement directions, and
persist an immutable review with source fingerprints and proof limits. This
review authorizes no product implementation or publication. Separate feature
reviews, including tables, HTML, DOCX, CSV and drag-and-drop, remain separate.

Required behavior: copy the exact selected content and mounted authored
projection; preserve open structural edges and referenced roots; apply schema
copy policy and transfer trust boundaries; fit at the destination; preserve
cut safety, atomic changes, selection and history; keep product format policy
outside the neutral substrate. Requirements come from the clipboard ledger,
Best API Review, Task workflow and the root/scoped Vision.

- [x] Inspect the 10 groups, public contracts, different consumers and prior evidence.
- [x] Compare the material alternatives and resolve the value verdict.
- [x] Record sources, evidence limits, coverage and the single next owner.
- [x] Record and render the canonical ledger; the clipboard row resolves to
  `reviewed / planned / partial / task`. Global inventory freshness is recorded
  honestly in the linked plan rather than folded into this review verdict.

## Verdict and next owner

The strongest justified cut is the projected-selection paste pipeline's
independent payload decoding, handler termination and fallback insertion.
Converge those policies at the existing DOM clipboard owner. Keep the adapter
that identifies exactly which visible ranges the mounted selection means.
Pair that convergence with a complete-slice rewrite contract: closing edges or
limiting content must not silently discard roots referenced by surviving nodes.
These are coupled API, ownership, adoption and proof decisions.

The review's value verdict led to the linked Task design plan. Its stronger
cut replaces the separate clipboard-handler contribution pipeline with existing
pure command registration, while preserving the DOM MIME owner and exact-view
target adapter. Complete slice rewriting, private assembled-slice export,
private table child fitting, static capture and committed uploads have one
ordered adoption plan. The final hostile review rejected public supplied-slice
export and public exact-child/group placement arms because each had only an
internal caller. It also rejected live NodeKey allocation during detached spec
construction: upload correlation reuses prepared transaction identity, with
same-spec stability as an explicit Plite core exit and existing block/node
insertion retained as the placement owner. File objects stay in the existing
`afterCommit` closure; transaction specs carry those callbacks as private local
metadata so accepted commands preserve tested File identity without cloning
host objects through typed effects.
Authored v5/effect v4 adoption uses reader-first deployment and a proven cohort
or room rollover before new writers join. The plan owns current prototype
evidence and resolved design gates; this immutable review history is not
rewritten as an implementation claim.

The design invocation was:

```text
$task design plan clipboard: unify transfer policy and preserve complete slices
```

The linked plan owns the execution outcome and its limits. Reconcile current
source and retained proof before proposing further work; a historical review's
Pursue verdict does not imply its implementation is still pending. Publication
requires its own authority.

The compiled fitter already owns fitting. Replacing it or merging every
feature's paste policy into it has no demonstrated value. Table placement,
format interpretation and visible selection each have independent jobs.

## Findings at the September 13 review

### Cut independent projected paste interpretation

[mutation-controller.ts](../../../packages/plitejs/src/react/editable/mutation-controller.ts)
decodes the original exact fragment and plain text before running handlers.
`applyProjectedClipboardInsertDataHandlers` supplies a terminal that always
returns false. A handler's `next(replacementData)` consequently cannot feed the
separate fallback, which still uses the original data. That fallback also
bypasses the canonical DOM host's general codec interpretation.

The fallback deletes projected ranges before trying insertion and does not
check the insertion result. A fitter rejection can therefore leave deletion
as the only change. This combined rejection scenario was identified from
source, not reproduced in a mounted browser during this review.

The existing [DOM handler dispatcher](../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts)
passes replacement data to its terminal, and
[with-dom.ts](../../../packages/plitejs/src/dom/plugin/with-dom.ts)
connects that terminal to canonical insertion. The design question is how that
policy can operate on an exact projected replacement target atomically.

Projected extraction also calls `state.slice.get`, while ordinary export uses
`state.slice.export`. This bypasses export middleware. The
[diff export policy](../../../packages/plitejs/src/diff/lib/excludeDiffFragment.ts)
is a concrete consumer: it strips diff metadata from both content and roots.
The projected writer already delegates to the shared DOM payload writer; it
does not duplicate the whole serializer.

### Preserve complete slices through rewriting

The core already has one compiled slice fitter. `state.slice.fit` previews a
transaction; `tx.slice.replace` applies the same fitting law atomically;
`state.slice.fitContent` handles a detached parent. Whole-document fitting
also delegates to that engine. Open edges, schema context and root provenance
are real responsibilities that a bare node array cannot represent.

The root-preservation probe finds a concrete contract gap. A valid closed slice
containing an element with an owned root inserts successfully and remaps that
root. Adding `maxLength: 3` causes `limitSliceInsert` to discard the root payload
while retaining its owner. Insertion throws a missing-root error and publishes
zero commits. Rewriting the same content through `ContentSlice.withContent`
with `open: 'closed'` also discards the roots; the `preserve` branch succeeds.
Closing structural edges and discarding referenced content are independent
decisions. Their coupling needs to be reviewed at the slice owner.

The existing `ContentSlice.withContent` unit test explicitly expects roots to
be dropped when edges are closed. This is a contract design problem, not merely
an omitted assignment. The target must define reachability, pruning and root
identity remapping together with rewriting; this review does not settle a new
signature. Core atomic failure is preserved in the reproduced cases.

### Carry the contract through Plate transfer adapters

[BaseTablePlugin.ts](../../../packages/platejs/src/features/table/lib/BaseTablePlugin.ts)
closes rewritten table selections and extracted single-cell children through
`ContentSlice.withContent`. Its per-cell paste path fits
`ContentSlice.closed(children)`, while
[getTablePasteElement](../../../packages/platejs/src/features/table/lib/internal/paste.ts)
extracts only `slice.content`. These paths cannot carry the original incoming
root payload to the detached cell fitter.

The [static selection writer](../../../packages/platejs/src/static/internal/writeStaticSelectionClipboardData.ts)
likewise writes an exact internal envelope from `ContentSlice.closed(fragment)`.
When selected nodes reference owned roots, the node array alone is incomplete.
These are source-grounded consumer risks; root-bearing table and static-browser
reproductions remain future proof.

Rectangular table fill and placement still belong to the table feature. HTML,
Word, Markdown and CSV parsing into freshly produced closed content is not
itself a defect. The repair must distinguish that operation from rewriting an
existing slice that already owns additional content.

## Alternatives

| Direction | Assessment |
| --- | --- |
| Keep/configure current APIs | Existing export and handler hooks cannot repair callers that bypass them or discard roots. Insufficient. |
| Patch each caller independently | Fixes individual cases but preserves competing interpretation and repeated payload handling. Useful only as adoption steps toward a shared contract. |
| Change the existing slice rewrite contract | Pursue. Edge closure, payload preservation and pruning need independent laws at the slice owner. |
| Add a public clipboard plugin or transfer object | No independent user job demonstrated beyond DOM transfer, ContentSlice and target replacement. Reject speculative public machinery. |
| Delete ContentSlice; transfer bare nodes | Reject. Nodes alone cannot encode open edges and transitively referenced roots. Keep `getFragment` for its distinct node-array query job. |
| Delete projected extraction; use one canonical range | Reject. Authored retained fragments, ordered visible segments and repeated root ownership cannot always be represented by a single canonical selection. |
| Merge projected interpretation and export policy into the DOM owner | Strongest candidate. Preserve exact-view targeting, share interpretation/export rules and make replacement conditional on successful insertion. |
| Move all feature paste repair into the core fitter | Reject as a blanket target. Schema fitting is neutral; table placement and external format policy have independent owners. Root-preserving mechanics belong below those policies. |
| Replace the fitting engine or all clipboard architecture | No evidence justifies replacing the working compiled fitter, frontier or provenance mapping. Existing layered ownership remains useful. |

A provisional flow is: DOM handlers and codecs produce a complete slice;
exact target replacement applies it through the canonical fitter in one atomic
update. Copy selects visible content, applies export policy and uses the shared
host writer. Detailed dispatch order, policy composition, root ownership and
cost must be resolved and measured by the design task.

## Coverage: 10 of 10 census groups

| Group | Disposition |
| --- | --- |
| `browser/clipboard` | Keep native and synthetic browser contracts; assertions inspected, no browser replay. |
| `example/plite/paste-html` | Keep as a raw editor consumer of host interpretation; setup and paste job inspected. |
| `example/plite/paste-html-import` | Keep example-level HTML conversion; fresh closed output does not require an existing slice's roots. |
| `plitejs/core/content-slice` | Change candidate: preserve complete slice meaning during rewrites; retain the slice abstraction. |
| `plitejs/core/get-content-slice` | Keep schema-aware extraction, openness and transitive root collection; apply export policy above extraction. |
| `plitejs/core/get-fragment` | Keep the node-array query for its consumer job; it is not complete interchange. |
| `plitejs/core/slice-fit` | Keep one compiled engine, frontier and provenance mapping; no measured replacement case. |
| `plitejs/react/editable/clipboard-input-strategy` | Keep host event routing, exact view targeting and drag/cut intent; converge downstream interpretation. |
| `plitejs/react/editable/projected-clipboard` | Keep visible extraction and writer delegation; apply export policy consistently and consider sharing private slice-join mechanics. |
| `plitejs/react/editable/runtime-clipboard-events` | Keep mounted event/lifecycle ownership; no independent public owner is justified. |

Additional consumers inspected: canonical DOM insertion/export, cross-editor
drag, table rectangular and single-cell transfer, static selected content,
format conversion boundaries and diff export middleware. Two bounded read-only
worker reviews covered Plate adapters and mounted/DOM behavior; their findings
were reconciled against source in this decision.

## History

This is the initial clipboard record. The historical
[clipboard command decision](clipboard-and-delete-commands-need-explicit-lanes.md),
[serialization plan](../../plans/2026-05-23-plite-clipboard-fragment-serialization-ralplan.md)
and [static payload ownership plan](../../plans/2026-07-03-plate-next-static-clipboard-payload-owner.md)
provide context. Their preference for model/DOM/view/product ownership survives
current inspection. Their old paths and proof receipts do not establish current
behavior. The neighboring native-input review supplies context; its verdict
is not inherited by clipboard.

## Proof and limits

Evidence: [probe](../../plans/artifacts/clipboard-root-preservation-probe.ts)
and [four observations](../../plans/artifacts/clipboard-root-preservation-results.json).
Run `bun docs/plans/artifacts/clipboard-root-preservation-probe.ts` from the
repository root. It imports live source and calls public APIs. A first attempt
used the test-only preload outside a test runner and failed before executing
the probe; the direct source import is the corrected command.

241 existing tests passed across 10 files: 87 core slice/fitting tests in six
files, 98 clipboard and DOM boundary tests in two files, 11 projected clipboard
tests and 45 projected command tests. Exact commands and captured output are in
[the proof receipt](../../plans/artifacts/clipboard-review-proof.md).

Passing baseline tests do not establish the newly identified combinations.
No actual browser, native/device, Plate package or performance replay is
claimed. Before accepting runtime changes, compare the frozen current and
proposed paths with representative slice sizes and root counts. Adoption proof
must cover handler replacement data and codecs, projected export policy,
insertion rejection without deletion, root-bearing table/static transfer,
repeated destination copies, cut failure and undo/redo.

The downstream task must apply public API doctrine repair if contracts change.
This read-only review does not change doctrine or product code.

## Recovered execution history

The [feature hub](../features/clipboard.md) links the recovered plan outcomes,
including completed work and rejected experiments. These imports preserve
reported completion with **unknown current proof**: their full original
source/runner/result binding is not recovered. Their recovery date does not
assert that every historical plan ran after the latest review. The plan owns
its lifecycle; these accounts do not reopen unrelated architectural decisions
or authorize repeating completed work. Current review and proof limits above
remain question-specific.
