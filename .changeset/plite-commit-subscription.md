---
'plitejs': major
---

Remove `editor.subscribe`, the `subscribe` and `subscribeCommit` helpers from `plitejs/testing` and `plitejs/internal`, and the `SnapshotListener` and `EditorCommitSource` type exports. Observe commits with `editor.subscribeCommit((commit, snapshot) => ...)`, which receives the published snapshot as its second argument.

**Migration:** Swap the listener's arguments:

```ts
// Before
editor.subscribe((snapshot, commit) => save(snapshot));

// After
editor.subscribeCommit((commit, snapshot) => save(snapshot));
```

A commit listener can run before a mounted editor updates its DOM, so read rendered DOM from a React effect.
