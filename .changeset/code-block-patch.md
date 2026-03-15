---
'@platejs/code-block': patch
---

- Fixed normalizer using `setNodes` instead of `wrapNodes` for bare text children in `code_block`, which produced malformed `code_line` nodes (e.g. `{ text: "...", type: "code_line" }` instead of proper element structure). This caused syntax highlighting to only work on the first line.
- Fixed `insertBreak` not resetting the decoration cache after splitting, so new lines now get syntax highlighting immediately.
