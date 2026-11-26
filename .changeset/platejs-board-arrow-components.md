---
'platejs': patch
---

- Add `BoardArrowPath`, `BoardArrowhead` and `BoardArrowLabel` to `platejs/board/react`, three components that draw an arrow inside its `BoardShape`: an SVG `path` between the arrow's ends, an SVG `g` that draws its children at the arrow's end, and a `div` centered on the arrow's middle. An arrow drawn through them follows a moved, dragged or resized shape without a render.
- Remove the `BoardArrowPath` type export, because that name is now the arrow's line component. Use `NonNullable<ReturnType<typeof useArrowPath>>` where you need the type of the drawing that `useArrowPath` returns.
