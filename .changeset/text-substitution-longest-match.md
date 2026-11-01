---
'platejs': patch
---

Fix `createTextSubstitutionInputRule` applying a shorter pattern when a longer one of the same rule also ends at the caret, so `!~=` turns into `≉` instead of `!≈`.
