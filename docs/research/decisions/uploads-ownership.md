---
title: Upload lifetime and draft asset ownership
type: decision
status: proposed
updated: 2026-09-19
review_scope: uploads
current_review: 2026-09-19-uploads-node-model-correction
review_history:
  - ../review-records/2026-09-18-uploads-lifecycle-ownership.json
  - ../review-records/2026-09-19-uploads-node-model-correction.json
source_refs:
  - ../../../packages/platejs/src/features/media/lib/placeholder/BasePlaceholderPlugin.ts
  - ../../../packages/platejs/src/features/media/lib/BaseMediaPlugin.ts
  - ../../../apps/www/src/registry/components/editor/media-placeholder.tsx
  - ../../../apps/www/src/registry/components/editor/media.tsx
  - ../../../apps/www/src/registry/components/editor/dnd.tsx
related:
  - ../reviews.md#uploads
  - ../../vision/plate.md
  - clipboard-content-fitting.md
  - history-ownership.md
reconciled_executions:
  - 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit
---

# Upload lifetime and draft asset ownership

**Pursue redesigning the upload protocol, but do not delete the dedicated draft
asset state by default.** The prior review correctly found broken admission,
completion and lifetime authority, then overreached by blaming the separate
placeholder node. A reserved or retryable asset slot is a different document
state from completed media. Making `url` optional in every media schema would
spread that state across image, file, audio and video without removing it.

Keep one editor-owned upload capability. Submit each picker, paste or drop
selection as one validated batch, preserve the exact root-aware `NodeKey`
through completion, and use the installed media descriptor's persisted schema
identity. Task design must compare the exact draft-slot schema against a
per-media pending union; the dedicated slot is the stronger baseline. No generic
asynchronous-job framework earns its cost.

## User job and hard laws

A user chooses files, sees their reserved locations and progress, continues
editing, and can retry, cancel, undo, or remove an upload. Completion must affect
only the intended live node, including inside a secondary root. Invalid input
must leave the document unchanged. Invalid results must remain visible as
failures. React remounts cannot restart transport, and document identity must
survive movement without letting stale work modify a replacement node.

File objects, controllers, progress, errors, and preview URLs remain local
resources. Durable media content belongs to its media schema. Plite owns
transactions, node identity, roots, lifecycle and history; Plate owns file
admission and upload-to-media semantics; the application owns transport,
server policy and copied presentation.

## Current evidence

The [observation probe](../../plans/artifacts/2026-09-18-uploads-review/observations.test.ts)
records seven observations: five defects and two lifetime/restoration gaps.
Its assertions deliberately describe current behavior, not desired regression
behavior; its green result means those observations were reproduced.

1. **Rejected file paste deletes its empty source.** The clipboard command
   removes the current empty block before `insertMedia` validates. Validation
   returns a handled result and commits that removal with the error effect.
2. **A secondary-root upload can replace another node.** Lookup resolves the
   correct `NodeKey`, but completion passes `current[1]` to `replaceMedia`.
   That unqualified path resolves in the main root. With a placeholder at the
   same path, the wrong node receives the completed image.
3. **A rejected result URL loses its failure state.** `replaceMedia` returns
   without mutation when normalization rejects a nonempty URL. Completion
   nevertheless removes the upload task, leaving an unresolved placeholder
   with no retained error.
4. **Schema identity is confused with capability identity.** Overriding the
   image schema type to `photo` leaves completion writing `type: 'image'`.
   Schema validation rejects the replacement and the task enters an error state.
5. **The placeholder picker bypasses batch limits.** Its first file uses
   `api.upload`, then remaining files use `insertMedia`. A maximum of three
   images accepts four through that split. Remaining files also use current
   selection instead of an explicit destination beside the chosen placeholder.
6. **Full document replacement preserves old upload authority.** Replacing the
   document with equal pending content preserves the node key. The replacement
   emits the internal `document.replace` annotation without a document-change
   flag, and the old request can complete into that replacement. The design
   must distinguish updating content from starting another document lifetime.
