---
date: 2026-04-22
topic: slate-v2-final-api-hard-cuts-status
status: active
---

# Slate v2 Final API Hard Cuts Status

## Current Read

The final API posture is not “legacy Slate React with faster internals”.

The kept shape is:

- data-model-first `slate`
- transaction/commit-first local execution
- projection-source overlays
- semantic `Editable`
- compatibility only where it still protects real extension or migration
  pressure

## Hard Cut Matrix

| Cut | Status | Current state | Remaining owner |
| --- | --- | --- | --- |
| Keep `decorate` out of the primary API | `done` | Primary `Editable` has no `decorate` prop. Projection stores are the overlay API. Legacy callback-style decoration is only available through the explicitly named `createSlateDecorateCompatSource` adapter. | None for primary API. Keep compat adapter narrow. |
| Keep child-count chunking dead | `done` | Product `slate-react` runtime has no `renderChunk`, `getChunkSize`, or child-count chunking API. Huge docs use semantic islands, active corridor, occlusion, and projection stores. | None for product runtime. Legacy chunking remains only as historical/comparison context. |
| Demote mutable editor fields to compat/dev mirrors | `mostly done` | `editor.children`, `editor.selection`, `editor.marks`, and `editor.operations` are documented as compatibility mirrors, not primary reads. Product read paths now use explicit accessors in the provider, `Editable`, Android input manager, and DOM bridge. | Full hard deletion is not active; compatibility mirrors stay until extension/migration pressure is gone. |
| Stop teaching `editor.apply` / `editor.onChange` | `done for public teaching; compat remains` | Examples no longer monkey-patch `editor.apply`; huge-document instrumentation uses `Editor.subscribe`. Docs classify instance `editor.apply` and `editor.onChange` as compatibility-only. Core keeps `editor.apply` because extension and transaction contracts still prove it as a low-level compatibility surface. | Design a named extension/interception API before removing core compatibility. |
| Hard-cut dead legacy React renderer exports/tests/docs | `done` | Legacy renderer exports `DefaultElement`, `DefaultLeaf`, and `DefaultText` are removed. Old renderer files and the broad legacy decorations test are deleted. Current public primitives are `Editable`, `EditableText`, `SlateElement`, `SlateLeaf`, `SlateText`, `TextString`, `ZeroWidthString`, and related semantic primitives. | Local docs may use `DefaultElement` as an example-local function name; that is not a package export. |

## Not Done

`editable.tsx` is still not the perfect browser editing architecture.

It still owns too many responsibilities:

- DOM selection reconciliation
- input routing
- native/model-owned operation decisions
- composition handling
- paste/drop handling
- post-commit DOM repair
- test/browser handle plumbing

The next architecture-quality lane is a browser editing kernel split:

- `selection-reconciler`
- `input-router`
- `native-input-strategy`
- `model-input-strategy`
- `dom-repair-queue`
- `browser-proof-handle`

That is separate from the five hard cuts above.

Execution owner:

- [editable browser kernel refactor plan](/Users/zbeyens/git/plate-2/docs/plans/2026-04-22-slate-v2-editable-browser-kernel-refactor-plan.md)

## Proof Pointers

- [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md)
- [slate-react-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-react-api.md)
- [data-model-first React-perfect runtime decision](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
