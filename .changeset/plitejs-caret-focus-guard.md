---
'plitejs': patch
---

- When app code moves focus during an editor focus call, a selection export, a caret repair or a queued selection clear, focus and the caret stay where the app put them, and the editor no longer marks itself focused while it does not hold focus
