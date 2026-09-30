---
title: HTML conversion and static rendering
type: decision
status: accepted
updated: 2026-09-30
review_scope: html
current_review: 2026-09-30-content-root-locations-adoption-review
reconciled_executions:
  - 2026-09-29-static-document-rendering-execution
  - 2026-09-30-static-preview-proportional-cost-execution
  - 2026-09-30-content-root-locations-design
  - 2026-09-30-content-root-locations-execution
  - 2026-09-30-content-root-locations-closure
related:
  - conversion-boundary.md
  - ../../plans/2026-09-30-content-root-locations.md
---

# HTML conversion and static rendering

Retain the adopted immutable document reader, explicit conversion loss
accounting and static reuse described in [conversion boundary ownership](conversion-boundary.md).
The [content-root review](../review-records/2026-09-30-static-preview-next-content-roots.json)
selected content-root context as the next bounded job.

The [content-root design](../../plans/2026-09-30-content-root-locations.md)
is [adopted locally](../../plans/2026-09-30-content-root-locations-execution.md). It uses the existing scoped editor for render and
decoration callbacks, corrects view composition and privately reuses readers
in the static cache. Known-path feature presentation avoids unnecessary
indexing.

The [adoption review](../review-records/2026-09-30-content-root-locations-adoption-review.json)
retains that architecture and reopens completion at a bounded correctness
gap. The private static root cache captures authored policy at construction
but does not reconcile a later source-mode change. Executed helper and
`EditorStatic` server-render probes keep a caption's proposed “Foot draft”
after its owner switches to accepted mode; a fresh accepted reader/render
returns “Foot”. Reuse must include the current semantic binding.

The [closure](../review-records/2026-09-30-content-root-locations-closure.json) repairs that gap: a static root reader is replaced when
the rendering view's authored mode or read-only state changes and is reused
otherwise. The retained render context restores owner decoration sources, and
Yjs root admission has public-API regression coverage. In Chromium, the S5
static and AI cells against a hash-verified pre-change baseline pass the
matrix's no-regression checks with identical final text; ai-rich profile
attribution stays inconclusive under the unchanged rule, and its trace checks
pass. The matrix's speedup gate does not apply to this correctness work.

The [last-pass review](../review-records/2026-09-30-content-root-locations-last-pass.json)
retains that target and ends design iteration. Vision already fixes the
location law: a path carries no root and a view addresses its own root. The
defects are view-composition and delivery bugs, not a missing API. Execution
starts with view derivation. Shipped preview copy reaches it from a
non-primary root of a supplied document, and AI comment ranges would for blocks
in another named root. Export derives from the model editor and is unaffected.
Known-path table and
list presentation lands
independently; its job is the measured main-root streaming index cost. No
shipped Plate feature declares an owned content root yet, so static
content-root delivery and decoration root admission stay small correctness
repairs.

The [agreement check](../review-records/2026-09-30-content-root-locations-agreement.json)
retains that execution order and corrects the authored-policy claim.
`EditorRoot` already reads and forwards its source's authored policy; a reset
to direct editing at every automatic mount is not established. Initial mode
and later parent-mode changes need the focused mounted-root check. Borrow
required policy and source definitions while keeping focus, selection,
decoration managers and observers independent. Owner lookups in discussion
and retained-fragment creation are deletion candidates only after preserving
their per-runtime cache and fragment-binding semantics. A narrow decoration
census includes rootless canonical inputs, whose implicit primary root must
not be reinterpreted as the emitting reader's root.

The earlier browser evidence retains its declared source and sampling limits,
including the disclosed pp4 attribution guard adjustment. The original pp4
summary is two passing and two inconclusive cells. Its post-hoc 1.25 guard
does not establish a pass against the frozen 1.20 guard. Root admission,
automatic live owned-root inheritance and structural reuse have named execution
gates. HTML multi-block list flattening, table list properties and subtree
accounting remain separate fidelity limits. No universal codec, location
carrier or new view manager is selected.
