---
"@platejs/core": patch
---

Fix `createTextSubstitutionInputRule` not firing on the final character of flat matches (e.g. `->` → `→`, `(c)` → `©`)
