---
"@platejs/ai": patch
---

- Fixed AI streaming compatibility with markdown serialization changes. Streaming functions now explicitly set `preserveEmptyParagraphs: false` to prevent zero-width space interference during real-time streaming operations.