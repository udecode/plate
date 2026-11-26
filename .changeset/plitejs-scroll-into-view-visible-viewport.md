---
'plitejs': patch
---

- Keep the target of `editor.api.dom.scrollIntoView` inside the part of the page a reader sees when the call passes no options. On a phone with the keyboard open, the target stops above the keyboard instead of behind it, on iOS Safari and on Android Chrome. The page's `scroll-padding` keeps the target clear of a fixed bar, and when the page cannot scroll far enough, the editor's scroll container scrolls the rest. An expanded selection scrolls to its focus end.
- Scroll to the caret's line when the caret sits on an empty line, where the browser reports an empty caret box. This also applies when the call passes options.
