---
title: Table selection and mounted interaction ownership
type: decision
status: accepted
updated: 2026-09-18
review_scope: table
current_review: 2026-09-17-table-host-delivery-benchmark-closure
review_history:
  - ../review-records/2026-09-16-table-canonical-edits.json
  - ../review-records/2026-09-17-table-public-contract-final-pass.json
  - ../review-records/2026-09-17-table-canonical-api-implementation.json
  - ../review-records/2026-09-17-table-canonical-api-closure.json
  - ../review-records/2026-09-17-table-substrate-ownership.json
  - ../review-records/2026-09-17-table-direction-model-revalidation.json
  - ../review-records/2026-09-17-table-host-projection-design.json
  - ../review-records/2026-09-17-table-host-projection-final-design.json
  - ../review-records/2026-09-17-table-host-delivery-model-revalidation.json
  - ../review-records/2026-09-17-table-host-delivery-benchmark-closure.json
source_refs:
  - ../../plans/2026-09-17-table-selection-host-projection-design.md
  - ../../plans/artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json
  - ../../../packages/platejs/src/react/features/table/TablePlugin.tsx
  - ../../../packages/platejs/src/react/features/table/tableSelectionHostBinding.internal.ts
  - ../../../apps/www/src/registry/components/editor/table.tsx
related:
  - ../reviews.md#table
  - ../../plans/2026-09-17-table-api-design.md
reconciled_executions:
  - 2026-09-18-table-edge-paste-regression
  - 2026-09-18-table-strict-mode-execution-recovery
  - 2026-09-18-recovered-2026-05-18-plite-table-transform-boundary-ralplan
  - 2026-09-18-recovered-2026-07-23-flatten-table-plugin-commands
  - 2026-09-18-recovered-2026-07-23-table-test-family-colocation
  - 2026-09-18-recovered-2026-08-03-hard-cut-table-cell-header-plugin
  - 2026-09-18-recovered-2026-08-17-hard-cut-table-renderer-hooks
  - 2026-09-18-recovered-2026-08-26-ignore-table-resize-handles-during-cell-selection-drag
  - 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit
  - 2026-09-18-recovered-2026-09-07-table-resize-ownership
  - 2026-09-18-recovered-2026-09-17-table-api-design
  - 2026-09-18-recovered-2026-09-17-table-direction-model-revalidation
  - 2026-09-18-recovered-2026-09-17-table-host-delivery-benchmark
  - 2026-09-18-recovered-2026-09-17-table-selection-host-projection-design
  - 2026-09-18-recovered-5064-fix-homepage-table-grid-enter-crash
  - 2026-09-18-recovered-5065-fix-table-tab-navigation
---

# Table selection and mounted interaction ownership

**Keep table semantics in Plate. `TablePlugin` owns one private selection
projection per mounted view and binds it directly to canonical cell hosts. The
public painter hook and copied row/table overlay owner are deleted. Add no Plite
table marker, public selection API or generic scalar host channel.**

The `2026-09-18-table-edge-paste-regression` execution also closes structural
paste geometry at the Plate table owner. Edge expansion updates table
`columnWidths` with the same internal policy as explicit column insertion.
Current-source package and Chromium proof covers complete bottom-right paste,
usable rendered widths, exact pasted-cell selection and follow-up input. This
does not change the selected host projection or add a public API.

| Responsibility | Decision |
| --- | --- |
| Implicit table selection reads | Use the canonical table snapshot; preserve explicit targets and transaction drafts. |
| Authored snapshot/root scope | Use the Plite view wrapper that scopes snapshot and root reads together. |
| Range and exact-node paint | One private `TablePlugin` projection. Ranges retain span closure; exact cells/rows/tables stay exact, including mixed tables. |
| Host delivery | Compose a private binding into the existing canonical `TableCellPlugin` host ref. Update only affected keys and clean replacement, detach and unmount. |
| Public React attributes | Preserve complete `render.useViewElementAttributes` snapshots and custom-component prop semantics. |
| Public painter and copied overlay context | Delete. Applications install `TablePlugin`; custom cells only forward `props.attributes` and its ref once to `<td>` or `<th>`. |
| Generic scalar host channel or Plite markers | Reject. The private owner passes scale and native proof, so no independent public job remains. |
| Resize | Retain existing math, pointer and commit owners. Accessibility and hit-target work remain independent. |

The final no-GC owner probe compares the repaired painter, explicit scalar
channel and private binder over 30 interleaved packets per cohort. The binder
passes every budget with zero selection-induced cell renders and table scans,
and is fastest in the 32-table fanout row. Production Chromium also passes every
paint and mount budget. Final selection p95 is 17.9ms/210.6ms/1819.6ms for
normal/large/stress versus 18.4ms/218.8ms/2537.5ms baseline. Mount packet-p95 is
28.4ms/459.2ms/1817.0ms versus 25.3ms/392.6ms/1871.3ms baseline; all ten final
stress mount pairs pass.

Native held-drag, contraction, sparse cell paint, clipboard, resize interference,
subscriptions, undo/redo and deferred large layout pass 14/14 in Chromium. The
focused host contract covers same-key `td` to `th`, old-host cleanup, unmount
cleanup and caret restoration. The copied UI uses the cell marker as its sole
selection layer.

The host map assumes one canonical host per node key in one mounted view. A
custom cell that omits or duplicates the supplied ref violates the component
contract. Mount evidence is a distribution of per-process packet p95 values
because raw remount samples were not serialized. Broad package typecheck remains
blocked by unrelated authored TS6307 project-file-list errors. No physical-device,
publication or release claim is made.

The September 18 [execution checkpoint](../../plans/2026-09-17-table-selection-host-projection-design.md#2026-09-18-repair-cleanup)
repairs Strict Mode cleanup within the same private owner. It records 37 Table
React cases, three copied-UI cases, four Chromium cases and an actual Chrome
interaction. Two deletion experiments broke imperative selection painting and
were rejected. The cleanup reuses the ordinary empty-selection update and
retains the necessary command/model bridge; it does not reopen topology or
resize. Its source-hash and screenshot artifacts are linked from the plan.

These are dated outcomes. The history migration does not rerun browser or
performance proof; lookup exposes matching, stale or missing inputs separately.
No additional host-delivery redesign is justified by this checkpoint. Resize
ergonomics, physical-device coverage and unrelated mutation policy remain
separate questions.

## Recovered execution history

The [feature hub](../features/table.md) links the recovered plan outcomes,
including completed work and rejected experiments. These imports preserve
reported completion with **unknown current proof**: their full original
source/runner/result binding is not recovered. Their recovery date does not
assert that every historical plan ran after the latest review. The plan owns
its lifecycle; these accounts do not reopen unrelated architectural decisions
or authorize repeating completed work. Current review and proof limits above
remain question-specific.
