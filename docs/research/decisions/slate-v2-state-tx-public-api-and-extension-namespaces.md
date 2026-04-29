---
title: Slate v2 should use state and tx callback APIs with extension namespaces
type: decision
status: accepted
updated: 2026-04-28
source_refs:
  - docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
  - /Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts
  - /Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts
  - /Users/zbeyens/git/prosemirror/state/src/transaction.ts
  - /Users/zbeyens/git/prosemirror/state/src/plugin.ts
  - /Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts
  - /Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts
related:
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md
  - docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md
---

# Slate v2 should use state and tx callback APIs with extension namespaces

## Decision

Slate v2 should make the public lifecycle:

```ts
editor.read((state) => {
  state.selection.get()
})

editor.update((tx) => {
  tx.selection.get()
  tx.nodes.set(props, { at: target })
})
```

Use `state` for read-only work and `tx` for update work.

Do not expose `api` / `tf` as the core Slate naming. `api` is too vague, and
`tf` is too Plate-shaped and cryptic for raw Slate.

## Why `tx` Also Has Read Methods

Inside an update, reads must observe the transaction-in-progress. If reads stay
on a separate object that points at the last committed snapshot, users will
ask whether `api.selection.get()` sees mutations already made in the same
callback.

`tx` should therefore be a writable transaction view:

- read groups are present on `state` and `tx`
- write groups exist only on `tx`
- `tx.selection.get()` returns the fresh transaction selection
- `tx.nodes.get(target)` reads the transaction document, not stale editor
  state

## Extension Shape

Extensions should add named groups to `state` and `tx`, not flat methods to the
editor object:

```ts
defineEditorExtension({
  key: 'table',
  state: {
    table(state) {
      return {
        currentCell() {},
      }
    },
  },
  tx: {
    table(tx) {
      return {
        insertRow() {},
      }
    },
  },
})
```

Usage:

```ts
editor.read((state) => {
  state.table.currentCell()
})

editor.update((tx) => {
  tx.table.insertRow()
})
```

This keeps raw Slate unopinionated while giving Plate and plugins a clean,
discoverable extension namespace.

## 2026-04-28 Live-Source Refresh

Live `../slate-v2` now has the state/tx substrate:

- `editor.read((state) => ...)` and `editor.update((tx) => ...)` are implemented
  and tested.
- `state` and `tx` expose grouped read APIs.
- `tx` exposes grouped write APIs.
- extension namespaces can augment `state.<plugin>` and `tx.<plugin>`.
- tx reads observe transaction-local draft state.

But author-facing docs and examples still teach primitive editor writes inside
`editor.update(() => ...)` as the normal method API.

Live source evidence:

- `packages/slate/test/state-tx-public-api-contract.ts` proves grouped
  `state` reads, grouped `tx` writes, and tx-local read coherence.
- `packages/slate/src/create-editor.ts` still wires primitive transform
  methods onto `BaseEditor`.
- `packages/slate/test/write-boundary-contract.ts` rejects primitive writes
  outside `editor.update`, but still proves primitive writes are routed inside
  update.
- `docs/concepts/04-transforms.md` and `docs/concepts/07-editor.md` still
  present primitive `editor.*` methods as the author-facing method API.

Current research verdict:

- `tx.*` remains the accepted normal public write DX.
- primitive `editor.*` transform methods should not be presented as the normal
  author-facing path if the goal is the clean architecture/DX target.
- either demote primitive editor writes to advanced/internal bridge status with
  explicit release guards, or migrate examples/docs/tests to `tx.*`.
- keep `applyOperations` as the explicit operation replay writer for
  collaboration/backbone proof.

This is a plan/execution gap, not a research contradiction.

## Predicate Shape

Schema predicates should not stay as top-level editor clutter:

```ts
editor.isInline(element)
editor.isVoid(element)
editor.markableVoid(element)
editor.isSelectable(element)
```

The final public shape should be:

```ts
editor.schema.isInline(element)

editor.read((state) => {
  state.schema.isVoid(element)
})

editor.update((tx) => {
  tx.schema.isSelectable(element)
})
```

Most authors should configure these through element specs instead of manual
predicate overrides:

```ts
defineElement({
  type: 'mention',
  inline: true,
  void: 'markable-inline',
  selectable: true,
})
```

## Evidence

- Lexical proves the lifecycle boundary: `read` prevents mutation and `update`
  is the only safe mutation place. Its active-context checks also show that
  helpers should only run inside read/update callbacks.
- ProseMirror proves transaction ownership: transactions track document
  changes, selection changes, stored marks, and metadata together.
- Tiptap proves extension and command discoverability are high-value DX, but
  its flat `editor.commands` and chain-first product style should remain a
  product-DX inspiration, not the raw Slate core shape.

## Rejected Alternatives

### `editor.update(({ api, tf }) => {})`

Rejected. It forces users to reason about read freshness inside a write
callback, and the `tf` abbreviation is too framework-specific for core Slate.

### `editor.api` and `editor.tf`

Rejected. It permits illegal writes outside `editor.update` unless every method
does runtime checks, and it makes autocomplete heavier on the editor object.

### Flat `editor.commands`

Rejected as core Slate API. It is good product ergonomics for Tiptap and
Plate-style command catalogs, but raw Slate should stay primitive and
unopinionated.

### Keep flat `editor.*` method growth

Rejected. It preserves Slate familiarity, but it scales into method clutter and
keeps extension collisions on the editor object.

## Take For Slate v2

The best final shape is:

```txt
small editor object
editor.read((state) => ...)
editor.update((tx) => ...)
namespaced read groups on state and tx
namespaced write groups only on tx
extension groups attached to state/tx namespaces
optional product command sugar above the primitive lifecycle
```
