---
'platejs': patch
---

Export footnotes to HTML as linked marks and notes, and paste them back, GitHub's rendered footnotes included.

- Add `editor.read.footnote.anchor({ path })`, which returns a footnote's fragment `id` and the `target` id it links to, and the `FootnoteAnchor` type.
- Serialize a footnote mark as `<sup><a data-editor-footnote-ref href id>` and a note as `<div data-editor-footnote-definition id>` with a back link to its first mark. Parsing that HTML gives the same footnotes and drops the back link.
- Paste footnotes copied from GitHub, from a README or a comment, as footnote marks and notes that keep GitHub's numbers.
- Export footnotes to Word as their label and note text, without links.
- In a read-only view, `focusDefinition` and `focusReference` scroll to the target, flash it and return `true` without moving the selection. They still return `false` when the view is unmounted or the target is missing; read `editor.read.view.isReadOnly()` to tell a read-only view apart.
- Land a pasted footnote definition at the end of the document, before the empty paragraph `TrailingBlockPlugin` keeps, even when the caret is in a table cell. Its references land at the caret, and the caret ends after the pasted text. A definition saved inside another block stays there, and a dragged note lands where it is dropped.
- Copy words selected inside a footnote definition as words, without the definition.
- End the selection of a pasted table outside a footnote definition that ends its last cell.

**Migration:** `BaseFootnoteDefinitionPlugin` declares `slice.endMatter`, so editors that install it get a new schema fingerprint. A populated Yjs room or a saved `History` JSON created with the old fingerprint refuses the new editor. Run a versioned document migration before any peer joins with the new schema, and bump your schema `version`, as the Yjs docs describe.
