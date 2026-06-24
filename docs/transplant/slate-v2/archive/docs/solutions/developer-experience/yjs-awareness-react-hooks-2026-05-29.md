---
title: Yjs awareness React hooks need explicit external-store subscriptions
date: 2026-05-29
category: docs/solutions/developer-experience
module: slate-yjs
problem_type: developer_experience
component: tooling
symptoms:
  - Remote cursor state changed without a Slate document commit.
  - React hooks could read stale awareness data if they subscribed only to Slate commits.
  - Generic `Editor` reads did not expose `state.yjs` to TypeScript.
root_cause: incomplete_setup
resolution_type: code_fix
severity: medium
tags: [slate-yjs, awareness, react, external-store, cursor]
---

# Yjs awareness React hooks need explicit external-store subscriptions

## Problem

Yjs awareness is presence state, not document state. Remote cursor changes can
arrive without any Slate operation, so React hooks that depend only on editor
commit subscriptions miss updates.

## Symptoms

- `tx.yjs.sendSelection(...)` updates awareness but must not add a Yjs document
  trace entry.
- Remote awareness changes need to re-render cursor UI even when the Slate value
  is unchanged.
- A `@slate/yjs/react` hook reading `state.yjs` from a generic `Editor` fails
  package typecheck because extension groups are not visible on that generic
  state view.

## What Didn't Work

- Treating cursor movement as a document commit would make presence pollute
  collaboration history.
- Relying on Slate React commit selectors alone misses awareness changes that
  bypass the editor transaction pipeline.
- Reading `state.yjs` directly from `EditorCoreStateView` in a public hook does
  not typecheck for callers whose editor type does not encode installed
  extensions.

## Solution

Keep awareness state outside the document model, but expose a small subscription
surface from the Yjs controller:

```ts
state.yjs.awarenessRevision()
state.yjs.subscribeAwareness(listener)
state.yjs.remoteCursors()
```

The controller increments the revision and notifies subscribers from the
awareness `change` listener, plus local connect/disconnect changes. The React
entry then uses `useSyncExternalStore`:

```ts
export function useYjsAwarenessRevision(editor: Editor) {
  return useSyncExternalStore(
    (listener) =>
      readYjsState(editor, (state) => state.subscribeAwareness(listener)),
    () => getYjsAwarenessRevision(editor),
    () => getYjsAwarenessRevision(editor)
  )
}
```

The hook reads `state.yjs` through a local typed accessor so the public API can
accept a plain `Editor` while keeping the extension-specific cast contained in
`@slate/yjs/react`.

## Why This Works

Awareness traffic has its own lifecycle and should re-render presence UI without
touching Slate history or Yjs document traces. `useSyncExternalStore` matches
that lifecycle: React subscribes to the controller's awareness revision, and
render reads the latest resolved remote cursors from `state.yjs`.

The typed accessor avoids leaking extension-installation generics into every
hook call. The runtime still requires the Yjs extension; the type compromise is
local and explicit.

## Prevention

- Presence hooks should subscribe to awareness events, not only Slate document
  commits.
- Keep cursor payloads as Yjs relative-position JSON and resolve them at read
  time so they rebase through document edits.
- Add package tests that assert awareness changes do not write operation trace,
  disconnected peers expose no remote cursors, and remote cursor selections
  rebase through moved-node identity.

## Related Issues

- `docs/solutions/test-failures/yjs-example-client-id-determinism-2026-05-28.md`
- `docs/solutions/ui-bugs/slate-react-selection-export-must-respect-other-editor-roots-2026-05-25.md`