7. **Partial-batch redo restores unfinished content without its resource.**
   Complete A, undo A+B, then redo: A returns completed; B returns as an empty
   placeholder, with no file, task, or restarted request. Ignoring B's old late
   result is correct. Whether B resumes, retains a retryable file, or becomes an
   explicitly empty slot needs an honest product contract.

The copied `DndKit` additionally calls `PlaceholderPlugin.update` without an
installed check, while its registry usage advertises standalone `DndKit`.
This is a source-established missing-capability path, not a replayed browser
claim. Validation and transport-error toasts also replay retained errors on
view mount; the errors are durable task state, not acknowledged notifications.

## Assessed units

Nine units expected, nine reviewed, zero excluded, zero unresolved verdicts.
Every current ledger member is included. Detailed contract design and missing
runtime proof remain explicit below.

| Unit | Verdict | Evidence and surviving owner |
| --- | --- | --- |
| Persisted draft slot and completion transition | **Keep the concept; redesign the contract** | Reserved position, restored documents, failure retry and an empty picker are draft-asset jobs. A dedicated slot keeps completed media schemas valid. Replace generic `placeholder` naming, ambiguous `mediaType` identity and caller-visible conversion plumbing; preserve a root-aware transition to the installed media schema. |
| File admission and batch API | **Pursue consolidation** | Direct upload and batch insertion use different count semantics; the picker combines them incorrectly. One Plate submission validates the whole selection before any document change or request. Preserve explicit app file policy. |
| Completion identity and result validation | **Pursue repair at the owner** | Root, schema override and invalid-URL probes fail. Use existing root-aware `NodeKey` operations and installed media identity; retain an error unless a valid result was applied or authority was revoked. |
| Request, progress and cancellation lifetime | **Pursue complete authority; keep the editor owner** | Preserve controllers, supersession and per-task subscriptions. Consume Plite's existing replacement annotation through public commit events, including equal-content replacement. Plugin removal cleanup exists; it does not prove editor-exit cancellation. Define termination at the real owning lifetime without tying requests to preview mounts. |
| Transactions and history | **Keep Plite authority; design unfinished restoration** | Uploads begin after commit, aborted updates start none, and completed insertion undo/redo passes. Skipped commits map both history branches. Partial-batch redo loses the unfinished resource; Plate owns its restoration policy. Do not revive upload-specific undo-stack rewriting or make history replay network requests. |
| Paste, native drop, DnD and picker entrypoints | **Pursue one admission path** | Adapters retain target capture and native-event handling, then submit one explicit batch. Remove caller-owned empty-block deletion and first/rest splitting. File drop must truthfully check installed upload capability. |
| Transport and provider integration | **Keep application ownership** | `MediaKit` supplies abort/progress transport; UploadThing router and route are copied source. No provider-specific upload state remains to promote into Plate. Live service behavior is unverified. |
| Preview, progress UI and notification presentation | **Keep copied rendering and view URLs** | Six current tests pass for remount/progress and object-URL cleanup. The draft slot needs explicit empty, uploading and failure presentation; shared upload state does not justify a package-owned styled component. |
| Public options, exports, installation and teaching | **Pursue adoption cleanup** | `disableEmptyPlaceholder` only starts a history batch; `disableFileDrop` enables an alternate handler. Media docs still teach removed image-upload options and inconsistent placeholder identity. Cut misleading options and obsolete teaching with the accepted API, preserving inferred transport, result and error contracts. |

## Strongest target and alternatives

Proposed ownership flow:

```text
picker / paste / drop
  -> one Plate batch admission and explicit target
  -> transaction inserts or fills dedicated draft asset slots
  -> afterCommit starts application transport
  -> validate result and recheck live request authority
  -> installed media owner replaces the same root-aware NodeKey
```

The document slot records durable draft intent, such as the target media kind;
it does not serialize `File`, progress, controller or transport status.
Reloading or receiving a slot from collaboration must not invent a request. Its
preview reads the local task when one exists and otherwise offers the explicit
empty or retry state. Do not introduce a public asset registry just to
correlate a file with a node.

