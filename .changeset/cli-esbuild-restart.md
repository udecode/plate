---
'@platejs/cli': patch
---

- Restart esbuild's service when its process dies, so `plate generate --watch` and later builds in the same process keep working
