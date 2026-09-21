---
title: Anchors, annotations and inline paint ownership
type: decision
status: implemented
updated: 2026-09-21
review_scope: annotations
current_review: 2026-09-21-annotations-oss-validation
reconciled_executions:
  - 2026-09-18-recovered-2026-08-23-unify-plite-selection-anchors
  - 2026-09-21-annotations-architecture-adoption
review_history:
  - ../review-records/2026-09-20-annotations-contract-and-consumers.json
  - ../review-records/2026-09-21-annotations-final-pass.json
  - ../review-records/2026-09-21-annotations-oss-validation.json
source_refs:
  - ../../../packages/plitejs/src/core/anchor.ts
  - ../../../packages/plitejs/src/annotations/store.ts
  - ../../../packages/plitejs/src/interfaces/decoration.ts
related:
  - ../features/annotations.md
  - ../features/comments.md
---

# Anchors, annotations and inline paint ownership

Status: Complete

**Pursue one model with an exact-view index per mounted view, terminal local
`drop` semantics, and the smallest borrowed/read-only annotation API. Keep
anchor, application record, annotation index and decoration paint as separate
owners.** These findings justify design and adoption work. A matched scale run
must select the private mapping kernel before any performance-superiority claim.

The adopted execution makes local `drop` terminal across ordinary and authored
anchors while preserving projection-local temporary absence and `nearest`
history recovery. Annotation inputs are resolve-only, React readers take an
explicit typed store, headless owners retain explicit disposal, diagnostics are
internal, and the generic provider is gone. Comment mode mounts two exact views
over one model. The matched 1/2/4-view and 1k/10k/100k benchmark rejected every
private replacement, so production keeps the current node-key mapping kernel.

Implementation proof corrected one review overclaim: the document model owns
one active canonical selection. Mounted views own focus, read-only policy,
projection, annotation index and paint; inactive panes suppress the active
model selection in their UI. This consumer does not justify parallel retained
selection state.

The required job is to retain a logical location across edits, expose it in
independent views, and optionally paint it, without making application records
part of document history. One transaction's temporary tracker, a retained target,
an externally owned annotation collection and inline paint have different
lifetimes. The strongest useful cut is the redundant document and mirror-anchor
machinery in the consumer, not the neutral indexing capability.

## Audit acceptance

- [x] Reconcile historical anchor, annotation and comments decisions with live source.
- [x] Inspect all six inventoried source groups and the shared core/React contracts they depend on.
- [x] Compare deletion, merger, changed APIs and replacement ownership for persistent targets, annotation records/lifetime, async results and inline paint.
- [x] Give each bounded unit a verdict, including evidence and proof limits.
- [x] Record the review in the canonical ledger and validate its generated views.

Expected semantic units: **6**. Reviewed: **6**. Excluded within that manifest:
**0**. Unresolved verdicts: **0**. Four Pursue and two Stop. The six ledger
source groups are also covered: annotations implementation and subpath,
decoration source and context, persistent-anchor example, and async-decoration
example. The comment-mode consumer and native anchor dependencies extend the
evidence boundary without absorbing the separate Comments feature review.

| Unit                                         | Verdict                       | Evidence and consequence                                                                                                                                                                                                                                                       | Next owner                     |
| -------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Persistent versus transaction-scoped anchors | Stop merging lifetimes        | `editor.anchor` and `tx.anchor` share native construction; the transaction releases its tracker and rejects later reads. Media promises, AI drafts and cursor bindings require explicit longer ownership. Static coordinates and NodeKey do not replace offset tracking.       | None                           |
| Range deletion, recovery and saved targets   | Pursue                        | The same public `drop` range collapses under ordinary mapping but becomes unavailable and revives through Authored undo. Make deletion terminal in both engines. Keep exact history recovery on `nearest`; do not revive dropped identity from equal later text.               | Task design plan, Plite owner  |
| Annotation collection and public surface     | Pursue a hard trim            | Keep the headless exact-view index used across the Plite/Plate package boundary. Borrowed inputs need only `resolve`; React readers do not own disposal; metrics/status/retry and the generic provider context lack independent public jobs.                                   | Same Task, API and adoption    |
| Two-pane comment-mode topology               | Pursue                        | Two independent models, JSON value copies, selection clearing and `mirrorAnchor` reconstruction implement a same-document view job already supported by EditorRoot.                                                                                                            | Same Task, consumer adoption   |
| Derived and delayed inline paint             | Stop merging into annotations | Async example reads current text and delays a scalar eligibility value. It owns no service-range identity requiring an annotation store. Decoration owns safe attributes, per-node publication and source observation.                                                         | None                           |
| React ownership of retained anchors          | Pursue                        | Persistent example creates an anchor inside a state updater and lacks an anchor unmount cleanup. Comment-mode allocates/releases mirror anchors and releases removed targets inside updaters. Resource work must have an explicit owner outside replayable state calculations. | Same Task, focused React proof |

## Final external validation

