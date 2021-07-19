---
"@udecode/plate-core": patch
---

fix:
- Plugin handlers are now run when a handler is passed to `editableProps`
- If one handler returns `true`, slate internal corresponding handler is not called anymore
