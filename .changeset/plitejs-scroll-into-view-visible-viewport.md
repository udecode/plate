---
'plitejs': patch
---

- Keep the caret inside the part of the page a reader sees as you type, and keep the target of `editor.api.dom.scrollIntoView` there when the call passes no options. On a phone with the keyboard open, the caret stops above the keyboard instead of behind it, on iOS Safari and on Android Chrome. On Android Chrome this holds at the end of the document too, where the page can scroll no further and the browser's visual viewport moves instead. The page's `scroll-padding` keeps the caret clear of a fixed bar, and when the page cannot scroll far enough, the editor's scroll container scrolls the rest. An expanded selection scrolls to its focus end.
- Scroll to the caret's line when the caret sits on an empty line, where the browser reports an empty caret box. This also applies when `editor.api.dom.scrollIntoView` passes options.
