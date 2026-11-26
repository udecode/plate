---
'plitejs': patch
---

- Allow `tx.records.put` and `tx.records.drop` in the same `editor.update` after a text or node edit whose intermediate draft is not yet canonical, normalizing and validating the draft at commit as usual.
