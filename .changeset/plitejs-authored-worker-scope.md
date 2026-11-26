---
'plitejs': patch
---

Fix creating the `authored` plugin at module scope on Cloudflare Workers, which threw because it drew a random id on creation
