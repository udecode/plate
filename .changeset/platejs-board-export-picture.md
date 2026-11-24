---
'platejs': patch
---

- Add `exportPicture({ format, kit })` to `useBoardActions()` in `platejs/board/react`. It draws the board as a PNG or an SVG with the static plugins in `kit`. When shapes are selected, it draws those shapes and the members of each selected frame. It reads the selection when it is called. `kit` may be a promise of the plugins, such as a dynamic import. It resolves `null` when there is nothing to draw, such as on an empty board. It rejects when the board is not on the page or leaves it before the picture is drawn. It loads its drawing code on the first call.
- Add the `BoardPicture`, `BoardPictureOptions` and `BoardPictureWarning` types. A picture's warnings name, by shape id, each image it could not read and each shape it could not draw. They also say once that a font could not be embedded, that other content could not be drawn, or that the PNG was made smaller to stay within 16,384 px a side and 16,777,216 px in all. A static drawing that marks an element `data-board-image-unreadable` gets an image warning for its shape.
