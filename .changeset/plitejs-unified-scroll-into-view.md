---
'plitejs': patch
---

- Unify `editor.api.dom.scrollIntoView` onto Plite's native scroll engine for all option combinations and remove the `scroll-into-view-if-needed` dependency. Calls with explicit `block`, `inline`, `behavior`, `boundary`, or `scrollMode` options now work inside iframes, preserve negative `scrollLeft` in RTL containers, account for CSS `transform: scale()`, walk nested scroll containers in `if-needed` mode, and respect `visualViewport` offset and root `scroll-padding`.
