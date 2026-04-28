---
title: Slate v2 should use read/update as the public runtime lifecycle
type: decision
status: accepted
updated: 2026-04-25
source_refs:
  - docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
related:
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/plans/2026-04-23-slate-v2-selection-fresh-editor-methods-architecture-plan.md
---

# Slate v2 should use read/update as the public runtime lifecycle

## Decision

Slate v2 should expose:

```ts
editor.read(fn)
editor.update(fn, options?)
```

as the public runtime lifecycle.

`tx.resolveTarget()` remains internal. It is not normal plugin/app DX.

## Why

The strongest cross-editor evidence points to the same discipline:

- Lexical uses read/update lifecycle and dirty reconciliation.
- ProseMirror uses transactions plus centralized DOM selection import/export.
- Tiptap packages commands/extensions into excellent product DX but still relies
  on ProseMirror transaction discipline underneath.

Slate v2 should combine those lessons without copying their models:

```txt
Slate model + operations
read/update lifecycle
transaction-owned target freshness
commit metadata
React-optimized live reads and dirty regions
extension-method ergonomics
browser gauntlet proof
```

## Public API Target

```ts
editor.read(() => {
  editor.getSelection()
  editor.getChildren()
  editor.getMarks()
})

editor.update(() => {
  editor.unwrapNodes({ match: isList })
  editor.setNodes({ type: 'list-item' })
  editor.wrapNodes({ type: 'bulleted-list', children: [] })
})
```

Primitive methods remain flexible. This is closer to Slate's durable value than
adding a semantic method for every custom node type.

## Internal Contract

```txt
editor.update
  -> active transaction
  -> implicit target resolves once if needed
  -> primitive methods use the transaction target when `at` is omitted
  -> operations
  -> EditorCommit
  -> history/collaboration/render/DOM repair
```

## Hard Cuts

- public mutable `editor.selection`, `editor.children`, `editor.marks`,
  `editor.operations`
- public `Transforms.*` as primary docs/examples API
- public `editor.apply` and `editor.onChange` as extension points
- command policy objects
- `ReactEditor.runCommand`
- child-count chunking as product runtime
- semantic-method explosion for every custom node type

## Extension Direction

Use extension methods and optional chain sugar:

```ts
editor.extend({
  name: 'todo',
  methods: {
    toggleTodo() {
      this.update(() => {
        this.setNodes({ type: 'todo', checked: true })
      })
    },
  },
})
```

Optional later:

```ts
editor.chain().setNodes(props).wrapNodes(wrapper).run()
```

`chain().run()` must be sugar over `editor.update`, not a separate runtime.

## React Runtime Direction

React consumes:

- live reads
- dirty runtime ids
- dirty top-level ranges
- `EditorCommit`
- source-scoped projection dirtiness
- direct DOM sync capability results

React does not own:

- document model truth
- operation/collaboration semantics
- selection import policy
- mutation lifecycle

## Battle-Test Requirement

No release-quality claim without generated browser gauntlets that assert:

- model tree/text
- model selection
- visible DOM
- DOM selection/caret where observable
- commit metadata
- no illegal kernel transition
- follow-up typing

## Status

Accepted as the final architecture direction for the current Slate v2 runtime
plan.

The read/update lifecycle is no longer just architecture prose: focused
write-boundary contracts, public-surface hard cuts, generated destructive
browser gauntlets, and persistent-profile soak now exercise the current
runtime. Final closure still requires the full `bun test:integration-local`
sweep and keeps raw Android/iOS mobile proof scoped unless a device-lab gate
provides direct artifacts.
