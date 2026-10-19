---
'platejs': patch
---

- Highlight a code block once per block instead of once per text node, reusing unchanged blocks' highlighting across rendered documents without indexing each document
- Read decoration sources without resolving the plugin on every property access, which makes decoration reads over large documents several times cheaper
