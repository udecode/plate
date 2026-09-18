---
title: Comments data ownership
type: decision
status: accepted
updated: 2026-09-18
review_scope: comments
current_review: 2026-09-18-comments-attachment-design-gate
reconciled_executions:
  - 2026-09-18-comments-attachment-design-partial
  - 2026-09-18-comments-canonical-provenance-analysis
  - 2026-09-18-comments-attachment-design-complete
  - 2026-09-18-comments-attachment-discovery-implementation
review_history:
  - ../review-records/2026-09-04-comments-ownership.json
  - ../review-records/2026-09-05-comments-execution.json
  - ../review-records/2026-09-09-comments-package-data.json
  - ../review-records/2026-09-16-comments-anchor-deletion-history.json
  - ../review-records/2026-09-16-comments-history-api-design.json
  - ../review-records/2026-09-16-comments-history-api-last-pass.json
  - ../review-records/2026-09-17-comments-mounted-view-ownership.json
  - ../review-records/2026-09-18-comments-attachment-and-discovery.json
  - ../review-records/2026-09-18-comments-attachment-design-gate.json
source_refs:
  - ../../plans/2026-09-09-comments-package-data.md
  - ../../plans/2026-09-16-comments-history-api.md
  - ../../plans/2026-09-18-comments-attachment-discovery.md
related:
  - ../reviews.md#comments
---

# Comments data ownership

The Comments package owns serializable thread records, editor binding,
range mapping, subscriptions and disposal. Applications own database I/O,
authentication and authorization. Copied UI owns presentation.

[BaseCommentsPlugin](../../../packages/platejs/src/features/comments/BaseCommentsPlugin.ts)
declares immutable semantic `CommentThread` records and private native anchors.
`attachment(id)` projects the live location. `initialComments` loads a versioned
`CommentsJSON` envelope, and `api.toJSON()` saves published threads with opaque
ranges for the exact accompanying document revision. Thread subscriptions
observe semantic writes; attachment subscriptions observe document mapping.

The September 4 audit retained application-owned thread data while cutting
duplicate activation and suggestion lifecycle. The September 9 user request
changed that constraint and selected package-owned data integration. Preserve
both reviews: the earlier conclusion is evidence about its requirements, not
a veto on the current boundary. Comments remains the conversation owner;
native authored changes has a separate pending-edit job.

The September 16 design keeps published conversations when their source text
is deleted and keeps resolution independent of document undo. It supersedes
the earlier same-day proposal for a mandatory activity log: the observed
open/resolved comments panel does not require a second runtime history store.
Current-state conversations, native document history, and authored review
provenance retain their own authorities.

The final accepted plan cuts a generic editor checkpoint, mandatory activity
log and live `setThreads` replacement. Ordinary reload creates a fresh editor
with fresh local undo. Version previews join the selected historical document
and saved targets with application-selected conversation records; unavailable
targets remain discussions without a painted range. Applications own revision
identity, persistence, authorization, concurrent-write policy and retention.

Every durable mutation awaits `initialState.mutate` before publishing a canonical
thread. Per-thread queues preserve invocation order; retirement fences pending
results. Local drafts remain private until publication. Resolution stores actor
and time and reverses through Reopen outside document undo. Accepting or rejecting
a suggestion remains an atomic document-history operation; its conversations
survive the decision and undo/redo.

Execution exposed an additional ownership error: model-bound attachment and
block indexes cannot paint independently projected mounted views. The selected
repair retains one native target and resolves it in the requested view through
the existing anchor handle. Native annotation stores observe that view;
Comments keeps only derived per-view indexes. Input ranges belong to the
calling editor, while durable records, queues and anchor lifetime remain
shared. Serialization/rebinding on each view and semantic writes to force a
repaint are rejected. The execution plan retains the reproduced five-to-four
discussion failure alongside passing two-view contracts and the final browser
replay.

The [execution plan](../../plans/2026-09-16-comments-history-api.md) owns current
adoption and proof. The original failed serialization probe, passing design
prototype, and production timing result are preserved independently. Final
production serialization passes all 16 cases; browser proof passes 30 comment
cases and four AI publication cases. Authored migration admission is captured
as a private installed capability, so core remains independent and canonical
Plite and Plate package typechecks pass. Persisted local undo,
changed-baseline Yjs target transport, non-text targets and full Google Docs
parity remain separate unsupported jobs.

## Attachment and discovery reassessment

The September 18 review pursues two repairs while retaining the conversation
and native-target ownership split. It supersedes the earlier UI acceptance:
`discussion.tsx` keeps unavailable range comments at their previous block
indices, even clamping those indices to a different block after removal.
The component and browser tests explicitly expect this placement. A missing
target must remove the thread from live block counts; it must not remove the
conversation.

