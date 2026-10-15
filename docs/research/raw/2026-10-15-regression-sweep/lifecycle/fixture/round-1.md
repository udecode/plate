# Round 1 — finished

Each check ran from its own restored starting state. Browser results below record the original run, before fixes.

The four targets were Chrome on Mac, Safari on Mac, Firefox on Mac and Safari on iPhone. Desktop browsers used the same macOS release. The iPhone used touch and its on-screen text input.

`covered-by` records one candidate test and the body hash last read against the entire check. Present test status and body hashes appear in `test-index.md`.

## SWEEP-BASIC-001

- Page: https://beta.platejs.org/examples/plite/basic
- Reference: https://platejs.org/examples/plite/basic
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: One paragraph containing plain `red `, bold `green`, then plain ` blue`. Select from immediately before `green` through the following space.
- Steps: Delete the selection. Type `gold `.
- Expected: The paragraph reads `red gold blue`; the inserted text is plain, and the caret follows its trailing space.
- Must not happen: Bold formatting survives at the insertion point, text disappears outside the selection, or the caret moves elsewhere.
- Lowest test layer: unit. The defect is in deletion and stored-mark transforms.
- Minutes: 2.
- Round 1: Chrome/Mac: find (plate#5201); Safari/Mac: find (plate#5201); Firefox/Mac: find (plate#5201); Safari/iPhone: find (plate#5201).
- fixed-by: plate#5201.
- covered-by: `packages/plite/src/transforms/deleteFragment.test.ts` — `[plate#5201] replacing a selected bold run clears its stored mark` — `a17c09e2`.

## SWEEP-BASIC-002

- Page: https://beta.platejs.org/examples/plite/basic
- Reference: https://platejs.org/examples/plite/basic
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: Paragraph one contains plain `red`. Paragraph two contains bold `green`. The caret is at the start of paragraph two.
- Steps: Delete backward once. Type `X`.
- Expected: One paragraph contains plain `redX` followed by bold `green`; the caret follows `X`.
- Must not happen: `X` becomes bold, either word disappears, or an empty paragraph remains.
- Lowest test layer: unit. The defect is in paragraph merging and stored marks.
- Minutes: 2.
- Round 1: Chrome/Mac: find (plate#5201); Safari/Mac: find (plate#5201); Firefox/Mac: find (plate#5201); Safari/iPhone: find (plate#5201).
- fixed-by: plate#5201.
- covered-by: `packages/plite/src/transforms/deleteFragment.test.ts` — `[plate#5201] replacing a selected bold run clears its stored mark` — `a17c09e2`.

## SWEEP-BASIC-003

- Page: https://beta.platejs.org/examples/plite/basic
- Reference: https://platejs.org/examples/plite/basic
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: One plain paragraph contains `hello`; the caret follows the final letter.
- Steps: Enable bold with the toolbar. Type `!`. Undo once. Type `?`.
- Expected: The paragraph contains plain `hello` followed by bold `?`; the caret follows `?`.
- Must not happen: Undo removes part of `hello`, `!` remains, or the bold insertion state is lost.
- Lowest test layer: unit. The defect is in history restoration of stored marks.
- Minutes: 2.
- Round 1: Chrome/Mac: find (plate#5202); Safari/Mac: find (plate#5202); Firefox/Mac: find (plate#5202); Safari/iPhone: find (plate#5202).
- fixed-by: plate#5202.
- covered-by: `packages/plite/src/history/undo.test.ts` — `[plate#5202] undoing bold insertion restores text selection and stored marks` — `b2038ad1`.

## SWEEP-BASIC-004

- Page: https://beta.platejs.org/examples/plite/basic
- Reference: https://platejs.org/examples/plite/basic
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: One paragraph contains `north south`; `south` is selected.
- Steps: Enable italic with the toolbar. Collapse the selection after `south`. Type `!`.
- Expected: `north ` remains plain; `south!` is italic.
- Must not happen: The space or `north` becomes italic, or the selection is lost before formatting.
- Lowest test layer: unit.
- Minutes: 1.
- Round 1: Chrome/Mac: pass; Safari/Mac: pass; Firefox/Mac: pass; Safari/iPhone: pass.
- covered-by: none.

## SWEEP-MARKDOWN-001

- Page: https://beta.platejs.org/examples/plite/markdown
- Reference: https://platejs.org/examples/plite/markdown
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: An empty paragraph with the caret at its start.
- Steps: Type `## `, then `Harbor`.
- Expected: One level-two heading contains `Harbor`; the caret follows the final letter.
- Must not happen: The marker remains visible, a second block appears, or the heading uses another level.
- Lowest test layer: unit. The defect is in the Markdown input transform.
- Minutes: 1.
- Round 1: Chrome/Mac: find (plate#5203); Safari/Mac: find (plate#5203); Firefox/Mac: find (plate#5203); Safari/iPhone: find (plate#5203).
- fixed-by: plate#5203.
- covered-by: `packages/plite/src/markdown/headingShortcut.test.ts` — `[plate#5203] two hashes and a space produce one level-two heading` — `c38d104a`.

## SWEEP-MARKDOWN-002

- Page: https://beta.platejs.org/examples/plite/markdown
- Reference: https://platejs.org/examples/plite/markdown
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: The Markdown source panel contains `[guide](https://example.com/a\(b\))`.
- Steps: Apply the source to the editor.
- Expected: One paragraph contains one link labelled `guide`, with URL `https://example.com/a(b)`.
- Must not happen: Escapes appear in the URL, the final parenthesis becomes plain text, or another link appears.
- Lowest test layer: unit. The defect is in Markdown decoding.
- Minutes: 2.
- Round 1: Chrome/Mac: find (plate#5204); Safari/Mac: find (plate#5204); Firefox/Mac: find (plate#5204); Safari/iPhone: find (plate#5204).
- fixed-by: plate#5204.
- covered-by: `packages/plite/src/markdown/link.manual.test.ts` — `[plate#5204] escaped URL parentheses decode into one link` — `d4a7610b`.

## SWEEP-MARKDOWN-003

- Page: https://beta.platejs.org/examples/plite/markdown
- Reference: https://platejs.org/examples/plite/markdown
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: The Markdown source panel contains ``Use `a * b` now``.
- Steps: Apply the source to the editor.
- Expected: One paragraph contains plain `Use `, inline code `a * b`, then plain ` now`.
- Must not happen: The asterisk creates emphasis, spaces disappear, or either surrounding text run gains the code mark.
- Lowest test layer: unit. The defect is in inline Markdown decoding.
- Minutes: 1.
- Round 1: Chrome/Mac: find (plate#5205); Safari/Mac: find (plate#5205); Firefox/Mac: find (plate#5205); Safari/iPhone: find (plate#5205).
- fixed-by: plate#5205.
- covered-by: `packages/plite/src/markdown/inlineCode.test.ts` — `[plate#5205] inline code preserves literal asterisks and surrounding plain text` — `e509bc73`.

## SWEEP-TABLE-001

- Page: https://beta.platejs.org/docs/table
- Reference: https://platejs.org/docs/table
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: A two-by-two table contains `A`, `B`, `C`, `D` in reading order; a paragraph containing `tail` follows it.
- Steps: Place the caret after `D`. Press Arrow Down; on iPhone, use the attached arrow-control bar. Type `!`.
- Expected: The caret enters the following paragraph and inserts `!` there.
- Must not happen: The caret remains in `D`, an extra table row appears, or the editor loses focus.
- Lowest test layer: browser. The defect depends on native selection movement.
- Minutes: 2.
- Round 1: Chrome/Mac: pass; Safari/Mac: find (plate#5206); Firefox/Mac: pass; Safari/iPhone: pass.
- fixed-by: plate#5206.
- covered-by: `apps/www/e2e/table-navigation.spec.ts` — `[plate#5206] Arrow Down exits the final table cell into the following paragraph` — `f6810d2c`.

## SWEEP-TABLE-002

- Page: https://beta.platejs.org/docs/table
- Reference: https://platejs.org/docs/table
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: A two-column table has both columns set to 160 pixels; the editor viewport is 360 pixels wide.
- Steps: Drag the divider between the columns 30 pixels to the right. Release it.
- Expected: The first column grows by 30 pixels, the second shrinks by 30 pixels, and resizing ends on release.
- Must not happen: The page scrolls instead of resizing, the total width changes, or resizing continues after release.
- Lowest test layer: browser. The defect depends on pointer-event handling.
- Minutes: 3.
- Round 1: Chrome/Mac: pass; Safari/Mac: pass; Firefox/Mac: pass; Safari/iPhone: find (plate#5207).
- fixed-by: plate#5207.
- covered-by: `apps/www/e2e/table-resize.spec.ts` — `[plate#5207] dragging an internal divider preserves total width and ends on release` — `07ad93e4`.

## SWEEP-TABLE-003

- Page: https://beta.platejs.org/docs/table
- Reference: https://platejs.org/docs/table
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: A two-column, three-row table has `A` spanning the first two rows in column one. Column two contains `B`, `C`, `D`; the final row starts with `E`. The caret is in `C`.
- Steps: Open the table menu. Choose Delete row.
- Expected: Two rows remain: `A`, `B` and `E`, `D`. The span on `A` becomes one, and the caret moves to `B`.
- Must not happen: `A` disappears, another row disappears, an invalid span remains, or the caret points outside the document.
- Lowest test layer: unit. The defect is in the row-removal transform and its selection update.
- Minutes: 3.
- Round 1: Chrome/Mac: find (plate#5208); Safari/Mac: find (plate#5208); Firefox/Mac: find (plate#5208); Safari/iPhone: find (plate#5208).
- fixed-by: plate#5208.
- covered-by: `packages/table/src/transforms/removeRow.test.ts` — `[plate#5208] removing a row beneath a spanning cell preserves content and relocates selection` — `18be4c05`.

## SWEEP-TABLE-004

- Page: https://beta.platejs.org/docs/table
- Reference: https://platejs.org/docs/table
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: A one-row, two-column table contains `A`, `B`. The caret is in `B`.
- Steps: Open the table menu. Choose Delete table. Type `after`.
- Expected: One plain paragraph contains `after`; the caret follows the final letter.
- Must not happen: An empty table survives, text appears outside the editor, or the document has no valid insertion point.
- Lowest test layer: unit. The defect is in table removal and fallback paragraph creation.
- Minutes: 2.
- Round 1: Chrome/Mac: find (plate#5209); Safari/Mac: find (plate#5209); Firefox/Mac: find (plate#5209); Safari/iPhone: find (plate#5209).
- fixed-by: plate#5209.
- covered-by: `packages/table/src/transforms/removeTable.test.ts` — `[plate#5209] deleting the only table creates a paragraph ready for insertion` — `29cf5d16`.

## SWEEP-DND-001

- Page: https://beta.platejs.org/docs/dnd
- Reference: https://platejs.org/docs/dnd
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: Three paragraphs contain `Alpha`, `Bravo`, `Charlie`; none is selected.
- Steps: Begin dragging `Bravo` from its block handle. On iPhone, hold the handle until dragging begins. Move toward the space after `Charlie`, pause to inspect the native drag image, then drop.
- Expected: The native drag image shows `Bravo` once at readable size; the final order is `Alpha`, `Charlie`, `Bravo`.
- Must not happen: The native image is blank, duplicated, clipped, or includes neighboring blocks.
- Lowest test layer: human. A person must inspect the operating system's native drag image.
- Minutes: 3.
- Round 1: Chrome/Mac: pass; Safari/Mac: find (plate#5210); Firefox/Mac: pass; Safari/iPhone: find (plate#5210).
- covered-by: none.

## SWEEP-DND-002

- Page: https://beta.platejs.org/docs/dnd
- Reference: https://platejs.org/docs/dnd
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: Four paragraphs contain `Alpha`, `Bravo`, `Charlie`, `Delta`; `Bravo` and `Charlie` are selected as blocks.
- Steps: Begin dragging the selected blocks from `Bravo`'s handle. On iPhone, hold the handle until dragging begins. Move after `Delta`, inspect the native drag image, then drop.
- Expected: The native image shows both selected blocks once; the final order is `Alpha`, `Delta`, `Bravo`, `Charlie`.
- Must not happen: The image shows only one block, includes `Delta`, or obscures the insertion indicator.
- Lowest test layer: human. A person must inspect the operating system's native drag image.
- Minutes: 3.
- Round 1: Chrome/Mac: find (plate#5211); Safari/Mac: find (plate#5211); Firefox/Mac: pass; Safari/iPhone: find (plate#5211).
- covered-by: none.

## SWEEP-DND-003

- Page: https://beta.platejs.org/docs/dnd
- Reference: https://platejs.org/docs/dnd
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: The nested-list drag sample contains parent item `Packing` with child items `Tent` and `Stove`, followed by top-level item `Travel`.
- Steps: Drag `Packing` after `Travel` using its block handle.
- Expected: `Packing` moves with both children; their indentation and order remain intact.
- Must not happen: A child stays behind, becomes a top-level item, or disappears.
- Lowest test layer: browser.
- Minutes: 3.
- Round 1: Chrome/Mac: blocked; Safari/Mac: blocked; Firefox/Mac: blocked; Safari/iPhone: blocked.
- Blocker: The nested-list sample returned a loading error, so the starting state could not be opened.
- covered-by: none.

## SWEEP-MENTION-001

- Page: https://beta.platejs.org/docs/mention
- Reference: https://platejs.org/docs/mention
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: An empty paragraph; the suggestion source contains `Ada Lovelace`.
- Steps: Type `@ad`. Click or tap the `Ada Lovelace` suggestion. Type ` hello`.
- Expected: One mention for Ada appears, followed by plain ` hello`; focus remains in the editor.
- Must not happen: `@ad` remains, the mention appears twice, or later text goes outside the editor.
- Lowest test layer: browser. The defect depends on focus changes during suggestion activation.
- Minutes: 2.
- Round 1: Chrome/Mac: pass; Safari/Mac: find (plate#5212); Firefox/Mac: pass; Safari/iPhone: find (plate#5212).
- fixed-by: plate#5212.
- covered-by: `apps/www/e2e/mention-selection.spec.ts` — `[plate#5212] activating a mention suggestion preserves focus for following text` — `3ad06e27`.

## SWEEP-MENTION-002

- Page: https://beta.platejs.org/docs/mention
- Reference: https://platejs.org/docs/mention
- Browsers/devices: Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone.
- Starting state: One paragraph contains plain `Hi `, a mention for Ada Lovelace, then plain ` there`. The caret is immediately after the mention.
- Steps: Delete backward once. Type `friend`.
- Expected: The paragraph reads `Hi friend there`; the mention is gone, and the caret follows `friend`.
- Must not happen: Part of the mention label remains, neighboring spaces disappear, or `friend` becomes another mention.
- Lowest test layer: unit.
- Minutes: 1.
- Round 1: Chrome/Mac: pass; Safari/Mac: pass; Firefox/Mac: pass; Safari/iPhone: pass.
- covered-by: none.
