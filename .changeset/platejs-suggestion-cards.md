---
'platejs': patch
---

- Read the review cards of a block with `useSuggestionGroups(blockKey)` from `platejs/suggestion/react`. A nested block's key reads that block's own cards, and under a preview the key reads the cards of the content that block shows. It rereads when the component that calls it renders or when the review delta names the block. A delta names top-level blocks only, so a nested block's cards reread only on a render. Read `groupOf(card.id)` when a control needs a current summary
- `useSuggestionChanges(path)` reads the pending changes of the block at a path of the mounted view. It never reads the change of an element around the block that the view still shows, such as a quote's pending unwrap. It rereads on each commit that changes the document or its state, and when the review delta names the path's top-level block
- Highlights carry `data-editor-authored-groups` and `data-editor-authored-color`, and clicking one activates the first card it names. A card merge or split redraws the blocks whose changes moved to another card, so highlight colors follow the card
- `AuthoredPlugin` from `platejs/authored` takes no options and exposes the card reads, `decide` and the view shapes of `plitejs/authored`. `platejs/authored` also exports `AuthoredPlaceError`, which a preview's review read throws for a point or a range
- A DOCX review export stores each block that holds a pending change, with the document's review records, in a custom XML part bound to the block's Word paragraphs. Import restores each block whose paragraphs Word left unchanged. Import keeps Word revisions as pending changes only when `plugins` include `AuthoredPlugin`, and otherwise flattens them with a `lossy-content` warning
- DOCX comment ranges address the stored document, the value `editor.read.value()` returns
