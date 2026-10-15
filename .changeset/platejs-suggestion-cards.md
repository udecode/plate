---
'platejs': patch
---

- Read the review cards touching a top-level block with `useSuggestionGroups(blockKey)` from `platejs/suggestion/react`. It rereads when the block redraws or a change in it moves to another card, so read `groupOf(card.id)` when a control needs a current summary
- Highlights carry `data-editor-authored-groups` and `data-editor-authored-color`, and clicking one activates the first card it names. A card merge or split redraws the blocks whose changes moved to another card, so highlight colors follow the card
- `AuthoredPlugin` from `platejs/authored` takes no options and exposes the card reads, `decide` and the view shapes of `plitejs/authored`
- A DOCX review export stores each block that holds a pending change, with the document's review records, in a custom XML part bound to the block's Word paragraphs. Import restores each block whose paragraphs Word left unchanged. Import keeps Word revisions as pending changes only when `plugins` include `AuthoredPlugin`, and otherwise flattens them with a `lossy-content` warning
- DOCX comment ranges address the stored document, the value `editor.read.value()` returns
