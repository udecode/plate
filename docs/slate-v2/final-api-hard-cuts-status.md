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
- `editor.read` / `editor.update`
- transaction/commit-first local execution through primitive editor methods
- projection-source overlays
- semantic `Editable`
- extension `editor`, `state`, and `tx` groups
- generated browser gauntlet proof for cursor/caret claims

## Hard Cut Matrix

| Cut | Status | Current state | Remaining owner |
| --- | --- | --- | --- |
| Keep `decorate` out of the primary API | `done` | Primary `Editable` has no `decorate` prop. Projection stores are the overlay API. No current package export teaches a legacy decoration callback adapter. | None for primary API. |
| Keep child-count chunking dead | `done` | Product `slate-react` runtime has no `renderChunk`, `getChunkSize`, or child-count chunking API. Huge docs use semantic islands, active corridor, occlusion, and projection stores. | None for product runtime. Legacy chunking remains only as historical/comparison context. |
| Cut mutable editor fields from primary public API | `done for public teaching` | `editor.children`, `editor.selection`, `editor.marks`, and `editor.operations` are not primary read paths. Public docs/examples/tests use read APIs, transaction/update APIs, and focused helpers instead. Internal runtime storage is not app/plugin DX. | Keep public docs and examples on the current read/update surface. |
| Stop teaching `editor.apply` / `editor.onChange` | `done for public teaching` | Examples do not monkey-patch `editor.apply`; huge-document instrumentation uses `Editor.subscribe`; extension power is through `editor`, `state`, and `tx` groups plus commit listeners. Direct apply/onChange replacement is not an extension point. | Keep public docs and examples on commit listeners and extension groups. |
| Hard-cut dead legacy React renderer exports/tests/docs | `done` | Legacy renderer exports `DefaultElement`, `DefaultLeaf`, and `DefaultText` are removed. Old renderer files and the broad legacy decorations test are deleted. Current public primitives are `Editable`, `EditableText`, `SlateElement`, `SlateLeaf`, `SlateText`, `TextString`, `ZeroWidthString`, and related semantic primitives. | Local docs may use `DefaultElement` as an example-local function name; that is not a package export. |

## Current Boundaries

Private-alpha closure is current-state proof. Ship, release, publish, PR, and
changeset lanes are inactive unless a prompt explicitly asks for them.

Same-turn ship-lane verification, when explicitly requested, includes:

- `bun test:integration-local`
- package build/typecheck/lint gates
- React/core perf guardrails
- completion-check closure

The browser editing architecture is under the conformance kernel contract:

- event-frame authority
- selection-source authority
- mutation-worker boundaries
- repair-result ownership
- generated replayable gauntlets
- scoped mobile/native transport claims

Execution owner:

- [absolute architecture closure plan](/Users/zbeyens/git/plate-2/docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md)
- [absolute architecture private-alpha claim](/Users/zbeyens/git/plate-2/docs/slate-v2/absolute-architecture-release-claim.md)

## Proof Pointers

- [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md)
- [slate-react-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-react-api.md)
- [data-model-first React-perfect runtime decision](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
