---
"@platejs/core": patch
---

Synced latest changes from `main` into the beta lane and delete selected block
voids without merging following content into them.

Expose every plugin-owned one-shot command group through
`editor.plugin(Plugin).update`.

Preserve editor extension state types through `toPlatePlugin`.
