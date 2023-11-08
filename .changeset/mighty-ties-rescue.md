---
'@udecode/plate-serializer-docx': patch
---

Before sending DOCX HTML to be deserialized, wrap it in a `<div>` with `white-space: pre-wrap` to prevent white space from being collapsed.