The September 21 OSS pass compared the current source of ProseMirror, Lexical,
CKEditor, CodeMirror, Monaco/VS Code, Yjs, Automerge and Quill, plus the public
Tiptap Comments contract. The full source ledger and exact references are in
[the research report](../../plite/research/2026-09-21-annotation-architecture-oss/REPORT.md).

The ownership direction survives the comparison. No candidate combines the
required jobs more cleanly:

- ProseMirror and CodeMirror have strong persistent range collections, but
  their decoration values combine mapped range and paint.
- CKEditor validates one model with projection-local mappers, then shows the
  cost of a live observer per marker and global marker scans. Its source warns
  callers to keep few markers.
- Monaco validates one model attached to multiple editors and supplies a strong
  interval-tree implementation, but model-decoration invalidation is coarser
  and complete deletion preserves collapsed/moved decoration identity.
- Lexical, Automerge and Tiptap demonstrate document-resident attachment marks.
  That choice puts target identity in document serialization and history, which
  conflicts with Plate Comments' external thread ownership.
- Yjs and Automerge prove that collaborative cursors naturally move toward a
  surviving boundary. Yjs also proves that local undo lineage can resolve an
  anchor differently from a synchronized clone.

The last point narrows `drop`; it does not justify renaming it or adding a third
policy. Current Comments targets use `nearest`. Current `drop` callers are
transient operation, AI, combobox and awareness targets that need local terminal
invalidation. Do not document `drop` as a convergent persisted CRDT target. A
future exact-but-temporarily-unavailable collaborative target must arrive with a
current consumer and explicit replicated lifetime state.

The external source does change the performance plan. Current Plite already has
central changed-`NodeKey` anchor routing, candidate-ID refresh and per-node paint
buckets. Do not replace that with a `RangeSet` or interval tree by analogy.
Benchmark these private candidates behind the existing scalar `resolve(view)`
contract:

1. the current node-key baseline;
2. native batched resolution grouped by backend/root/node, following current Yjs;
3. a throwaway chunked or interval collection candidate;
4. the current persistent snapshot trie against a simpler immutable snapshot.

Run one, two and four mounted views with 1k, 10k and 100k dense and distributed
annotations. Cover a local edit, full deletion, structural move, activation,
projection switch, scroll/remount and unmount. Measure visited anchors, target
resolutions, source visits, dirty buckets, subscriber wakes, allocations,
retained heap, update p50/p95, React renders and DOM commits. Keep a new kernel
only for a material matched win with identical behavior.

## The largest supported cut

[CommentModeExample](<../../../apps/www/src/app/(app)/examples/plite/_examples/comment-mode.tsx:609>)
creates two models. Its writer callback replaces the reviewer's complete value,
clears its selection, walks all comments and recreates each mirror anchor.
The component describes the reviewer as a read-only view of the same document;
there is no transport or independent revision requirement in this consumer.

The proposed ownership flow reuses existing capabilities:

```text
one document model
  -> editable writer view + read-only reviewer view
one comment-owned native anchor
  -> resolve(writer view) + resolve(reviewer view)
  -> per-view annotation index
  -> feature decoration / comment UI
```

Delete the second model, `mirrorAnchor`, repeated value cloning/replacement,
duplicate annotation source construction and writer-to-reviewer synchronization.
Keep mounted-view focus, read-only policy and annotation indexes. The one active
model selection is shown only by its focused pane.
Use the mounted view from its existing provider for view-bound work. The current
shared-anchor contract and EditorRoot implementation support this direction;
the migrated interaction has not been executed or benchmarked.

## Public deletion policy is inconsistent

The [public-call probe](../../plans/artifacts/annotations-review/deletion-probe.ts)
creates an inward range over `lph` in `Alpha Beta`, deletes that exact text, then
undoes and redoes. Only installation of Authored differs:

| Policy    | Ordinary: after delete / undo         | Authored: after delete / undo         |
| --------- | ------------------------------------- | ------------------------------------- |
| `drop`    | collapsed at 1 / collapsed at 4       | `null` / exact original range `[1,4]` |
| `nearest` | collapsed at 1 / exact original range | collapsed at 1 / exact original range |

Both return `null` permanently after release. The
[retained result](../../plans/artifacts/annotations-review/deletion-result.json)
contains all four traces, including redo. This is observed current behavior,
not a failing test manufactured for a preferred implementation.

`createAnchor` selects an authored binding when available. The ordinary mapper
tracks endpoints and enrolls only `nearest` in exact history recovery; the
authored binding retains content origin identity. The public docs say `drop`
becomes null and cannot revive through undo, so they describe neither result
fully for this example. The suite passes because its two families encode the
different behaviors.

The stronger target gives `drop` its existing public meaning: deletion
permanently invalidates the target. Ordinary complete-range deletion must
resolve to `null` instead of a collapsed range. Authored undo must not revive a
dropped binding. `nearest` remains the policy for a surviving fallback and
exact saved-history recovery. `release` remains explicit owner disposal; it is
a different terminal cause from target deletion.

