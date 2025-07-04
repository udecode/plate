---
"@platejs/core": patch
---

Fixed `getSelectedDomFragment` to correctly handle partial text selections at the beginning or end of selected blocks by deserializing only the selected portion instead of the entire block.