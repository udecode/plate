---
'plitejs': patch
---

- Select the word a Firefox double-click highlights inside an inline that renders non-editable markup beside its text, instead of keeping the earlier caret.
- Read a selection that ends inside non-editable markup in the editor, such as a checkbox or an inline's spacer, instead of ignoring it. A selection with both ends in one piece of such markup is still ignored.
- Map each end of an expanded range that sits inside non-editable markup to text toward the other end in `editor.api.dom.resolveRange`, searching the element that holds the markup and that element's neighbor on that side. Return `null` when that search finds no text or the two ends pass each other.
