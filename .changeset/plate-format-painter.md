---
'platejs': patch
---

- Add `read.capture({ at? })` and `update.apply(format, { at? })` to `BaseFormattingPlugin`. `capture` takes the look at the start of a range, and `apply` clears a target and gives it that look in one undo step. A whole paragraph or heading also carries its type, heading level and block styles onto whole paragraphs and headings. List items and code blocks keep their type.
- Add `keeps.type` to the `formatting` plugin point, so a plugin can keep a block's type through a paint. List items use it.
- Add `on.pointerSelectionEnd({ selection })` to Plate plugins. Plate calls it once per mouse selection made in the editor's own text, with the final range, after the browser and the editor finish writing that selection.
- Add `platejs/format-painter/react` with `FormatPainterPlugin`. `api.arm({ sticky? })` picks up the look of the selection, and the next mouse selection, or the word under a click, takes it. A `sticky` brush keeps painting until `api.disarm()` or `Escape`. `Mod+Alt+C` copies a look and `Mod+Alt+V` pastes it onto the selection.
