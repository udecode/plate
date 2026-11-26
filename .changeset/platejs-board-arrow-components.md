---
'platejs': patch
---

- Replace `useArrowPath` and its `BoardArrowPath` type in `platejs/board/react` with three components that draw an arrow inside its `BoardShape`. `BoardArrowPath` is an SVG `path` between the arrow's ends, `BoardArrowhead` is an SVG `g` that draws its children at the arrow's end, and `BoardArrowLabel` is a `div` centered on the arrow's middle. An arrow follows a moved, dragged or resized shape without a render. The components draw the straight arrow the board stores.

**Migration:** Copy the `board` registry item again with all its files, because the static arrow draws the head that `board-styles` exports as `ARROW_HEAD`. In your own arrow renderer, remove the `useArrowPath(element)` call and its early return, then draw the path and head in an SVG and the label beside it. A press picks an arrow only when it lands on one of the arrow's elements, so keep a wide transparent path with `pointerEvents="stroke"`:

```tsx
<BoardShape {...props}>
  <div className="absolute top-0 [left:0]" contentEditable={false}>
    <svg className="pointer-events-none overflow-visible" height={1} width={1}>
      <BoardArrowPath
        pointerEvents="stroke"
        stroke="transparent"
        strokeWidth={14}
      />
      <BoardArrowPath fill="none" stroke="currentColor" />
      <BoardArrowhead>
        <polygon fill="currentColor" points={ARROW_HEAD} />
      </BoardArrowhead>
    </svg>
  </div>
  <BoardArrowLabel>{props.children}</BoardArrowLabel>
</BoardShape>
```
