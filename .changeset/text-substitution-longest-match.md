---
'platejs': patch
---

Fix `createTextSubstitutionInputRule` applying a shorter pattern when a longer one also ends at the caret, so `!~=` turns into `≉` instead of `!≈`.
