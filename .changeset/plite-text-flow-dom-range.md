---
'plitejs': patch
---

Fix `editor.api.dom.resolveDOMRange` and `resolveDOMPoint` returning a position in the page's old text or blocks when called right after an update, such as from a component that reads the editor's text. They now return `null` while the page's text differs from the editor's, including during IME composition, and `assertDOMPoint` and `assertDOMRange` throw in the same cases.
