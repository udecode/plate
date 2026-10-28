---
'plitejs': patch
---

- Fix a word typed over a selection losing letters when a Yjs peer deletes the selected text at the same time. Typing `Lisa` over `Lin` while a peer offline deleted `Lin` left `isa` or `sa`; both peers now keep `Lisa`.
