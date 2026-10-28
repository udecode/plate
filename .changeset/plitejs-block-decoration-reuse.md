---
'plitejs': patch
---

- Paint a decoration range that sits on one text without the general range projection, and reuse an unchanged frozen one, so typing in a large highlighted code block no longer recomputes every syntax range
