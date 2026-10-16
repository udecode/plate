---
"@platejs/markdown": patch
---

- Deserialize reference links and images (`[text][id]`, `[id][]`, `[id]`, `![alt][id]`) as `a` and `img` nodes using the matching definition's URL. They were dropped before, so a paragraph holding only a reference link came back empty.
