---
'platejs': patch
---

- Move render prop types off root `platejs`: import `RenderElementProps`, `RenderLeafProps`, `RenderTextProps`, `RenderTextHostProps`, and `RenderTextPieceProps` from `platejs/react`, and import `StaticRenderLeafProps`, `RenderStaticNodeWrapper`, `RenderStaticNodeWrapperFunction`, and `RenderStaticNodeWrapperProps` from `platejs/static`.
- Pass `attributes` into `render.mark.textAttributes` callbacks during static HTML rendering, matching React rendering.
