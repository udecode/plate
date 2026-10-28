---
'plitejs': patch
---

- Fix Paste from the Android Chrome long-press menu, which inserted the text twice and could crash the page inside an inline element.
- Fix Copy writing nothing after typing in `VirtualizedEditable` or in decorated text, when the next selection comes without a mouse or key press, such as an Android long press.
