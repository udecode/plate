---
'plitejs': patch
---

- Refuse partial cross-block edits and pastes into read-only blocks, soft breaks inside read-only blocks, and writes inside named roots owned by read-only elements
- Preserve named-root selections during explicit-target fragment deletes, node wraps, and full-block text replacements, and fix split unwraps and deleted-range root resolution in named roots
