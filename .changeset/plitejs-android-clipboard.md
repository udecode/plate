---
'plitejs': patch
---

- Fix Paste from the Android Chrome long-press menu, which inserted the text twice and could crash the page inside an inline element.
- Fix pasting several lines from Gboard's clipboard suggestion on Android. The lines landed in one paragraph with the last one stored twice, and inside a read-only inline element the editor showed text the document did not hold. Each line now becomes its own paragraph, once, also when the paste replaces a selection.
- Fix Copy writing nothing after typing in `VirtualizedEditable` or in decorated text, when the next selection comes without a mouse or key press, such as an Android long press.
