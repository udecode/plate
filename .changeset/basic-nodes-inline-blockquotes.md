---
'@platejs/basic-nodes': major
---

- Treat blockquotes as text blocks with inline children
- Register built-in marks as boolean text properties in compiled schemas

**Migration:** Store text and inline nodes directly in blockquote children instead of nested paragraphs.
