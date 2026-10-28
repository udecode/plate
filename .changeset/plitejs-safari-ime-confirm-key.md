---
'plitejs': patch
---

Fix Safari splitting the line before a word that an input method confirms with Return. Safari sends that key after `compositionend` with keyCode 229; the editor now runs none of its own key commands for it and leaves the caret after the word, and `onKeyDown` still receives it.
