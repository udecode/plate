---
'platejs': patch
---

- Link only the selected text when `editor.update.link.upsert` runs on a selection that crosses or touches a link's edge or covers whole links; the unselected part keeps its link
- `editor.update.link.unwrap({ split: true })` unlinks only the selected text, and the whole link at a caret, where it used to unlink from the caret to the link's end
- Return `undefined` from `editor.update.link.upsert` and `wrap` where a link cannot go, such as a code block or a selection in one block that holds a mention, instead of throwing. Over several blocks, the link skips a block it cannot enter and lands in the others. `upsert` unlinks the selection before it tries the link, so a call that returns `undefined` can still have unlinked the selected part of an old link. The paste and typing rules undo that unlinking when the link lands in no block
- Return `undefined` from `editor.update.link.upsert` over an expanded selection outside a link that holds no text, such as only a line break, instead of linking the text on both sides
- Paste a URL as text where a link cannot go, and keep a URL typed before a space in a code block as text
- Return `true` from `editor.update.link.unwrap` when it removed a link
- Type the plugin-selector forms of `tx.nodes.unwrap` and `tx.nodes.wrap` to return `boolean`
