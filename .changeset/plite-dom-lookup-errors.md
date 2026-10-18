---
'plitejs': patch
---

- Report every lifecycle error to `reportError` when no `lifecycleErrorSink` is set, as one `Error` whose message names its source and whose `cause` is the original error; use `console.error` where `reportError` does not exist
- Stop editor DOM lookups from throwing when the editor or a node has no DOM: `blur` and `deselect` on an unmounted editor clear focus and selection, a drop target resolves to `null`, and copying a void with no DOM still writes clipboard data
- Add `editor.api.dom.resolveDocumentOrShadowRoot()`, which returns `null` when the editor has no mounted root; `findDocumentOrShadowRoot()` still throws
- Return `null` from `domCoverage.resolveDOMPointOrBoundary` and `resolveDOMRangeOrBoundary` when a point has no DOM and no boundary covers it
- Report a `renderElement` that leaves an editable child without DOM or a DOM coverage boundary to `lifecycleErrorSink` with `source: 'render-element'`, after the element renders in development and when selection export into that child fails in any build
