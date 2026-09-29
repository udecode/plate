---
'platejs': patch
---

- `aiChat.api.hide()`, `reset()`, `show()` and `reload()` cancel a streaming request without publishing its draft; only `stop()` and a completed response parse the current draft strictly, once
- An edit response Markdown cannot represent clears the draft, and `stop()` ends the request
- `setPreview` calls, the final one included, continue the latest partial parse of the same response and keep the objects of unchanged blocks; after a final parse, `hide()`, `reset()`, `reload()` or `submit()`, the next parse starts over
