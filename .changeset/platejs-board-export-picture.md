---
'platejs': patch
---

- Add `exportPicture({ format, kit })` to `useBoardActions()` in `platejs/board/react`. It draws the board, or the selected shapes and frames, as a PNG or an SVG with the static plugins in `kit`, which may be a promise such as a dynamic import. It resolves `null` when there is nothing to draw, and rejects when the board is not on the page.
- Add the `BoardPicture`, `BoardPictureOptions` and `BoardPictureWarning` types. A picture's warnings name each image it could not read and each shape it could not draw, and say when a font could not be embedded or a large PNG was scaled down.
