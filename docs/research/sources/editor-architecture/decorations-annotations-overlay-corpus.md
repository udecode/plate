---
title: Decorations / annotations overlay corpus
type: source
status: partial
source_refs:
  - docs/analysis/editor-architecture-candidates.md
  - docs/plans/2026-04-14-slate-v2-decorations-annotations-cluster-research.md
  - docs/slate-v2/decoration-roadmap.md
  - ../prosemirror/state/src/selection.ts
  - ../prosemirror/view/src/decoration.ts
  - ../lexical/packages/lexical-mark/src/MarkNode.ts
  - ../lexical/packages/lexical-playground/src/commenting/index.ts
  - ../tiptap/packages/extensions/src/focus/focus.ts
  - ../tiptap/packages/extension-node-range/src/helpers/getNodeRangeDecorations.ts
  - ../premirror/README.md
  - ../pretext/README.md
  - ../slate/Readme.md
  - ../edix/README.md
  - ../use-editable/README.md
  - ../rich-textarea/README.md
  - ../vscode/src/vscode-dts/vscode.d.ts
  - ../db/packages/react-db/src/useLiveQuery.ts
  - ../edit-context/dev-design.md
updated: 2026-04-14
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/slate-v2/decorations-annotations-cluster.md
---

# Decorations / annotations overlay corpus

## Purpose

This page compiles the cross-editor evidence behind the Slate v2
decorations / annotations / widgets architecture lane.

It is the research-layer bridge between:

- the candidate shortlist in
  [docs/analysis/editor-architecture-candidates.md](docs/analysis/editor-architecture-candidates.md)
- the earlier working notes in
  [2026-04-14-slate-v2-decorations-annotations-cluster-research.md](docs/plans/2026-04-14-slate-v2-decorations-annotations-cluster-research.md)
- the accepted plan direction in
  [decoration-roadmap.md](docs/slate-v2/decoration-roadmap.md)

## Raw layer note

This pass found a real storage structure gap:

- the strongest evidence for this lane already exists locally
- but most of it lives in official repo clones under `../<repo>`
- it has not yet been normalized into dedicated `../raw/<corpus>` families

That is a `structure gap`, not an `evidence gap`.

The conclusions below are still well-supported.

## Scoped corpora

Primary corpora in this pass:

- ProseMirror
- Lexical
- Tiptap
- Premirror
- Pretext
- Slate
- edix
- use-editable
- rich-textarea
- VS Code + comment/decor channels
- TanStack DB
- EditContext

Supporting references mentioned but not deeply ingested in this pass:

- Open UI richer text fields
- urql
- `@react-libraries/markdown-editor`

## Cluster pages

Use this page as the corpus overview and ledger.

Use the narrower source pages for actual topic reads:

- [prosemirror-mapped-overlays-and-bookmarks.md](docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md)
- [lexical-mark-store-and-decorator-split.md](docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md)
- [tiptap-comments-suggestions-and-node-range.md](docs/research/sources/editor-architecture/tiptap-comments-suggestions-and-node-range.md)
- [slate-v2-local-proof-substrate.md](docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md)
- [layout-measurement-and-ime-lanes.md](docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md)
- [lightweight-editable-surface-lower-bound.md](docs/research/sources/editor-architecture/lightweight-editable-surface-lower-bound.md)
- [service-channels-and-live-stores.md](docs/research/sources/editor-architecture/service-channels-and-live-stores.md)

## Per-corpus evidence ledger

### ProseMirror

- compiled pages inspected: none
- raw paths inspected: `../prosemirror/state/src`, `../prosemirror/view/src`
- direct raw files actually read:
  - `../prosemirror/state/src/selection.ts`
  - `../prosemirror/view/src/decoration.ts`
- official source entrypoints checked:
  - `../prosemirror/README.md`
  - package source under `../prosemirror/state/src` and `../prosemirror/view/src`
- strongest evidence found:
  - `SelectionBookmark` is the clean durable-anchor model
  - `DecorationSource` / `DecorationSet` plus `forChild(...)` prove the real
    win is mapped child-scoped propagation, not callback-only decoration
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/prosemirror/repo`

### Lexical

- compiled pages inspected: none
- raw paths inspected:
  `../lexical/packages/lexical-mark/src`,
  `../lexical/packages/lexical-playground/src/commenting`,
  `../lexical/packages/lexical-playground/src/plugins/CommentPlugin`
- direct raw files actually read:
  - `../lexical/packages/lexical-mark/src/MarkNode.ts`
  - `../lexical/packages/lexical-playground/src/commenting/index.ts`
  - `../lexical/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx`
- official source entrypoints checked:
  - `../lexical/README.md`
  - package sources under `../lexical/packages`
- strongest evidence found:
  - mark ids live in the editor tree
  - comment/thread metadata lives in a separate store
  - React portals and node-sized UI are a separate decorator lane
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/lexical/repo`

### Tiptap

- compiled pages inspected: none
- raw paths inspected:
  `../tiptap/packages/extensions/src`,
  `../tiptap/packages/extension-node-range/src`,
  `../tiptap/demos/src/Extensions/CollaborationMapPositions`
- direct raw files actually read:
  - `../tiptap/packages/extensions/src/focus/focus.ts`
  - `../tiptap/packages/extension-node-range/src/helpers/getNodeRangeDecorations.ts`
  - `../tiptap/demos/src/Extensions/CollaborationMapPositions/React/index.tsx`
- official source entrypoints checked:
  - `../tiptap/README.md`
  - package and demo sources under `../tiptap/packages` and `../tiptap/demos`
