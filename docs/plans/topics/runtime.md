# Document runtime and views

The ledger asks which runtime and view lifetimes Plite needs. The 2026-10-04 audit stopped: one private document runtime with root-, document- and authored-bound views matches the lifetimes production code uses, the competing public React runtime is gone, and every deletion lane loses either shared-root identity or per-view interaction state. The [content-root execution](../2026-09-30-content-root-locations-execution.md) corrected view derivation over the canonical runtime, including immutable, read-only and authored binding, and validates a document once per compiled schema. `node tooling/scripts/review-ledger.mjs show runtime` prints the scope's history.

## Layer and owner

```text
application UI state                 document runtime
(panels, prompts, transient input)    (roots, fields, effects, schema, registry)
                                             ↑
                                     root-scoped view
                                     (focus, composition, read-only)
                                             ↑
                             command dispatch / atomic update
```

| Responsibility | Decision |
| --- | --- |
| Document owner | Plite, `packages/plitejs/src/core/editor-runtime.ts`: roots, document commits, registry and document state. |
| Views | `editor-runtime-view.ts` reuses the owner's registry and state, projects reads and writes to one root, and owns view-local focus, composition and read-only state; extension API factories receive the actual view. |
| Primary root | Implicit; public root validation rejects its internal name as a named root. |
| Independent editors | Separate documents, as the multiple-editors demo shows; shared blocks reuse content roots of one document. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A public runtime object beside the editor | Another setup and identity contract with no caller work removed. |
| Deleting separate view identity | Loses independent interaction state or moves it into app adapters. |
| Roots as ordinary node metadata | Loses shared-root lifetime. |
| A global editor store, or one document per view | Loses document independence or shared roots. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- The public React `Runtime` handle is gone ([react](react.md)); `createEditorView(editor, { document })` is the read-only view over one immutable document ([conversion-boundary](conversion-boundary.md)).

## Open work

- The Stop rejects replacements; it certifies no projection, cache or mounted-view path at scale. owner: Benchmark. stop: a change to runtime machinery brings its matched scale probe.
