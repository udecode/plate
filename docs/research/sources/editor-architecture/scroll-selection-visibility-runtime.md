---
title: Scroll, selection, and caret visibility runtime
type: source
status: accepted
updated: 2026-05-11
source_refs:
  - ../raw/prosemirror/packages/state/src/transaction.ts
  - ../raw/prosemirror/packages/state/src/state.ts
  - ../raw/prosemirror/packages/view/src/index.ts
  - ../raw/prosemirror/packages/view/src/domcoords.ts
  - ../raw/prosemirror/packages/view/src/domchange.ts
  - /Users/zbeyens/git/lexical/packages/lexical/src/LexicalEvents.ts
  - /Users/zbeyens/git/lexical/packages/lexical/src/LexicalSelection.ts
  - /Users/zbeyens/git/lexical/packages/lexical/src/LexicalUtils.ts
  - node_modules/.pnpm/@codemirror+view@6.39.16/node_modules/@codemirror/view/dist/index.d.ts
  - node_modules/.pnpm/@codemirror+view@6.39.16/node_modules/@codemirror/view/dist/index.js
  - ../tiptap/packages/core/src/commands/scrollIntoView.ts
  - ../tiptap/packages/core/src/commands/focus.ts
  - ../tiptap/packages/core/src/helpers/posToDOMRect.ts
  - ../raw/milkdown/repo/packages/prose/src/toolkit/position/index.ts
  - ../raw/obsidian/developer/en/Reference/TypeScript API/Editor/scrollIntoView.md
related:
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md
  - docs/research/systems/editor-architecture-landscape.md
---

# Scroll, selection, and caret visibility runtime

## Purpose

Capture the editor-runtime evidence for keeping the caret visible without
letting stale model selection, direct DOM measurement, or nested scroll parents
fight each other.

## Bottom line

The strongest editors do not treat scrolling as a free-floating helper.

They make scroll a post-selection, post-update request:

- first decide the current selection truth
- apply the edit or selection transaction
- compute geometry from the effective post-update caret/range
- scroll the minimal scrollable ancestor chain
- preserve scroll anchors when the update did not explicitly ask to reveal the
  caret

Slate v2 should steal that lifecycle, not the full ProseMirror, Lexical, or
CodeMirror architecture.

## ProseMirror

Observed mechanism:

- transactions carry explicit `scrollIntoView()` intent, and state keeps a
  `scrollToSelection` counter
- view updates decide between reset, scroll-to-selection, and preserve
- `scrollToSelection()` uses the actual post-update selection head and
  `coordsAtPos`
- `scrollRectIntoView` walks scroll parents from the selection DOM node to the
  viewport, with threshold and margin controls
- `storeScrollPos` / `resetScrollPos` preserves scroll anchors when selection
  update should not reveal the caret
- DOM changes import the browser selection before dispatching follow-up
  transactions, and key-origin imports request scroll

What Slate should steal:

- transaction/commit-scoped scroll intent
- custom rectangle-to-scroll-parent algorithm
- threshold and margin policy
- scroll preservation when there is no explicit reveal request
- source-of-truth order: DOM import first, then transaction, then scroll

What Slate should reject:

- integer document positions as the public geometry model
- ProseMirror's document-view tree as Slate React's renderer
- plugin-heavy scroll customization as the normal API

## Lexical

Observed mechanism:

- beforeinput may apply the native target range to the model selection before
  continuing text insertion
- selection reconciliation can choose DOM selection for selectionchange,
  beforeinput, composition, click, drop, and other native-origin events
- caret scroll uses a measured selection target rectangle and walks parents
  from the root element upward
- scroll padding on the document element is respected

What Slate should steal:

- native input should import the current DOM range before model-owned text
  insertion unless an internal operation explicitly owns selection
- scroll should receive a rectangle, not monkeypatch an element measurement
  method
- scroll-padding should count as unavailable visible area

What Slate should reject:

- class node architecture
- `$` helper API style
- a wholesale custom DOM reconciler as the main Slate React model

## CodeMirror

Observed mechanism:

- `EditorView.scrollIntoView` is a transaction effect
- scroll targets are mapped through document changes
- layout measurement and DOM writes are batched through `requestMeasure`
- scroll work happens during the view measurement/update cycle
- `scrollSnapshot` records a restorable scroll anchor
- `scrollMargins` is a facet for fixed overlays and obscured viewport areas

What Slate should steal:

- measure/read and write scheduling discipline
- scroll target mapping through state changes
- scroll margins for sticky toolbars, gutters, and app chrome

What Slate should reject:

- CodeMirror's line-block viewport engine as a dependency for active rich text
  editing
- exposing scroll as a separate editor state package in raw Slate

## Tiptap, Milkdown, and Obsidian

Observed mechanism:

- Tiptap exposes product-level `scrollIntoView` and focus options, but delegates
  engine behavior to ProseMirror transactions and `coordsAtPos`
- Milkdown follows the same ProseMirror transaction pattern and uses
  `coordsAtPos` for UI positioning
- Obsidian exposes `Editor.scrollIntoView(range, center?)` as a product API,
  but its public docs do not expose the underlying algorithm

What Slate should steal:

- a simple app-facing customization boundary
- focus may request scroll, but focus should not itself invent stale selection
  truth

What Slate should reject:

- product wrapper APIs as raw Slate core design
- treating product-level scroll commands as evidence for the engine algorithm

## Slate v2 target

Slate v2 should split the problem into three owned steps:

1. **Selection import.** Before native text input or model-owned fallback, import
   the in-editor DOM selection unless the current event is internal-control,
   composition repair, programmatic export, or another explicit model-owned
   operation.
2. **Scroll request.** Mutations and DOM-selection exports enqueue a caret
   visibility request with reason, margin, threshold, and skip/force policy.
3. **Visibility commit.** After DOM selection export or post-input repair, measure
   the effective range/rect and scroll nested parents minimally.

This makes the video-class failure hard to reintroduce: typing after a
scroll-and-click cannot use an old model selection, and scroll cannot reveal the
wrong caret.
