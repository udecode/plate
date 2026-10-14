---
"@platejs/markdown": patch
---

- Apply `disallowedNodes` to HTML and MDX elements by the key of their deserialize rule, so with `remark-mdx`, `disallowedNodes: ['a']` also removes `<a href>`.
