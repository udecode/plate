---
'platejs': patch
---

- Add `presentation` to `renderStaticHtml` and `exportDocx`. Pass the app's static kit, such as `BaseEditorKit`, when exporting a live editor, so each node draws with the static plugin of the same name instead of its editing component. A plugin with no static drawing renders without its component or wrapper and reports a `missing-static-presentation` diagnostic, which `exportDocx` counts as lost content. The kit compiles without activating its plugins.
- Throw a `TypeError` when `renderStaticHtml` `props` set `editor` or `document` to a value.
- Take DOCX list levels from the indent of the block a list wraps when the list has no margin of its own.
- Fix DOCX export failing when an element that the stylesheet styles has a quoted value in its inline style, such as a callout's emoji font list.
- Mark the drawings of `CopilotPlugin` edit-only, so an export with `presentation` leaves out its ghost text instead of reporting a `missing-static-presentation` diagnostic.
- Export equations as Word math built from KaTeX's MathML. An equation that uses notation the converter does not cover, such as a matrix, exports its TeX as text inside a Word equation. Install `katex@0.16.22` with Word export, which draws equations with it.
- Import Word math in the body as `equation` and `inlineEquation` nodes, with TeX rebuilt from the equation's structure, and in comment bodies as TeX text. Import flattens a tracked revision inside an equation and reports an `unsupported-content` diagnostic.
- Export a task list item, an `li` with `data-checked`, with a ☑ or ☐ list marker at its list level, and import a Word bullet level drawn as ☐, ☑ or ☒ as a task item with its checked state.
- Export a table cell's lists, task items, code blocks, equations, images, heading styles and nested tables as the body exports them, and size a nested table and its images to the cell that holds them.
- Export a numbered or bulleted heading or blockquote with its text, its heading style and bookmark or its quote border, and its Word list number.
- Leave colors, fonts and sizes of the DOCX drawings to `stylesheet`. A callout draws as a borderless layout table shaded with its own color, and the code block and placeholder drawings carry no inline styles.
- Rebuild an unchanged retained `source` when the caller passes `stylesheet` or `fontFamily`, instead of returning its original file.
- Give concurrent `exportDocx` calls their own list numbering.