- strongest evidence found:
  - packaged product-layer comments and floating menus sit on top of
    ProseMirror decoration mechanics
  - node-range and focus helpers reinforce node/range channels, not one generic
    overlay blob
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/tiptap/repo`

### Premirror

- compiled pages inspected: none
- raw paths inspected: `../premirror`
- direct raw files actually read:
  - `../premirror/README.md`
- official source entrypoints checked:
  - `../premirror/README.md`
- strongest evidence found:
  - document truth, measurement, composition, and page viewport rendering are
    split into distinct stages
  - layout is derived from the editor state, not welded into the editor model
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/premirror/repo`

### Pretext

- compiled pages inspected: none
- raw paths inspected: `../pretext`
- direct raw files actually read:
  - `../pretext/README.md`
- official source entrypoints checked:
  - `../pretext/README.md`
- strongest evidence found:
  - `prepare()` and `layout()` split precomputation from hot-path layout
  - deterministic text measurement is the right future-facing answer for
    layout-heavy editor surfaces
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/pretext/repo`

### Slate

- compiled pages inspected: none
- raw paths inspected:
  `../slate`,
  `../slate-v2/packages/slate/src`,
  `../slate-v2/packages/slate-react/src`,
  local plan docs under `docs/plans`
- direct raw files actually read:
  - `../slate/Readme.md`
  - `../slate-v2/packages/slate/src/interfaces/editor.ts`
  - `../slate-v2/packages/slate/src/editor.ts`
  - `../slate-v2/packages/slate/src/core/draft-helpers.ts`
  - `../slate-v2/packages/slate-react/src/projection-store.ts`
  - `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
  - `docs/slate-v2/decorations-annotations-cluster.md`
- official source entrypoints checked:
  - `../slate/Readme.md`
  - local v2 package sources and tests
- strongest evidence found:
  - legacy Slate still frames itself around broad customizability and beta
    architecture
  - local Slate v2 already has runtime ids, snapshot indexes, projection
    slices, and bookmark/range-ref work that justify a cleaner overlay split
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the local comparison evidence into a dedicated `../raw/slate`
  family or an explicit local-override note

### edix

- compiled pages inspected: none
- raw paths inspected: `../edix`
- direct raw files actually read:
  - `../edix/README.md`
- official source entrypoints checked:
  - `../edix/README.md`
- strongest evidence found:
  - small, framework-agnostic `contenteditable` state manager
  - useful lower-bound reminder that not every editing surface deserves a full
    editor runtime
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/edix/repo`

### use-editable

- compiled pages inspected: none
- raw paths inspected: `../use-editable`
- direct raw files actually read:
  - `../use-editable/README.md`
- official source entrypoints checked:
  - `../use-editable/README.md`
- strongest evidence found:
  - hook-driven editable surfaces are good for small code/prose inputs
  - the hook works by restoring expected DOM state for React, not by becoming a
    full document engine
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/use-editable/repo`

### rich-textarea

- compiled pages inspected: none
- raw paths inspected: `../rich-textarea`
- direct raw files actually read:
  - `../rich-textarea/README.md`
- official source entrypoints checked:
  - `../rich-textarea/README.md`
- strongest evidence found:
  - native textarea-compatible highlighting/autocomplete surfaces are their own
    lane
  - caret-position and overlay positioning are exposed as explicit small-surface
    APIs instead of pretending to be a full rich-text engine
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/rich-textarea/repo`

### VS Code + comment/decor channels

- compiled pages inspected: none
- raw paths inspected: `../vscode/src/vscode-dts`
- direct raw files actually read:
  - `../vscode/src/vscode-dts/vscode.d.ts`
- official source entrypoints checked:
  - `../vscode/src/vscode-dts/vscode.d.ts`
- strongest evidence found:
  - decorations are channel/type based
  - comment threads are a separate controller surface with their own metadata
  - serious editors split visual channels instead of cramming them into one
    decoration API
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/vscode/repo`

### TanStack DB

- compiled pages inspected: none
- raw paths inspected: `../db`, `../db/packages/react-db/src`
- direct raw files actually read:
  - `../db/README.md`
  - `../db/packages/react-db/src/useLiveQuery.ts`
- official source entrypoints checked:
  - `../db/README.md`
  - package source under `../db/packages/react-db/src`
- strongest evidence found:
  - normalized collections, live queries, and `useSyncExternalStore` fit the
    annotation-store story far better than rerender-time arrays
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the official repo clone into `../raw/tanstack-db/repo`

### EditContext

- compiled pages inspected: none
- raw paths inspected: `../edit-context`
- direct raw files actually read:
  - `../edit-context/dev-design.md`
- official source entrypoints checked:
  - `../edit-context/dev-design.md`
- strongest evidence found:
  - IME formatting and text-input-service feedback are their own platform lane
  - geometry, selection, and shared-buffer synchronization stay explicit
- disposition: `evidenced`
- next action if this lane stays hot:
  normalize the local design-doc corpus into `../raw/editcontext`

## What this source page proves

This corpus is strong enough to support these claims:

- overlay architecture should split decorations, annotations, and widget UI
- durable public anchors should not stay trapped in `RangeRef`-shaped API
- public widget anchors should not use mutable Slate path addresses
- annotation metadata can stay outside the editor runtime while the runtime
  mirrors/indexes anchors
- serious decoration systems are mapped data or typed channels, not just one
  callback returning an array every render

## Remaining gaps

- current corpus storage is still a `structure gap` because these editor repos
  mostly live in `../`, not dedicated `../raw/<corpus>` families
- Open UI richer text fields, `urql`, and `@react-libraries/markdown-editor`
  remain supporting references, not deeply ingested corpora, for this lane
