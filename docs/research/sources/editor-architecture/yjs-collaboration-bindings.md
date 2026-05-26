---
title: Yjs collaboration binding architecture
type: source
status: accepted
updated: 2026-05-18
source_refs:
  - ../slate-v2/packages/slate/src/core/editor-extension.ts
  - ../slate-v2/packages/slate/test/collab-adapter-extension-contract.ts
  - ../slate-v2/packages/slate/test/collab-selection-stress-contract.ts
  - ../slate-v2/packages/slate/test/collab-bookmark-position-contract.ts
  - ../slate-v2/packages/slate/test/collab-canonical-reconcile-contract.ts
  - ../slate-v2/packages/slate-react/test/selection-side-effect-policy-contract.ts
  - ../slate-yjs/packages/core/src/plugins/withYjs.ts
  - ../slate-yjs/packages/core/src/plugins/withYHistory.ts
  - ../slate-yjs/packages/core/src/plugins/withCursors.ts
  - ../slate-yjs/packages/core/src/utils/position.ts
  - ../lexical/packages/lexical-yjs/src/Bindings.ts
  - ../lexical/packages/lexical-yjs/src/SyncEditorStates.ts
  - ../lexical/packages/lexical-yjs/src/SyncCursors.ts
  - ../lexical/packages/lexical-yjs/src/index.ts
  - ../y-prosemirror/src/commands.js
  - ../y-prosemirror/src/undo-plugin.js
  - ../y-prosemirror/src/cursor-plugin.js
related:
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md
---

# Yjs collaboration binding architecture

## Purpose

Compile the local Slate v2, external slate-yjs, Lexical Yjs, and
y-prosemirror evidence that matters to a first-party Slate v2 `slate-yjs`
package.

This page is about binding architecture, not provider hosting policy.

## Strongest Evidence

- Live Slate v2 rejects legacy extension slots such as `register`,
  `commitListeners`, `commands`, `methods`, and `operationMiddlewares`; the
  current extension path is `setup(...)`, `onCommit(...)`, runtime state, and
  state/tx namespaces.
- Live Slate v2 already proves the collaboration substrate in focused tests:
  loop suppression, remote replay through `editor.update`, skip-history remote
  metadata, selection stress, bookmarks, canonical reconcile, and React
  selection-side-effect suppression.
- The current `../slate-v2/packages/slate-yjs` folder is not source. It only
  contains residue such as `dist/`, `.turbo`, and empty source/test folders,
  with no `package.json`.
- External `slate-yjs` has useful CRDT mechanics: Y.XmlText representation,
  local-origin grouping, remote event application, relative-position mapping,
  Y.UndoManager integration, and awareness cursor propagation.
- External `slate-yjs` also proves what Slate v2 should not port directly:
  wrapper APIs mutate the editor by assigning `children`, overriding `apply`,
  overriding `onChange`, and restoring selection through legacy transforms.
- Lexical Yjs keeps collaboration state in a package-owned binding object,
  precomputes Y event deltas inside the Y event callback, tags collaboration
  updates to suppress scroll, and repairs empty documents after sync.
- Lexical Yjs cursor code keeps cursor DOM outside the document model and
  tears down cursor DOM explicitly.
- y-prosemirror has the sharpest pause/reconfigure and undo-selection lessons:
  pause sync by rebinding the Y type, use canonical replace as the reliable
  fallback, store selection bookmarks through relative positions, and keep
  awareness identity tied to the awareness doc.

## What To Steal

### 1. Extension-owned binding state

Slate v2 should expose `createYjsExtension(...)`, not a `withYjs(editor)`
wrapper.

The binding/controller should exist, but it should be owned by the extension
runtime and surfaced through `state.yjs` and `tx.yjs`. That follows live Slate
v2 extension tests and avoids editor-object mutation.

### 2. Commit-driven local export

Local export should observe Slate commits through `onCommit(...)`.

It should skip disconnected, paused, remote, `skip-collab`, and
selection-only/awareness-only updates before converting local operations to one
Yjs transaction.

### 3. Remote import through Slate transactions

Yjs events should import through `editor.update((tx) => ...)`.

Use incremental operation replay when conversion is safe. Use canonical
`tx.value.replace(...)` from the shared root when conversion is ambiguous or
the binding is reconnecting.

Remote imports must carry collaboration/history/selection metadata so they do
not export back, pollute undo, steal focus, or scroll the active editor.

### 4. Relative positions as the durable collaboration bridge

Slate selections and bookmarks should map to Y relative positions for:

- remote cursor awareness
- undo selection metadata
- bookmark restoration after remote edits
- Playwright selection repros

The package should borrow external `slate-yjs` conversion mechanics and
y-prosemirror's relative-selection undo posture, then prove them against Slate
v2 bookmark and browser-selection tests.

### 5. Awareness as an external store

Awareness belongs outside document commits.

React hooks in `slate-yjs/react` should subscribe narrowly to cursor/awareness
state with external-store semantics. Cursor movement should not require a Slate
document commit.

### 6. Pause/reconfigure lifecycle

The package needs explicit connect, disconnect, pause, resume, flush, and
reconcile commands under `tx.yjs`.

y-prosemirror's `pauseSync` and `configureYProsemirror` are the right
mechanism class; ProseMirror's plugin API is not the target API shape.

## What Not To Steal

- Do not copy external `slate-yjs` editor wrappers as the public API.
- Do not assign `editor.children` directly.
- Do not override `editor.apply` or `editor.onChange`.
- Do not expose Yjs provider/room/auth policy from raw Slate.
- Do not put Yjs objects into Slate document values.
- Do not treat Lexical class nodes or y-prosemirror plugin complexity as a raw
  Slate requirement.
- Do not publish public undo/redo commands until selection restoration passes
  unit and Playwright proof.

## Take For Slate v2

The package target should be:

```txt
createYjsExtension(options)
state.yjs.*
tx.yjs.*
slate-yjs/core pure conversion helpers
slate-yjs/react external-store cursor hooks
```

The package should recreate `packages/slate-yjs` as source, using the current
Slate v2 extension/state/tx substrate. The old external `withYjs` family is
evidence, not the API.

## Evidence Ledger

| Corpus | Strongest files inspected | Disposition | Slate v2 target |
| --- | --- | --- | --- |
| Current Slate v2 | `editor-extension.ts:162-233`, `:566-581`; collaboration contract tests | evidenced | extension `setup`/`onCommit`, runtime state, state/tx namespaces |
| Current `packages/slate-yjs` | `find ../slate-v2/packages/slate-yjs -maxdepth 3 -type f` | source package gap | hard-cut residue and recreate source package |
| External slate-yjs | `withYjs.ts:156-283`, `withYHistory.ts:58-182`, `withCursors.ts:160-269`, `position.ts:10-80` | evidenced, mechanism-only | reuse conversion/origin/undo/cursor lessons, reject wrapper mutation |
| Lexical Yjs | `Bindings.ts:25-127`, `SyncEditorStates.ts:134-174`, `index.ts:90-150`, `SyncCursors.ts:168-325` | evidenced | package-owned binding, delta precompute, update tags, cursor cleanup |
| y-prosemirror | `commands.js:12-66`, `undo-plugin.js:23-227`, `cursor-plugin.js:95-296` | evidenced | pause/reconfigure, relative-selection undo, awareness identity |
| Compiled research layer | this page | compile gap closed | reusable research entrypoint for `slate-yjs` package planning |

Remaining gap: implementation and browser proof still do not exist. This page
proves the architecture target, not package readiness.
