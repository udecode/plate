---
"@platejs/plite": patch
---

Fix crash when pasting text with multiple line-breaks exceeding `maxLength` constraint. Filter out elements whose children are completely trimmed when remaining character budget is exhausted in `limitNode`, preventing empty-children elements (`{ children: [] }`) from entering the document model.
