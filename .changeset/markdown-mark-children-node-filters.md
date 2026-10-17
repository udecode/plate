---
"@platejs/markdown": patch
---

- Apply `allowedNodes`, `disallowedNodes` and `allowNode` to the children of bold, italic and strikethrough, so `disallowedNodes: ['a']` also removes a link inside `**…**`. An `allowedNodes` list now needs `text`, and any inline type such as `a`, listed to keep that content inside these marks, as it already does outside them.
