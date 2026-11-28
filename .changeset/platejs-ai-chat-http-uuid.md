---
'platejs': patch
---

- Fall back from `crypto.randomUUID` in `AIChatPlugin` so AI chat requests work on non-secure HTTP origins
