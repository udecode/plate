---
'platejs': patch
---

Add `PagedEditorContent` to `platejs/pagination/react`, which renders Plate content with its plugin elements, marks, handlers and slots on measured pages. Install `@chenglou/pretext` when importing `platejs/pagination/react`.

In `PagedEditorContent`, text renderers and `placement: 'text'` mark components run once per piece of a text, with `piece: { index }`. Each measured run of the text on a drawn page is one piece, and one line can hold more than one run of the same text. The lines of a page not drawn yet form one piece, and a text that no layout measures is one piece.