Renaming `drop` to a temporary fallback such as `none` and reviving exact
identity through undo is a coherent additional design, but no current consumer
requires that third policy. AI preview targets, remote cursor endpoints and
operation-local path anchors use `drop` for invalidation. Comments already use
`nearest`. Do not widen the contract before a current job needs recoverable
absence. Design must still prove the terminal law across path, point, range,
saved/restore and transaction users. Do not add a backend flag, second anchor
engine, or per-feature undo bookkeeping.

The existing `nearest` recovery and Comments retained-content succession remain
settled. Unrelated later typing must not inherit deleted targets; operation-local
replacement, exact undo and projected visibility keep their existing laws.

## Why retain the annotation and decoration boundaries

`AnnotationStore` does not own a second target. It calls a borrowed target's
`resolve(editor)`, maintains identity/node indexes, and releases subscriptions
without releasing the target. Native handles alone do not supply collection
membership, metadata equality, keyed readers or external invalidation. Plate
Comments is a current cross-package consumer through
`plitejs/annotations`; moving the index into Comments would move Plite view and
projection machinery into the product layer.

The engine earns its headless boundary. Its current public shape does not.
`AnnotationAnchor` requires `release`, although the index only calls `resolve`;
that falsely grants lifecycle authority and burdens service adapters. The React
hook returns the same interface as the headless owner, including `destroy`,
`retry`, status and metrics. React owns activation and disposal itself.

Keep `useAnnotationStore` because its commit-safe activation, Strict Mode
cleanup and source publication are real React lifecycle work. Return only the
reader and invalidation capabilities that React consumers own. Keep explicit
headless disposal on `createAnnotationStore`. Make explicit `refresh` the
recovery path after a corrected source rather than exposing a second `retry`
verb. Keep metrics as test/benchmark instrumentation and remove public status
unless a product caller appears.

`AnnotationProvider` has only tests and examples as consumers, erases `TData`
through one untyped context, casts it back in readers and silently returns empty
state when no provider exists. Delete the generic provider and the implicit
hook fallback. Explicit-store `useAnnotation` and `useAnnotations` preserve
inference; an application with deep domain UI can own a typed context. Require
unique annotation IDs and keep invalid input distinct from quarantined source
or resolution failures.

Decoration has a separate render contract: keyed ranges, safe attributes and
external observation. Persisting paint as nodes, making all paint allocate
anchors, or making Annotation own appearance would mix those jobs. The private
decoration manager/context is not another public store API. No new overlay,
Widget carrier or generic asynchronous task primitive is justified.

Do not demote the whole index to a private Comments implementation. That cut
loses a truthful Plite/Plate package boundary and would likely replace it with a
more generic public mapped-range primitive. The useful hard cut is the unearned
surface around the index, not the index itself.

## Historical reconciliation

The April 28/30 and May 18 plans retain the distinctions between semantic ranges,
paint and explicit owner lifetime. Their Widget and older Plite-prefixed teaching
is superseded by later view work. Preserve their implementation accounts rather
than classifying every planning-era file as unexecuted.

The August 23 scoped-anchor implementation and September 12 selection review
remain correct about distinct lifetimes. The recovered August execution remains
historical-unbound. The September 3 comment/history plan supplies the earlier
drop non-resurrection law; it does not settle the newly observed cross-backend
contract and its original closure status is not rewritten here.

The September 18 Comments design-complete and implementation outcomes supersede
the earlier provisional runtime recommendation. Shared immutable successor
lineage, exact-view projection and ordinary replacement mapping are implemented;
the earlier Defer summary does not make them open work again. Rejected per-read
ancestry and per-binding recovery remain counterevidence against those designs.

Current public [Anchor API](../../../content/docs/api/anchor.mdx) omits
save/restore and describes the intended terminal `drop` law that runtime does
not satisfy. The active annotations and decorations guides, navigation metadata
and reference copies still teach the removed Widget carrier. The annotations
guide also publishes the false `release` requirement and omits unique-ID,
quarantine and recovery rules. These are adoption findings, not reasons to
restore deleted APIs or rewrite accepted conversation ownership.
`docs/vision/plite.md` currently blesses `AnnotationProvider`; accepted adoption
must repair that doctrine and its generated worker teaching after the detailed
API is settled.

## Review proof and adopted execution

Executed: **107/107** core anchor, mapping, range, history and authored-anchor
cases; **64/64** annotation-store, decoration-manager and decoration-rendering
React cases. The public deletion probe also completed. Commands, raw logs and
source identities are retained in
[the audit proof](../../plans/artifacts/annotations-review/proof.json).

At review time no product code changed and no replacement runtime, browser
interaction or comparative performance was certified. That boundary remains in
the immutable review records.

Execution `2026-09-21-annotations-architecture-adoption` adopted the coupled
design and records current-source proof: 107 core anchor/history/authored cases,
68 React annotation/decoration cases, 55 Plate Comments cases, 8 focused browser
journeys, strict package/tooling proof and the full Chromium matrix with 748
passes and 7 declared skips. The production benchmark retained the baseline
with zero promotions and zero correctness failures. Firefox/WebKit, physical
devices, production deployment and replicated terminal absence remain outside
that proof.
