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
- Export a to-do list item with a ☑ or ☐ list marker from its `checked` value, and import a Word bullet level drawn as ☐, ☑ or ☒ as a task item with its checked state.
- Select a listed block in the DOCX `stylesheet` with `[data-docx-list]`, whose value is `bulleted`, `numbered` or `task`, such as `[data-docx-list="task"][data-docx-list-checked]` for a checked to-do. The rule styles the block's own element, and the rule's alignment and line height apply to each text paragraph the block writes, not to an image or a table.
- Export a table cell's lists, task items, code blocks, equations, images, heading styles and nested tables as the body exports them, and size a nested table and its images to the cell that holds them.
- Export every listed block, such as a heading, blockquote, image, toggle or code block, with its Word list marker and all its content. The block's first paragraph carries the marker, and each later one, such as an image caption or a blockquote's second paragraph, sits at the item's text indent. A heading keeps its heading style and bookmark, and a blockquote its quote style.
- Give a comment's list its own Word numbering, so it keeps its own marker style.
- Stop writing an empty paragraph after each horizontal rule and block equation in DOCX export.
- Leave colors, fonts and sizes of the DOCX drawings to `stylesheet`. A callout draws as a borderless layout table shaded with its own color, and the code block and placeholder drawings carry no inline styles.
- Rebuild an unchanged retained `source` when the caller passes `stylesheet` or `fontFamily`, instead of returning its original file.
- Give concurrent `exportDocx` calls their own list numbering.
