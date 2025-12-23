---
'@platejs/markdown': minor
---

Enhanced table cell serialization to support multiple blocks within cells:

- Table cells (td/th) now insert `<br/>` separators between multiple blocks when serializing to markdown
- This allows markdown tables to better represent complex cell content that contains multiple paragraphs or other block elements