---
'platejs': patch
---

Add `platejs/board` and `platejs/board/react`, a whiteboard block that keeps its notes, geo shapes, arrows, frames and pen lines in the document. It has rich text in notes, undo, Suggesting, copy and paste, HTML for the built-in shape types and Yjs sync. Markdown keeps only the shapes' text.

- Insert a board with `tx.plugin(BaseBoardPlugin).insert(props?, { at })`, and a shape into it with its shape plugin, such as `tx.plugin(BaseBoardNotePlugin).insert({ x, y }, { board })`. Each shape gets an id that is unique in the document
- Move, resize, restack and remove shapes by id with the board's `move`, `resize`, `restack` and `remove`, and paste a copied slice of shapes with `insertCopy(slice, { board })`
- Add your own shape with `defineBoardShape(type, options)`. It gets its id, place, size, stacking, frames, arrow binding, copy and paste and sync from the board
- Render a board with `BoardSurface` and its shapes with `BoardShape`. `useBoardView` and `useBoardActions` read and change the view's camera, tool and next style, which are never stored in the document
- Adding the board changes an editor's schema identity, so a Yjs room written before it refuses the editor. Seed a new room from the old room's document
