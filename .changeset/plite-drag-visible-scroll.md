---
'plitejs': patch
---

Scroll a custom pointer drag one step with `editor.api.dom.drag.autoScroll({ x, y })`, which returns the pixels scrolled, and read the part of an element the user can see with `editor.api.dom.visibleRect(element)`.

Text selection and block drags near an edge scroll the innermost scroller whose visible edge is under the pointer, including a scroller taller than the window or cut off by an outer scroller, and scroll down near the bottom of a short visible strip.
