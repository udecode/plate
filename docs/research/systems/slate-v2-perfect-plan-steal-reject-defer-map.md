---
title: Slate v2 perfect plan steal reject defer map
type: system
status: accepted
updated: 2026-04-23
related:
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
---

# Slate v2 perfect plan steal reject defer map

## Purpose

This page is the compiled cross-corpus map for the next Slate v2 "perfect
plan" question:

- what to steal now
- what to reject outright
- what to defer

It is narrower than the broader editor architecture landscape. It exists to
shape the final public/runtime architecture for Slate v2.

## Bottom Line

The best architecture is not "copy Lexical", "copy ProseMirror", or "copy
Tiptap".

It is:

```txt
Slate model + operations
Lexical-style read/update lifecycle
ProseMirror-style transaction and DOM-selection discipline
Tiptap-style extension and product DX
React 19.2 optimized renderer/runtime APIs
```

## Steal Now

### 1. Read/update lifecycle

Steal from Lexical:

- `editor.read(fn)`
- `editor.update(fn, options?)`
- synchronous closure-based read/write legality
- lifecycle tags

Why now:

- this is the cleanest public contract
- it avoids leaking `tx.resolveTarget()` into user DX
- it unifies method safety under one mutation boundary

### 2. Transaction authority

Steal from ProseMirror:

- one transaction owns composite local mutation
- transaction metadata
- selection mapping through change application
- durable selection bookmarks

Why now:

- browser regressions keep proving that selection truth must not leak across
  arbitrary event handlers and public mutable fields

### 3. Central DOM bridge ownership

Steal from ProseMirror:

- explicit DOM selection import/export split
- DOM observer discipline
- view/input owns browser selection synchronization

Why now:

- this is the difference between battle-tested browser editing and random
  caret-repair patches

### 4. Dirty-region runtime facts

Steal from Lexical:

- dirty-node discipline before rendering

Adapt to Slate:

- dirty paths
- dirty runtime ids
- dirty top-level ranges
- operation-class metadata

Why now:

- React-perfect runtime depends on commit dirtiness instead of snapshot churn

### 5. Extension ergonomics

Steal from Tiptap and Lexical Extensions:

- feature packaging that keeps config + behavior + outputs together
- discoverable extension methods
- dependency-aware extension registration

Why now:

- Plate and Yjs migration need an extension story stronger than method
  monkeypatching or scattered React/plugin wiring

### 6. React selector posture

Steal from Tiptap docs and Lexical subscription posture:

- selector subscriptions
- render only what changed
- loading/ready state
- composable editor UI

Why now:

- React 19.2 gives the runtime room to be first-class instead of treated as an
  unavoidable overhead

## Reject

### 1. Lexical node model

Reject:

- class-based nodes as the main document model
- `$function` API style
- editor APIs that depend on bespoke node-class mutation patterns

Why:

- it fights Slate's model/operation inheritance
- it would punish Plate/Yjs migration for the wrong reason

### 2. ProseMirror integer-position and schema-first identity

Reject:

- integer document positions as the main public coordinate system
- schema-first ontology as the core identity
- plugin-system complexity as the public extension model

Why:

- Slate's closest north star remains JSON-like tree + operations

### 3. Tiptap focus/chain ceremony as required UX

Reject:

- `editor.chain().focus().toggleX().run()` as the normal way to mutate from UI
- command-focused public DX when the real owner is lifecycle + primitives

Why:

- `focus()` is workaround ceremony when selection freshness is not owned by the
  runtime
- it teaches the wrong mental model

### 4. Public mutable fields

Reject:

- `editor.selection`
- `editor.marks`
- `editor.children`
- `editor.operations`

Why:

- stale-by-default state is the root of too many regressions

### 5. Public `Transforms.*` as primary API/docs

Reject:

- teaching free transforms as the public mutation story

Why:

- flexible primitives are still correct, but they should be editor methods used
  inside `editor.update`, not free functions that bypass lifecycle ownership

### 6. A second renderer/runtime engine

Reject:

- replacing React with a full Lexical-style DOM reconciler
- React-first core

Why:

- the goal is React-perfect runtime performance, not React avoidance

## Defer

### 1. Optional chain API

Defer:

```ts
editor.chain().setNodes(...).wrapNodes(...).run()
```

Why:

- useful sugar
- not needed to prove the core architecture
- easy to add later on top of `editor.update`

### 2. Rich extension dependency polish

Defer:

- full dependency graph diagnostics
- lazy extension loading ergonomics
- extension conflict UX polish

Why:

- the base extension runtime matters now
- the polished extension framework can come after the lifecycle is stable

### 3. Deep layout/page system

Defer:

- pagination/layout composition lane
- print/page APIs

Why:

- Pretext/Premirror pressure is real
- but it is a separate lane from the perfect editing/runtime spine

### 4. AI/editor-agent product surfaces

Defer:

- suggestion/review/AI product APIs
- tracked-changes/comment integrations

Why:

- useful later
- not needed to close the runtime and browser-editing foundation

### 5. Broad Tiptap-style UI kit parity

Defer:

- full toolbar/menu/template kit as a first-class package surface

Why:

- desirable for product DX
- not a foundation blocker

## Recommended Final Shape

### Public

```ts
editor.read(() => {
  editor.getSelection()
  editor.getChildren()
})

editor.update(() => {
  editor.unwrapNodes({ match: isList })
  editor.setNodes({ type: 'list-item' })
  editor.wrapNodes({ type: 'bulleted-list', children: [] })
})
```

### Internal

```txt
editor.update
  -> transaction
  -> internal target resolution
  -> operations
  -> EditorCommit
  -> history/collab/render/DOM repair
```

### Extension

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

## What This Means For The Perfect Plan

The next implementation plan should be organized around these owners:

1. read/update public lifecycle
2. transaction-owned primitive method safety
3. public mutable field hard cuts
4. extension runtime
5. React runtime consuming commits/live reads
6. browser gauntlets
7. optional sugar and productization later
