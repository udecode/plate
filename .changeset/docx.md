---
'@udecode/plate-docx-serializer': minor
---

- deserialize line-height in paragraph and headers
- deserialize tabs
- deserialize block marks: copy block marks to a new span child
- fix a juice bug: juice ignores the first class when there is <!-- just after style, so we remove it