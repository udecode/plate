---
'@platejs/code-block': patch
---

- Fixed `formatCodeBlock` to rewrite formatted code into real `code_line` nodes and trigger a redecorate pass so syntax highlighting persists after formatting.