Keeping the current design with configuration cannot repair these ownership
failures. Retaining the current generic `placeholder` API unchanged also keeps
capability names confused with persisted schema identities, split admission and
public conversion plumbing. Those are the cuts supported by the evidence.

Per-media pending nodes are weaker as the default target. They relax the
currently required `url` property in four completed-media schemas, force every
renderer and codec to understand a source-absent state, and still require one
cross-media upload owner. That moves the draft-state branch rather than deleting
it. A single generic media union would cut more nouns, but would also collapse
independent image, file, audio and video codec/rendering jobs without evidence.

A type-changing slot-to-media transition is not itself an ownership defect.
Plite's `NodeKey` supplies stable identity across that transition. The current
wrong-root bug occurs because completion throws away the key/root and writes by
bare path; the schema-override bug occurs because it writes a capability name
instead of the installed descriptor's schema type.

Waiting for upload completion before inserting anything removes placeholders,
but loses visible reserved position, movement, and undo while transport runs.
Keeping only a transient overlay similarly transfers placement and history
coordination to the view and does not preserve authored empty slots.

Moving requests back into React contradicts headless completion and the proven
remount law. Duplicating upload controllers across media plugins loses shared
batch admission. Moving a general job scheduler into Plite adds product policy
without solving the actual gap: the root failure occurs when Plate discards an
identity Plite already understands. Full document replacement is also an upload
consumer gap: public `on.commit` already exposes the `document.replace`
annotation, including equal-content replacement. Its descriptor is internal;
design should settle its supported typed access without inventing another
runtime signal. Reuse that existing authority; do not infer lifetime from node
keys or add a general session framework. `changed.has('document')` and
`changed.has('replace')` do not identify an equal-content replacement.

Retain one upload lifetime capability and one transport function. Its final
public name, draft-slot schema and submission shape belong to design. The
generic `PlaceholderPlugin`, direct single-file `api.upload` plus batch
`insertMedia` split, and caller-visible `replaceMedia` protocol do not earn
survival merely because a dedicated draft state does.

## Prior decisions and proof limits

The September 7 execution report moved transport from preview effects to the
headless package and retained app transport and view object URLs. Keep those
boundaries. Reopen its implied completeness for ingress, exact-target
completion and the separate placeholder representation. Its recovered ledger
record has unknown current proof; historical scale and browser claims are not
transferred to this review.

Issue 4803 preserves the real history requirement: undo/redo should act on
completed media without an intermediate upload step or a missing-batch crash.
Its old `updateUploadHistory` implementation is not the current owner. The
clipboard decision's post-commit File identity and rollback law is retained.

Current local runs: 30 package upload/placeholder tests pass; six copied
placeholder and object-URL tests pass; seven observation cases reproduce the
behavior above. Existing browser upload cases were inspected, not rerun. They
use a fake transport and do not certify UploadThing or copied picker behavior.

The draft-slot design must settle target identity, selection, serialization,
collaboration, unfinished document reload, undo-before-completion and redo,
cancellation, per-node readonly and root lifetime. If design reopens per-media
pending nodes, it must prove that optional-source grammar and renderer/codec
branching are smaller than the dedicated slot. A replacement runtime or
subscription strategy requires the existing owner-versus-candidate scale probe
before acceptance. No performance, live service, native-device,
replacement-runtime or release claim is made here.

No product source or public doctrine changed during this audit. Adoption must
repair the media documentation, affected behavior-law evidence and versioned
API doctrine rather than treating historical test labels as current proof.

## Next owner

```text
$task design plan uploads: unify batch admission and root-aware completion, define the persisted draft-asset state machine, and preserve exact document authority
```

Start with the durable states: active local upload, failed upload, restored
unbound slot and completed media. Compare a dedicated slot against per-media
pending unions before fixing names or call shapes. Design API, schema, lifetime,
adoption and proof together.
