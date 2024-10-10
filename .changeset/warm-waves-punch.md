---
'@udecode/plate-markdown': patch
---

Critical fix(`deserializeMd`): input `>`, `>>`, `>>>` should be deserialized to a single `blockquote` with empty text node.
