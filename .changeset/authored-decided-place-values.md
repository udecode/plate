---
'plitejs': patch
---

- Fix deciding a suggestion crashing or coming back invalid when a retype, wrap or unwrap leaves a block or its text a value its new place cannot hold; the decision now drops that value, or waits while another pending suggestion still decides that place
- Fix Yjs peers stopping with an admission error when concurrent edits leave a value where the merged place refuses it; every peer now drops that value and keeps a pending suggestion's mark on it