The [source probe](../../plans/artifacts/comments-history-api/deleted-target-retyping-2026-09-18.json)
also exposes a native discrepancy. Commenting on `lph` in `Alpha Beta`, deleting
that range, then inserting `NEW` in a separate transaction leaves an ordinary
anchor unavailable. With Authored installed in its default editing/accepted
view, the same comment attaches to `NEW`. Filtering unavailable UI alone cannot
prevent this. Plite's retained range owner must distinguish later unrelated
typing from intentional replacement and exact undo recovery. Switching every
comment anchor to `drop` would lose the ordinary recovery contract.

The selected product direction is an on-demand **All comments** dialog
using the same published records and thread cards. It gives
unavailable and resolved threads a location-independent discovery path, while
live per-block Floating Discussion stays intact. Remove the stale-placement
fallback and the always-mounted unavailable-thread list below the editor.
Do not restore the removed sidebar or mode switch, add a history plugin, or
copy anchors into another store. Existing `attachment()` and subscription
contracts suffice for this job. Keep neutral unavailable wording: an absent
range can also mean a hidden projection or a missing historical target.

The [design plan](../../plans/2026-09-18-comments-attachment-discovery.md)
specifies a lazy dialog in the existing comment-toolbar item, All/Open/Resolved
filters and 20-card pages. It removes duplicate demo feeds and the conversation
card's range-only target label. A private exact-view row owns target status and
navigation. Existing Comments snapshot and keyed subscriptions are sufficient;
the pure list projection passes through 10,000 records. The completed
implementation proves mounted UI, focus, failed-input retention and both
supported copied-component providers.

The native runtime design is selected. Extend the existing private
`AuthoredIndex` with immutable operation-local successor facts and resolve them
against live postings in the exact accepted, proposed or markup positions root.
The serialized range keeps only its original origin intervals. Weak caches are
owned by immutable authored state and positions identities; range handles gain
no frontier, history or subscription state. Separate updates never inherit
merely because document undo groups them.

Public revert carries the semantic positions already computed by
`prepareAuthoredRevert` into native capture. Restored spans preserve content
origin/offset while fresh birth/placement metadata owns the revert
contribution. This closes saved-history partial restoration without text
matching or a codec change. The canonical prototype passes 54/54 selected
correctness cases and all frozen cold, count, depth and relative scale gates.
Ten thousand shared targets stay below 90 ms p95 across the changed behavior
cohorts; 10,000 distinct targets take 93 ms cold and 64 ms p95. Product code,
existing suites and browser proof are closed by the implementation outcome.

The [completed design outcome](../review-records/2026-09-18-comments-attachment-design-complete.json)
reconciles the accepted design with the governing deferred review. It supersedes
the partial runtime recommendation while preserving every rejected candidate
and source-bound failure receipt. The later implementation outcome owns
production adoption and browser verification.

The [source-only continuation](../review-records/2026-09-18-comments-canonical-provenance-analysis.json)
identified existing native capture's `afterPositions` input as the restoration
handoff. The user explicitly resumed the work after the original three-trial
cap. The materially different shared-index candidate then proved scalable
succession and complete selected recovery without reopening the rejected
per-read or per-binding designs.

The final ordinary replacement prototype passes 27/27 focused cases and 36/36
existing history cases. It computes replacement runs once per change and uses
binary intersection queries. Seven of eight timing cohorts pass, but the
100-target fragmented case exceeds its frozen limit. Host contention and the
baseline's incorrect lost targets limit causal attribution; the result remains
inconclusive as design evidence. The unchanged production implementation rerun
in isolation passes that cohort at 37.19 ms p95 against the 78.38 ms limit.

Preserve the previous production receipts without treating them as proof of
these corrected expectations. The Google Docs observation establishes
deleted-target suggestion entries in All comments; it did not replay ordinary
comment deletion, boundary replacement or every pending-deletion/history
transition.

## Implementation closure

The [implementation outcome](../review-records/2026-09-18-comments-attachment-discovery-implementation.json)
records production adoption. Plite's existing authored index owns successor
lineage and exact-projection live postings; ordinary anchors use operation-local
replacement runs in their existing mapper. Complete deletion removes inline
paint and block counts, unrelated later typing stays unavailable, and exact
undo/redo restores target identity.

Copied UI removes remembered and clamped placement and supplies one lazy **All
comments** dialog with All/Open/Resolved filters, 20-thread pages, current-view
navigation and dirty/pending interaction guards. Comments remains independent
of Suggestions and generic Editor. Focused source and component tests, the full
Chromium comment specification, clean Base/Radix installs, website typechecking
and the isolated production benchmark pass. Per-thread message rendering,
changed-baseline Yjs transport, persisted browser undo and non-text targets
remain separate jobs.

[History and proof entry points](../reviews.md#comments) retain the earlier
audit, execution and adoption records alongside this correction.
