---
title: Slate history capture must anchor to commit subscribers, not onChange order
type: solution
date: 2026-04-03
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - slate-history
  - transactions
  - history
  - undo
  - onChange
  - commit
  - ordering
---

# Problem

`slate-history-v2` looked transaction-aware at first glance, but the first architect review found a real seam leak.

History batches were being derived in a `subscribe(...)` listener that ran **after** `editor.onChange()`. That meant a reentrant `onChange()` edit could smear or misattribute history units even though the stack was supposed to be anchored to committed transactions.

# Root Cause

The core publish order in [core.ts](/Users/zbeyens/git/slate/packages/slate-v2/src/core.ts) was wrong for history capture.

The sequence was:

1. publish the committed snapshot
2. update public editor fields
3. call `editor.onChange()`
4. notify `Editor.subscribe(...)` listeners

That ordering left history downstream of app callbacks instead of at the commit seam itself.

As soon as `slate-history-v2` derived batches from `editor.operations` and `previousSnapshot` inside a subscriber, the proof depended on callback ordering luck rather than committed transaction boundaries.

# Solution

Move `Editor.subscribe(...)` notification ahead of `editor.onChange()` in `slate-v2`.

The fix lives in [core.ts](/Users/zbeyens/git/slate/packages/slate-v2/src/core.ts).

Before:

```ts
state.snapshot = snapshot
state.transaction = null
;(editor as MutableEditor).operations = transaction.operations.slice()
syncPublicEditor(editor, snapshot)
editor.onChange()

for (const listener of state.listeners) {
  listener(snapshot)
}
```

After:

```ts
state.snapshot = snapshot
state.transaction = null
;(editor as MutableEditor).operations = transaction.operations.slice()
syncPublicEditor(editor, snapshot)

for (const listener of state.listeners) {
  listener(snapshot)
}

editor.onChange()
```

With that ordering in place, `slate-history-v2` can safely capture:

- `previousSnapshot`
- the newly committed snapshot
- the committed `editor.operations`

without treating app-level `onChange()` side effects as part of the same history unit.

# Why This Works

History is not an app callback concern. It is a commit concern.

Once the committed snapshot exists, the earliest trustworthy place to derive a history batch is the commit subscriber boundary. That boundary still sees:

- the exact committed snapshot
- the exact committed operation list
- no userland reentrant edits yet

Calling `editor.onChange()` afterward keeps userland notification intact, but removes it from the authority chain for history capture.

That gives `slate-history-v2` the one thing it actually needs: a stable, pre-userland view of each committed transaction.

# Prevention

- If a subsystem claims to be transaction-aware, derive its state at the commit boundary, not from app callbacks.
- Treat `editor.onChange()` as userland notification, not as a reliable source of commit metadata.
- When adding new commit-time subsystems, ask one blunt question first:
  - “If `onChange()` reenters the editor, does this subsystem still capture the original commit correctly?”
- Keep a regression test whenever a proof package depends on commit ordering across package boundaries.
- If a design needs “callbacks probably won’t reenter here,” that design is already rotten.

# Related Issues

- [#5587 Grammarly suggestion undo granularity](https://github.com/ianstormtaylor/slate/issues/5587)
- [#4559 undo deleteFragment should reselect restored content](https://github.com/ianstormtaylor/slate/issues/4559)
