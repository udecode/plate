---
'platejs': patch
---

Fix plugin and migration types that refused valid calls. A plugin portal now types its `component`. A callable plugin read root is called directly, without supplying its `this`. An `extend` stage of a plugin with no schema accepts a callable read root. `migrateDocument` requires `source` for any input with a `children` field, optional or not, and refuses it only for an envelope. `useExcalidrawSync` accepts any API object with the members it uses.
