---
'plitejs': patch
---

- Fix the placeholder showing over an IME composition in an empty editor; it now hides while the composition is open in every browser, not only on Android
- Fix Safari deleting the character before the caret when Backspace cancels an IME composition
