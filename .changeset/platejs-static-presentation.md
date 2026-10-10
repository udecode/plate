---
'platejs': patch
---

- Add `presentation` to `renderStaticHtml` and `exportDocx`. Pass the app's static kit, such as `BaseEditorKit`, when exporting a live editor, so each node draws with the static plugin of the same name instead of its editing component. A plugin with no static drawing renders without its component or wrapper and reports a `missing-static-presentation` diagnostic, which `exportDocx` counts as lost content.
- Throw a `TypeError` when `renderStaticHtml` `props` include `editor` or `document`.
- Take DOCX list levels from the indent of the block a list wraps when the list has no margin of its own.
- Fix DOCX export failing when an element that the stylesheet styles has a quoted value in its inline style, such as a callout's emoji font list.
