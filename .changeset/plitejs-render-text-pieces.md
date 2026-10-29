---
'plitejs': patch
---

Add `RenderTextHostProps` and `RenderTextPieceProps` to `plitejs/react`, and type `RenderTextProps` as their union. Narrow on `piece` before you read `attributes.ref` or another host-only attribute.
