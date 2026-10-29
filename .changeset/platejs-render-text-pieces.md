---
'platejs': patch
---

Add `RenderTextHostProps` and `RenderTextPieceProps` to `platejs`, and type `RenderTextProps` as their union. Narrow on `piece` before you read `attributes.ref` or another host-only attribute.

Type the host's `attributes.ref` as a span ref instead of `any`. A text renderer that spreads `attributes` onto an element such as `<a>` or `<div>` fails typecheck; spread them onto a `span` and nest that element inside it.
