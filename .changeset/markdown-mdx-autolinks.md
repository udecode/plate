---
"@platejs/markdown": patch
---

Fixed `deserializeMd` with `remark-mdx` dropping the rest of the document after a CommonMark autolink such as `<user@example.com>` or `<https://example.com>`. Autolinks are now parsed as links, as they are without MDX, so `serializeMd` output that contains them also deserializes again.
