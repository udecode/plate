---
'plitejs': patch
---

- Add `tx.break.exit({ before?, match? })` to leave the structure around the selected block and insert the default block its parent declares there. It returns `false` and changes nothing when that parent declares no default block or has no room for it
