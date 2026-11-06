---
'platejs': patch
---

- Fix AI edit requests when the view that sent them turns read-only and another view stays writable. Stop now aborts the request, the response ends without an error, and the request writes no suggestion
- Fix a Markdown plugin error during the final parse leaving an AI request streaming after Stop or a natural finish
