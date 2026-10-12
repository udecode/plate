---
"@platejs/docx-io": patch
---

Fix `<br>` export: Word for Mac no longer labels it as a text wrapping break, and Word no longer stretches the justified line that ends with it, a setting that applies to the whole document.
