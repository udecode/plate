---
'plitejs': patch
---

- Fix re-entrant commits delivering a later commit's snapshot to outer `subscribeCommit` and `afterCommit` listeners or rolling `editor.read.lastCommit()` backward.
- Fix named-root selections leaking onto main-root snapshots built by selection-only commits or cold snapshot reads.
- Type `BaseEditor.subscribeCommit` with `EditorCommitListener<V>` instead of `EditorCommitListener<any>`.
