---
'@platejs/csv': patch
---

- Fixed Papa Parse interop so native Node ESM runtimes like Vitest can import `@platejs/csv` without failing on a CommonJS named export.
