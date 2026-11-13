---
'platejs': patch
---

Add `platejs/board` and `platejs/board/react`, a whiteboard block that keeps its notes, geo shapes, arrows, frames and pen lines in the document. It has rich text in notes, undo, Suggesting, copy and paste, HTML for the built-in shape types and Yjs sync. Markdown keeps only the shapes' text.

- Insert a board with `tx.plugin(BaseBoardPlugin).insert(props?, { at })`, and a shape into it with its shape plugin, such as `tx.plugin(BaseBoardNotePlugin).insert({ x, y }, { board })`. Each shape gets an id that is unique in the document
- Move, resize, restack and remove shapes by id with the board's `move`, `resize`, `restack` and `remove`, and paste a copied slice of shapes with `insertCopy(slice, { board })`
- Duplicate a board, or shapes in one, with `tx.blocks.duplicate`. The copy's arrows and frames point at the copied shapes. Shapes duplicated inside a board land above every shape of their layer, stepped off their sources in 24px steps, as pasted shapes do, and a duplicated board keeps its shapes where they were
- Add your own shape with `defineBoardShape(type, options)`. It gets its id, place, size, stacking, frames, arrow binding, copy and paste and sync from the board
- Render a board with `BoardSurface` and its shapes with `BoardShape`. Pass `height`, such as `'100%'`, to `BoardSurface` to draw that view at a height other than the board's stored one, so a board can fill its page. `useBoardView` and `useBoardActions` read and change the view's camera, tool and next style, which are never stored in the document
- Pass every word the board says to `BoardSurface` as its required `messages` prop, typed `BoardMessages`: its label, and what it says when a shape is selected, a tool is picked or shapes are removed. The view that holds focus says one message per action through the editor's status region, and `BoardShapeDescription` tells your words a shape's kind, text and, for an arrow, the shapes its ends attach to
- Adding the board changes an editor's schema identity, so a Yjs room written before it refuses the editor. Seed a new room from the old room's document
