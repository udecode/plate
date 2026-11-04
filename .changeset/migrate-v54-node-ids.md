---
'platejs': patch
---

`migrateV54` drops the block `id` that v53's `NodeIdPlugin` stored, so a v53 document edited with that plugin on migrates instead of failing the closed schema. An `id` the current schema owns stays. A legacy Toggle's `id` moves to Summary or Details when either owns it and is dropped otherwise.
