---
"@udecode/plate-md-serializer": patch
---

Markdown deserializer was breaking the pasting of a simple URL into the editor. Now checks the content and if it's simply a URL, it skips the handling of the content as markdown
