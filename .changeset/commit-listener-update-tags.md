---
'plitejs': patch
---

- Fix an update that a commit listener starts taking on the tags of the update that just committed. An edit a listener makes while the Yjs binding imports a teammate's change now reaches the teammate and the listener's own Yjs document, and History records it so undo can take it back. A listener whose update should skip collaboration or History now passes `skip-collab` or `history-skip` itself.
- Fix the Yjs binding dropping the edits a plugin chains from its commit listener, which left the editor and its Yjs document different.
