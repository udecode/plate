---
"@udecode/slate-plugins-list": patch
---

fix:
- Indenting multiple list items was not working as expected
- Normalizer: lists without list items are deleted
- Unindent a list item should not delete the list at the first level
