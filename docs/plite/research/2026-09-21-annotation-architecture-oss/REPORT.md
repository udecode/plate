# Annotation architecture: final OSS comparison

## Verdict

Keep this architecture:

```text
one document model
  -> independent mounted views
  -> one exact-view annotation index per view
  -> view-local decoration paint

one externally owned annotation record
  -> one borrowed persistent target
  -> resolve(target, exact view)
```

Do not replace native anchors with a marker collection, `RangeSet`, interval
tree, document mark, or CRDT cursor. Those structures solve useful parts of the
job, but none owns the complete Plate contract: tree/root identity, authored
projection, retained target lifetime, external thread data, multiple mounted
views, and paint that can disappear with the DOM.

The architecture is clean. Its performance rank is not proven. Current Plite
already routes anchor work by changed `NodeKey`, refreshes only candidate
annotation IDs, publishes immutable keyed snapshots, and paints by per-node
buckets. The remaining risk is duplicated resolution and snapshot work across
one, two, or four mounted views, especially during initial activation and a
projection switch.

## Comparison

| Candidate        | Useful law                                                                                                                                         | Rejected ownership                                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProseMirror      | Persistent mapped collections reuse unaffected child structure; bookmarks separate mapping from later resolution.                                  | Decorations combine range and paint and do not own external thread lifetime or Plite's exact authored view.                                                    |
| Lexical          | External thread records can refer to document attachment IDs; dirty-node routing bounds reconciliation.                                            | `MarkNode` writes attachment identity into document content and its history. That is the wrong default for Plate Comments.                                     |
| CKEditor         | One model can feed separate projections; each mapper owns projection-local bindings; marker deltas coalesce per transaction.                       | Every live range subscribes to model operations, marker queries scan a global map, and CKEditor explicitly recommends keeping few markers.                     |
| CodeMirror       | `RangeSet` is immutable, chunked, maps only touched chunks, and compares shared chunks cheaply. View plugins own explicit cleanup.                 | A view owns its own `EditorState`; nonempty ranges collapse on complete deletion; decorations remain range plus paint rather than semantic targets.            |
| Monaco / VS Code | One model can serve several editors; an augmented interval tree lazily shifts untouched subtrees and queries only viewport ranges.                 | Decorations collapse or move on deletion, invalidation is coarser than Plite's changed-node routing, and model decorations do not own comment records.         |
| Yjs              | Relative positions preserve collaborative identity; current source batches many positions by node and accepts an explicit renderer per resolution. | Deleted positions usually resolve to a boundary, and exact local undo following can disagree with a synced clone. It cannot define a portable terminal target. |
| Automerge        | Persistable cursors move toward a chosen surviving neighbor; marks stay detached from newly inserted replacement text.                             | Cursors are nearest-boundary positions. Marks are rich-text state with one deterministic value per mark name, not a thread/index/paint architecture.           |
| Tiptap Comments  | The product split between thread metadata and an attachment mark is understandable.                                                                | The implementation is private, the attachment lives in document JSON, and it supplies no source-level performance evidence.                                    |
| Quill            | Delta transformation is a compact flat-offset baseline.                                                                                            | It has no retained tree target, projection-local annotation index, or independent annotation identity owner.                                                   |

## What to keep

1. **One model with independent mounted views.** Selection, focus, editability,
   projection, annotation index, and paint belong to the exact view. The target
   and application record do not.
2. **Native anchors as the semantic mapper.** Plite already indexes listeners by
   node key and visits only affected anchors for ordinary commits. CKEditor's
   observer-per-range design is a regression at high cardinality.
3. **One annotation index per exact view.** A shared resolved snapshot is false
   when accepted and proposed projections expose different positions.
4. **Metadata, target, index, and paint as four lifetimes.** Comments owns
   threads; the target owner releases targets; the annotation index borrows only
   `resolve`; `DecorationSource` owns render output.
5. **Terminal `drop` for locally observed transient lifetime.** AI drafts,
   combobox targets, awareness endpoints, and operation trackers need invalidation
   when their target is deleted. Comments already use `nearest`.
6. **Explicit resource ownership.** React readers must not receive headless
   `destroy`, target release, retry, metrics, or status authority.

## What to cut

- The second comment-mode document, copied values, `mirrorAnchor`, and per-write
  reconstruction.
- `release` from borrowed `AnnotationAnchor`; the store calls only `resolve`.
- The generic untyped `AnnotationProvider`, public metrics/status/retry, and
  lifecycle verbs on React-owned readers.
- Any public collection mapping API, interval tree, owner token, or `resolveMany`
  before a current benchmark proves it is needed.
- Any claim that `drop` is a cross-client persisted target protocol. Yjs proves
  that local undo lineage can resolve differently after synchronization. A
  future exact-but-temporarily-unavailable collaborative target is a separate
  job and must earn a separate policy.

## Private performance candidates

Keep the public scalar `target.resolve(view)` contract. Compare these private
implementations without changing it:

1. **Current baseline:** central changed-`NodeKey` anchor routing plus the
   stable-ID mapped source and per-view output buckets.
2. **Batched native resolution:** group targets by native backend/root/node and
   resolve them in one traversal, following current Yjs position helpers. An
   arbitrary borrowed target still uses scalar `resolve`.
3. **Collection-mapped prototype:** a throwaway chunked or interval structure
   inspired by CodeMirror/Monaco. It must retain Plite's tree/root and authored
   semantics; flat offsets are not accepted as semantic identity.

The custom persistent byte trie also remains private and provisional. Its 10k
complexity tests prove bounded copying, not wall-time or retained-heap
superiority over simpler immutable snapshots.

## Required benchmark and behavior proof

Run `1 / 2 / 4` mounted views against `1k / 10k / 100k` annotations, distributed
both densely in one block and across at least 1,000 blocks. Measure:

- one-character local edit, full target deletion, structural move, metadata-only
  update, full activation, projection switch, scroll/remount, and unmount;
- anchor listeners visited, target resolutions, source input visits, dirty node
  buckets, subscriber wakes, allocations, retained heap, update p50/p95, React
  renders, and DOM commits;
- current baseline versus batched native resolution and the collection prototype.

Acceptance requires local edit work to follow changed target IDs and rendered
node keys. Ordinary edits must not scan every annotation or traverse the whole
document. Full activation may be linear in annotation count, but batching must
win materially before its new internal capability is retained.

Behavior proof must also cover two simultaneous views with independent focus,
selection and editability; accepted/proposed projection differences; omitted
DOM remount; adjacent, nested, crossing and collapsed paint; target release;
Strict Mode cleanup; duplicate IDs; and delete/undo/redo for `nearest` and
terminal local `drop`. Add a collaboration case showing that terminal `drop` is
not reconstructed from CRDT cursor resolution after remote synchronization.

## Harsh conclusion

The public architecture is stronger than every sampled editor's complete
annotation model. The weak point is our confidence, not the ownership graph.
Adding CodeMirror's tree, Monaco's interval index, or Yjs-style batching without
a matched run would be cargo culting. Keep the simple public contract, prototype
the private kernels, and delete whichever loses.
