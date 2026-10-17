# Anchors, annotations and inline paint

One document model serves every mounted view. Each view keeps an exact annotation index over borrowed, resolve-only anchors, and Decoration paints separately. A local `drop` anchor is terminal: deletion invalidates it in ordinary and Authored editing alike, and undo never revives it, while `nearest` keeps exact history recovery. The 2026-10-04 audit found this live with its last provisional gate closed, and the matched 1, 2 and 4-view, 1k to 100k benchmark rejected every replacement kernel ([triage audit](../2026-10-04-ledger-triage-audit.md)). `node tooling/scripts/review-ledger.mjs show annotations` prints the full history.

## Layer and owner

```text
one document model
  → editable writer view + read-only reviewer view
one comment-owned native anchor
  → resolve(view) per mounted view
  → per-view annotation index
  → feature decoration and comment UI
```

| Responsibility | Decision |
| --- | --- |
| Persistent and transaction anchors | `editor.anchor` and `tx.anchor` share native construction; a transaction releases its tracker and refuses later reads. Media promises, AI drafts and cursor bindings own longer lifetimes explicitly. |
| Deletion policy | `drop` means deletion permanently invalidates the target; complete-range deletion resolves to `null`. `nearest` falls back to a survivor and recovers exactly through history. `release` is the owner's disposal, a different cause. |
| Annotation index | `AnnotationStore` in `plitejs/annotations` owns identity and node indexes for a view. Borrowed inputs need only `resolve`; the store never releases them. IDs are unique, and invalid input stays distinct from quarantined source or resolution failures. |
| React | `useAnnotationStore` owns commit-safe activation and Strict Mode cleanup and returns only reader and invalidation capabilities. `useAnnotation` and `useAnnotations` take an explicit typed store. Headless `createAnnotationStore` keeps explicit disposal, and `refresh` is the recovery path. |
| Selection | The model owns one active canonical selection; mounted views own focus, read-only policy, projection, index and paint, and an inactive pane hides the active selection. |
| Paint | Decoration owns keyed ranges, safe attributes and external observation; content-root admission checks the emitting reader's root before path fast paths ([content-root locations](../2026-09-30-content-root-locations-execution.md)). |
| Mapping kernel | The node-key kernel stays; batched, chunked and interval candidates lost the matched benchmark. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Generic `AnnotationProvider` and the implicit hook fallback | Erased `TData` through an untyped context and returned empty state silently; deleted. |
| Public status, metrics and `retry` | No product caller; metrics stay test instrumentation. |
| Two models with `mirrorAnchor` for comment mode | Reimplemented one document in two views; the example now mounts two exact views over one model. |
| Moving the index into Comments | Would push Plite view machinery into the product layer. |
| A `RangeSet` or interval tree by analogy | Plite already routes changed node keys; replacements lost on measurement. |
| Renaming `drop` or a third recoverable-absence policy | No current consumer needs it. |
| Document-resident attachment marks | Put target identity into serialization and history, against external comment threads. |

The adoption run recorded 107 core anchor and history cases, 68 React annotation and decoration cases, 55 Plate Comments cases, 8 focused browser journeys and the full Chromium matrix with 748 passes and 7 declared skips. These are dated results.

## What other editors do

The 2026-09-21 pass read ProseMirror, Lexical, CodeMirror, Monaco and VS Code, Yjs, Automerge, Quill and the public Tiptap Comments contract (`docs/plite/research/2026-09-21-annotation-architecture-oss/REPORT.md`).

| Editor | What it does | What Plate takes |
| --- | --- | --- |
| ProseMirror, CodeMirror | Strong persistent range sets whose decoration values carry both range and paint | Keep mapped range and paint as separate owners. |
| Monaco | One model attached to several editors with an interval tree; coarser invalidation, and full deletion keeps a collapsed decoration | One model across views; terminal `drop` instead. |
| Lexical, Automerge, Tiptap | Attachment marks stored in the document | Rejected for externally owned threads. |
| Yjs, Automerge | Collaborative cursors move to a surviving boundary; local undo can resolve differently from a synced clone | `drop` is not a convergent persisted CRDT target. |

## Main changes

- Local `drop` became terminal in both engines; the generic provider, public status and the mirror-anchor comment-mode topology are gone.

## Open work

- Firefox, WebKit, physical devices and replicated terminal absence stay unproven. owner: the next annotations review. stop: a collaborative target with a current consumer.
