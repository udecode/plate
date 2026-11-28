---
'plitejs': patch
---

- Keep a peer's caret at the replacement point when a remote Yjs edit replaces text under it.
- Preserve document records when applying a `DocumentChange` after an earlier change on a document with no records.
