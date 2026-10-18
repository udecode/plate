---
'platejs': major
---

Store line heights as positive numbers, and export `start` and `end` alignment and text indent to Word.

- Convert stored v53 line heights in the v54 document migration. `"107%"` becomes `1.07`, and `"150%"` or `"1.5em"` becomes `1.5`. The step drops values it can't convert, such as `"normal"`, `"12pt"`, zero and negative numbers.
- Convert stored line heights, alignment, indents and list values in the v54 document migration only when the built-in plugin that owns them is installed. An app plugin that reuses a built-in name, such as `lineHeight`, keeps its own values, and so does a list style an app declares in another root.
- Paste HTML line heights in percent and `em` as numbers, and warn when a pasted line height can't be stored, such as `normal`, `24px` or `0`.
- Export `start` and `end` alignment to Word as left and right, and text indent as a first-line or hanging indent, except on list paragraphs.
- Keep the alignment and line height of numbered, bulleted and to-do paragraphs in Word export.
