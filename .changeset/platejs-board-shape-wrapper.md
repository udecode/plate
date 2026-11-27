---
'platejs': patch
---

- Place each board shape's root in a `div` that carries the shape's box, stacking rank and drag offset, and make the root fill it. Read a shape's inline `left`, `top`, `width`, `height`, `z-index` or `translate`, and its `offsetLeft` and `offsetTop`, on the root's `parentElement`. A private `@layer board-shapes` style rule prepended to the root makes the wrapper take no press and restores `pointer-events: auto` on `[data-board-shape]` (set `inert` on an ancestor to disable pointer input on a board). The root keeps its `className`, marks and non-placement `style`, uses `box-sizing: border-box`, and ignores `all`, offsets, margins, `width`, `height`, `position` and grid placement or self-alignment keys from `style`.
