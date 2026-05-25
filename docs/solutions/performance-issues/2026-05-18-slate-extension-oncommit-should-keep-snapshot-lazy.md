---
title: Slate extension onCommit should keep snapshots lazy
date: 2026-05-18
category: performance-issues
module: slate-v2
problem_type: performance_issue
component: tooling
symptoms:
  - Renaming commitListeners to onCommit risked forcing snapshot creation for every extension commit callback.
  - Handlers that only needed commit metadata could accidentally pay for snapshot materialization.
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, extensions, oncommit, snapshots, performance]
---

# Slate extension onCommit should keep snapshots lazy

## Problem

Slate v2 moved extension authors from positional `commitListeners` to object-context
`onCommit`. A naive wrapper would call the internal two-argument listener shape
and force a snapshot even when the author only reads `commit`.

## Symptoms

- `onCommit({ commit })` looked cheap at the public API layer.
- The internal wrapper still had arity 2, so the commit notification path treated
  it as snapshot-hungry.
- The API rename risked adding hidden work to history, collaboration, analytics,
  and debugging extensions.

## What Didn't Work

- Passing `(commit, snapshot)` through to every `onCommit` wrapper. That keeps
  the old listener mechanics but defeats the snapshot laziness built into
  `notifyListeners`.
- Making authors choose between `onCommit` and a second no-snapshot callback.
  That would make the public API look split again.

## Solution

Keep the internal listener arity at 1, and expose `snapshot` as a lazy getter on
the public context:

```ts
registerCommitListener(editor, (commit) => {
  let snapshot: ReturnType<typeof getSnapshot> | null = null

  slots.onCommit?.({
    commit,
    editor,
    get snapshot() {
      snapshot ??= getSnapshot(editor)

      return snapshot
    },
  } as EditorCommitContext<TEditor>)
})
```

That lets normal handlers stay cheap:

```ts
onCommit({ commit }) {
  exportCommit(commit)
}
```

and keeps snapshot access available when it is actually needed:

```ts
onCommit({ snapshot }) {
  cacheChildren(snapshot.children)
}
```

## Why This Works

`notifyListeners` already uses listener arity to decide whether it should compute
the snapshot for commit listeners. A one-argument wrapper preserves that fast
path. The getter computes the snapshot only if author code reads it, and caches
the result for repeated reads inside the same callback.

## Prevention

- When converting positional listener APIs into object-context callbacks, check
  whether the old positional arity carried lazy-work semantics.
- Keep expensive context fields behind getters when most handlers only need the
  cheap fields.
- Add or keep contract coverage for both the metadata-only path and the
  snapshot-reading path when commit callbacks are part of the public extension
  API.

## Related Issues

- [Input rule context should provide lazy snapshot getters](../best-practices/input-rule-context-should-provide-lazy-snapshot-getters.md)
- [Slate public single-op writes should use editor apply and keep onChange behind subscribers](../developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md)
