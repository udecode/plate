---
'plitejs': patch
---

Resolve DOM operations through the active mounted surface when several Editables share an editor. Retiring one surface preserves node and point resolution in the surviving focused surface. DOM-scope hooks follow focus changes and mounted-view retirement.

Cancel pending scrolling with the cleanup function returned by `editor.api.dom.scrollIntoView(target, options)`.
