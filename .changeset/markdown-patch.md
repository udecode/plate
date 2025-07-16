---
'@platejs/markdown': patch
---

- Fixed markdown serialization of indented lists when using custom paragraph node types. The serializer now correctly identifies custom paragraph nodes instead of only looking for the default 'p' type.