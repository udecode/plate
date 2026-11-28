---
'platejs': patch
---

Add `'image'` to `BoardShapeDescription['kind']` (reporting child caption or `alt` text), announce keyboard-placed free text, mark active keyboard-resize corners with `data-board-resize-corner`, coalesce held arrow-key nudges into one undo step, and keep sibling boards and portaled menus isolated on `Escape`.

**Migration:** If your `BoardMessages` implementation maps `BoardShapeDescription['kind']` exhaustively, add an `image` label:

```ts
const KINDS: Readonly<Record<BoardShapeDescription['kind'], string>> = {
  arrow: 'Arrow',
  frame: 'Frame',
  geo: 'Shape',
  image: 'Image',
  note: 'Note',
  shape: 'Shape',
  stroke: 'Line',
  text: 'Text',
};
```
