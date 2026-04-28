---
title: Slate v2 perfect plan should steal read update transaction discipline and extension DX
type: decision
status: accepted
updated: 2026-04-23
source_refs:
  - docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
  - docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md
related:
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
---

# Slate v2 perfect plan should steal read update transaction discipline and extension DX

## Decision

For the "perfect plan" target, Slate v2 should:

- steal Lexical's `read/update` lifecycle discipline
- steal ProseMirror's transaction and DOM-selection discipline
- steal Tiptap's extension and product DX
- reject all three engines' mismatched core identities when they fight Slate's
  data model and operation semantics

## Steal

### Lexical

- `editor.read`
- `editor.update`
- lifecycle tags
- dirty-node discipline
- extension dependency graph ideas

### ProseMirror

- transaction authority
- selection mapping
- selection bookmarks
- centralized DOM selection import/export
- view-data overlay discipline

### Tiptap

- extension ergonomics
- command discoverability
- selector-based React UI state
- optional chain API later

## Reject

- Lexical class-based node model
- Lexical `$function` public style
- ProseMirror integer position model
- ProseMirror schema-first identity
- Tiptap `focus().chain().run()` as required public ceremony
- public mutable editor fields
- public free-transform-first docs
- React-avoidance as a performance strategy

## Defer

- optional `editor.chain()`
- extension dependency/conflict polish
- page/layout system
- AI/review/tracked-change product surfaces
- full product UI kit parity

## Public Contract

```ts
editor.read(fn)
editor.update(fn, options?)
```

Primitive editor methods are the power API inside `editor.update`.

`tx.resolveTarget()` stays internal.

## Why This Wins

This combination gives Slate v2:

- best chance at React 19.2-perfect runtime performance
- flexible DX for custom node types
- safer browser-editing correctness than patch-driven event handling
- a migration path Plate and Yjs can actually follow

## Status

Accepted as the deeper architecture/API direction for the Slate v2 perfect
plan. Implementation sequencing remains a separate planning concern.
