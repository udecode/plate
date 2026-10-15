# Beta docs QA pass: beta.platejs.org against platejs.org

**Total hands-on time:** 141 minutes, across 1 global check and 38 page checks.

## How to run it

- **Pairs.** Each check compares `https://beta.platejs.org/docs/<name>` with `https://platejs.org/docs/<name>`.
- **Devices.** Mac: Chrome, Safari and Firefox, all current. iPhone: Safari.
- **Order.** Run the check on stable in Chrome first; that is your reference. Then run it on beta in every browser the check lists. Run stable in another browser only when beta fails there. If stable fails the same way, the bug is old: note it, but it is not a beta regression.
- **Fresh state.** Reload the page before each check so the demo starts from its original content. Wait until the demo editor is visible, not `Loading…`.
- **Typing.** Type one key at a time at a normal speed. Never paste text that a step says to type. On iPhone, use the on-screen keyboard. Smart punctuation may change quotes and dashes there; compare with stable on the same phone.
- **Keys.** "Cmd" is the Mac Command key. On iPhone, tap the toolbar button where a step gives a shortcut.
- **Skip rule.** These checks come from the beta docs source; the live stable pages could not be opened while this list was prepared. If the stable page lacks the feature a check uses, mark the check N/A and go on. Its minutes come off the total. The most likely case is `details`: if `platejs.org/docs/details` has no demo, skip DT-1 and DT-2.
- **On a failure.** Record the check id, the browser, the page (beta or stable) and the step. Add a screen recording when the problem appears during a gesture, such as a drag, a popup or a highlight. A screenshot after the gesture can miss it.

## Global

### G-1 · Every demo loads without errors
- **Browsers:** Chrome, with DevTools open on the Console tab.
- **Start:** Beta site, Console cleared.
- **Steps:**
  1. Open each of the 16 beta pages in turn.
  2. Wait for each demo editor, click into it and type one letter.
  3. Read the Console.
- **Should:** Each demo renders its editor, with its full content and toolbar, and accepts the letter.
- **Must not:** A demo stays on `Loading…`, a red error box or a blank area replaces the demo, or the Console shows a red error that stable does not show for the same page (for example `EditorSchemaValidationError`).
- **Minutes:** 8

## basic-blocks

### BB-1 · Block Markdown shortcuts typed key by key
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Click the end of the last paragraph in the demo, then press Enter to get an empty paragraph.
- **Steps:**
  1. Type `## ` and then `Title`.
  2. Press Enter, then type `> ` and then `quote`.
  3. Press Enter twice to leave the quote, then type `---`.
  4. Type `next`.
  5. Press Cmd+Z once.
- **Should:** You get an H2 "Title", then a blockquote "quote", then a horizontal rule with "next" in the paragraph after it. Undo reverses the last step the same way it does on stable.
- **Must not:** A letter is missing or out of order (for example `itleT`). The first letter after a conversion lands in the block above. The caret jumps to another block.
- **Minutes:** 4

### BB-2 · Heading shortcut on a multi-block selection
- **Browsers:** Chrome, Firefox
- **Start:** Click in the middle of the first heading's text.
- **Steps:**
  1. Press Shift+Down twice.
  2. Press Cmd+Option+2.
  3. Press Shift+Up twice.
  4. Press Cmd+Z.
- **Should:** Every block the selection touches becomes an H2. Shift+Up shrinks the selection back along the same path. Undo restores every block and leaves the selection on the same text.
- **Must not:** Only the first block changes. The selection collapses or vanishes. Two highlight layers show at once.
- **Minutes:** 3

## basic-marks

### BM-1 · Toolbar mark keeps focus and paints one selection
- **Browsers:** Chrome, Safari, Firefox
- **Start:** Double-click a plain word in a demo paragraph.
- **Steps:**
  1. Click Bold in the toolbar.
  2. Without clicking the text, press Cmd+B.
  3. Press Right Arrow and type `ab`.
- **Should:** The word turns bold, the selection stays on it, Cmd+B turns bold off, and "ab" appears right after the word.
- **Must not:** The selection shows two highlight layers or a stale highlight after the click. The keys after the toolbar click do nothing because focus stayed on the button. The caret disappears.
- **Minutes:** 4

### BM-2 · Toggle a mark at the caret, then type
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Click the end of a demo paragraph.
- **Steps:**
  1. Press Cmd+B (on iPhone, tap B) and type `bold`.
  2. Press Cmd+B again and type `plain`.
  3. Repeat steps 1 and 2 with Cmd+I and Cmd+U.
- **Should:** Each first word has the mark, from its first letter on. Each second word has no mark.
- **Must not:** The first letter misses the mark. The mark carries into the second word. Letters are lost.
- **Minutes:** 3

## list

### LI-1 · Indent and outdent, one item and several
- **Browsers:** Chrome, Firefox, Safari
- **Start:** Click in "Roman 2".
- **Steps:**
  1. Press Tab, then Shift+Tab.
  2. Press Shift+Down once, so the selection covers "Roman 2" and "Roman 3".
  3. Press Tab, then Shift+Tab.
  4. Press Cmd+Z four times.
- **Should:** Each press moves the items by exactly one level, and the numbers recompute at once. The selection still covers the same two items after each press. The four undos restore the original levels and selection.
- **Must not:** Duplicate, skipped or stale numbers. An item disappears or merges into another. The selection collapses, or two highlights show.
- **Minutes:** 4

### LI-2 · Enter and Backspace at the edges of a list
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Click the end of "Roman 4".
- **Steps:**
  1. Press Enter and type `x`.
  2. Press Enter twice on the new empty item.
  3. Click the start of "Roman 3" and press Backspace.
  4. Type `y`.
- **Should:** "x" appears in a new item with the next number. The empty item outdents or leaves the list as it does on stable. After Backspace, "y" goes where the caret shows.
- **Must not:** Text lands in the item above. The caret shows in one block while text goes into another. The numbering breaks.
- **Minutes:** 4

### LI-3 · Task checkbox, first click
- **Browsers:** Chrome, iPhone
- **Start:** Click in the demo's paragraph text, so focus is on the text and not on the list.
- **Steps:**
  1. Click the "Todo 2" checkbox once.
  2. Click at the end of "Todo 2" and type `z`.
  3. Press Cmd+Z twice.
- **Should:** The first click toggles the box. The typing goes into the item. The undos remove "z" and then restore the box.
- **Must not:** The first click only moves focus and the box needs a second click. The click selects text or moves the caret into the box.
- **Minutes:** 2

## details (skip if stable has no demo)

### DT-1 · Closing a Details with the caret inside
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Click in the body paragraph of the outer Details.
- **Steps:**
  1. Click the arrow to close the Details.
  2. Type `q`.
  3. Click the arrow again to open it.
- **Should:** "q" appears in visible text, in the summary.
- **Must not:** "q" goes into the hidden body. The caret vanishes so typing does nothing. Reopening shows the body changed.
- **Minutes:** 3

### DT-2 · Enter in the summary and Backspace at the body start
- **Browsers:** Chrome, Firefox
- **Start:** Click the end of the outer summary while the Details is open.
- **Steps:**
  1. Press Enter and type `a`.
  2. Click the start of the first body paragraph and press Backspace.
  3. Press Cmd+Z twice.
- **Should:** Enter and Backspace behave as they do on stable, and the undos restore the original structure.
- **Must not:** The nested Details is lost. Text moves into the wrong Details. The caret lands in a closed body.
- **Minutes:** 3

## table

### TB-1 · Select cells by dragging the mouse, then delete
- **Browsers:** Firefox, Chrome, Safari
- **Start:** The table demo, unchanged.
- **Steps:**
  1. Press the mouse in the "Heading" row's second cell and drag diagonally to the "Mention" row's third cell, then release.
  2. Press Backspace.
  3. Press Cmd+Z.
- **Should:** During the drag, whole cells highlight as a rectangle. Backspace clears every selected cell, and undo restores them.
- **Must not:** The drag shows ordinary blue text selection running through cells. Only some cells clear. Rows or columns are deleted.
- **Minutes:** 4

### TB-2 · Extend a cell selection with Shift+Arrow and back
- **Browsers:** Chrome, Safari
- **Start:** Click in the "Heading" row's first cell.
- **Steps:**
  1. Press Shift+Right twice, then Shift+Down once.
  2. Press Shift+Up once, then Shift+Left twice.
- **Should:** The selection grows into a cell rectangle, then shrinks back along the same path to the start cell.
- **Must not:** The selection leaves the table, gets stuck, or shows text highlight and cell highlight at once.
- **Minutes:** 3

### TB-3 · Merge and split cells from the table toolbar
- **Browsers:** Chrome, Firefox
- **Start:** Drag to select a 2×2 block of data cells.
- **Steps:**
  1. Open the table toolbar and choose Merge cells.
  2. Without clicking the text, type `m`.
  3. Choose Split cell.
  4. Press Cmd+Z twice.
- **Should:** The cells merge with all their text kept, "m" goes into the merged cell, the split restores the cells, and undo steps back.
- **Must not:** Text from a merged cell is lost. The key does nothing because the toolbar kept focus. The table layout breaks.
- **Minutes:** 4

### TB-4 · Resize a column, then Tab out of the last cell
- **Browsers:** Chrome, Safari
- **Start:** The table demo, unchanged.
- **Steps:**
  1. Hover a column border, then drag it right by about 50 px and release.
  2. Click in the last cell of the table and press Tab.
  3. Type `t`.
- **Should:** The resize cursor shows during hover and drag, and the column keeps its new width after release. Tab adds a row, and "t" goes into its first cell.
- **Must not:** The cursor stays as a text cursor. The column snaps back. The drag selects text. Tab leaves the table without adding a row.
- **Minutes:** 3

## code-block

### CB-1 · Fence, then typing stays literal
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Click the end of the last paragraph and press Enter.
- **Steps:**
  1. Type three backticks (and Enter if stable needs it).
  2. Type `const a = **b**;`.
  3. Press Enter, then Tab (not on iPhone), then type `# x`.
- **Should:** A code block forms, and the text stays exactly as typed, with no bold and no heading. Enter starts a new line in the same block, and Tab indents.
- **Must not:** Markdown converts inside the code. The caret leaves the block. Letters are lost.
- **Minutes:** 4

### CB-2 · Language picker hands focus back
- **Browsers:** Chrome, Firefox
- **Start:** Click in the JavaScript code block.
- **Steps:**
  1. Open the language picker and choose Python.
  2. Click at the end of a code line and type `x`.
  3. Press Cmd+Z.
- **Should:** The highlighting changes to Python, "x" goes into the code, and undo removes it.
- **Must not:** The picker stays open or reopens. The block's code changes. Typing lands outside the block.
- **Minutes:** 3

## link

### LK-1 · Cmd+K on a selection, then edit the link
- **Browsers:** Chrome, Safari, Firefox
- **Start:** Double-click a plain word.
- **Steps:**
  1. Press Cmd+K and type `https://example.com` straight away, then press Enter.
  2. Press Right Arrow and type `!`.
  3. Click the new link, then use the floating toolbar to edit it and then unlink it.
- **Should:** The URL field takes the first letter you type. The word becomes a link. "!" goes into the text after Enter. Edit and Unlink work.
- **Must not:** The first letter of the URL is lost. Focus stays in the field after Enter. The link covers the wrong text. The toolbar stays open after unlinking.
- **Minutes:** 4

### LK-2 · Paste a URL over a selection, and autolink
- **Browsers:** Chrome, Safari
- **Start:** Copy `https://platejs.org` from the address bar, then double-click a plain word.
- **Steps:**
  1. Press Cmd+V.
  2. Click the end of a paragraph, type `https://example.com` and then a space.
- **Should:** The word keeps its text and becomes a link to the copied URL. The typed URL becomes a link after the space.
- **Must not:** The word is replaced by the URL text. No link is made.
- **Minutes:** 3

### LK-3 · Typing at a link edge
- **Browsers:** Chrome, Safari
- **Start:** Click just after the last letter of the "hyperlinks" link.
- **Steps:**
  1. Type `s`.
  2. Press Left Arrow three times, then Right Arrow three times, and type `t`.
- **Should:** Both letters land inside or outside the link the same way as on stable.
- **Must not:** The behaviour differs from stable. The caret skips a position or stops twice at the link edge.
- **Minutes:** 2

## mention

### MN-1 · Open the @ popup and insert by keyboard
- **Browsers:** Chrome, Safari, Firefox, iPhone
- **Start:** Click the end of "Try mentioning…" and type a space.
- **Steps:**
  1. Type `@` and then `b`.
  2. Press Down Arrow and then Enter (on iPhone, tap an item).
  3. Type `ok`.
- **Should:** The popup opens at the caret as soon as you type "@" and filters on "b". Enter inserts a mention chip. "ok" goes after the chip, with the same spacing as stable.
- **Must not:** The "b" is lost. The popup opens away from the caret. Enter adds a new line. "ok" goes inside the chip or before it.
- **Minutes:** 5

### MN-2 · Escape, then arrows and Backspace around a chip
- **Browsers:** Chrome, Safari
- **Start:** Click the end of the last paragraph and type a space.
- **Steps:**
  1. Type `@xy`, press Escape, then type `z`.
  2. Click just after the "BB-8" chip, press Left Arrow twice, then Right Arrow twice.
  3. Press Backspace.
- **Should:** Escape closes the popup and keeps "@xyz" as plain text. The arrows step over the chip in the same number of presses as on stable. Backspace removes the chip as stable does.
- **Must not:** The popup reopens or eats "z". The caret disappears inside the chip. Backspace removes only half of the chip or nothing.
- **Minutes:** 3

## comment

### CM-1 · Comment on a backward selection
- **Browsers:** Chrome, Safari, iPhone
- **Start:** The comment demo, unchanged.
- **Steps:**
  1. In "Select some text and add your own comment as Alice", drag from the end of "your own comment" back to its start.
  2. Click Comment in the toolbar.
  3. Without clicking the box, type `hi`, then submit.
- **Should:** The comment box takes the typing at once. The new thread highlights exactly "your own comment".
- **Must not:** The first letter is lost. The selection highlight vanishes or shows twice before you submit. The thread anchors to other text.
- **Minutes:** 4

### CM-2 · Edit a commented word, then undo and redo
- **Browsers:** Chrome, Firefox
- **Start:** The comment demo, unchanged.
- **Steps:**
  1. Click the "overlapping" highlight, and check that its thread opens. Press Escape.
  2. Click inside "overlapping" and type `XX`.
  3. Press Cmd+Z, then Cmd+Shift+Z.
- **Should:** The thread opens and closes. The highlight grows to cover "XX". Undo and redo restore both the text and the highlight.
- **Must not:** The highlight is lost after undo. The thread reopens by itself. The keys go nowhere after Escape.
- **Minutes:** 4

## suggestion

### SG-1 · Type and delete in Suggesting mode
- **Browsers:** Safari, Chrome, iPhone
- **Start:** Switch the demo to Suggesting mode.
- **Steps:**
  1. Click in the middle of a word and type `abc`.
  2. Press Backspace twice.
  3. Press Cmd+Z.
- **Should:** "abc" shows as a proposed insertion, at the place you clicked. Backspace removes your own inserted letters outright. Undo works as it does on stable.
- **Must not:** The caret or focus is lost after the mode switch, so the keys do nothing; Safari is the main risk here. Your own letters turn into proposed deletions.
- **Minutes:** 4

### SG-2 · Delete a selection that spans two paragraphs
- **Browsers:** Chrome, Firefox, Safari
- **Start:** Suggesting mode.
- **Steps:**
  1. Drag from the middle of paragraph 1 to the middle of paragraph 2, and press Backspace.
  2. Type `x`.
  3. Reload, and repeat steps 1 and 2 dragging backward, from paragraph 2 to paragraph 1.
- **Should:** All the selected text in both paragraphs shows as a proposed deletion and stays visible. "x" shows as a proposed insertion at the start of the range.
- **Must not:** Text disappears for real. Only the first paragraph is marked. The second paragraph keeps unmarked selected text.
- **Minutes:** 4

### SG-3 · Accept and reject, then undo and redo
- **Browsers:** Chrome
- **Start:** The demo with its starting suggestions.
- **Steps:**
  1. Open a suggestion card and click Accept.
  2. Press Cmd+Z, then Cmd+Shift+Z.
  3. Reject another suggestion.
- **Should:** Accept applies the change. Undo brings back the suggestion with its mark and card. Redo applies it again. Reject restores the original text.
- **Must not:** Undo brings back the text without its suggestion mark. A stale card remains.
- **Minutes:** 3

## media

### MD-1 · Click into a caption and type
- **Browsers:** Chrome, Safari, Firefox
- **Start:** The media demo, unchanged.
- **Steps:**
  1. Click the image, then click its caption "Image caption".
  2. Type `!`.
  3. Click the video, then click where its caption appears, and type `v`.
- **Should:** Each click shows a visible caret in the caption, and the letters go into it.
- **Must not:** An error box or crash appears. The caret is invisible. The letters go into the paragraph next to the media.
- **Minutes:** 4

### MD-2 · Resize the image
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Click the image so it is selected.
- **Steps:**
  1. Drag a side resize handle about 80 px inward and release (on iPhone, use touch).
  2. Press Cmd+Z (skip on iPhone).
- **Should:** The resize cursor shows on the handle. The image follows the drag smoothly and keeps its new width. Undo restores the width.
- **Must not:** The image jumps or snaps back on release. The drag selects text. The handle does not respond to touch where stable's does.
- **Minutes:** 3

### MD-3 · Arrow keys past the image and its empty caption
- **Browsers:** Chrome, Safari
- **Start:** Click the end of the paragraph just above the image.
- **Steps:**
  1. Press Down Arrow until the caret is in the paragraph below the image, and count the presses.
  2. Press Up Arrow until the caret is back, and count again.
  3. Delete the caption text and repeat steps 1 and 2.
- **Should:** Each step in each direction is visible (image selected, caption caret, next line). The press counts match stable.
- **Must not:** An invisible stop with no caret and no ring, especially at an empty caption. The caret skips the image. The two directions need different numbers of presses.
- **Minutes:** 3

## dnd

### DD-1 · Drag a block by its handle
- **Browsers:** Chrome, Safari, Firefox
- **Start:** Hover "Second item" until its drag handle shows.
- **Steps:**
  1. Press the handle and drag above "First item", watching the screen while you hold the button.
  2. Release.
- **Should:** While you drag, the drag image shows the block's content, see-through as on stable, and one drop line marks the landing edge. After release, the block lands there and the numbering updates.
- **Must not:** An opaque box as the drag image. Two drop lines, or text selection painting during the drag. The block is copied instead of moved. Nested items are left behind.
- **Minutes:** 4

### DD-2 · Autoscroll while dragging past the window edge
- **Browsers:** Chrome, Safari
- **Start:** Scroll so the demo's first block sits just below the top of the window.
- **Steps:**
  1. Drag the last list item's handle up past the top edge of the window, and hold it there for 2 seconds.
  2. Move back into the demo and release.
- **Should:** The page scrolls while you hold outside the edge, stops when you release, and the block lands at the indicated place.
- **Must not:** The page does not scroll. The page keeps scrolling after release. The drop lands somewhere other than the line showed.
- **Minutes:** 3

## autoformat

### AF-1 · Inline Markdown marks typed key by key
- **Browsers:** Chrome, Safari, Firefox, iPhone
- **Start:** Click the end of the last bullet and press Enter twice to get an empty paragraph.
- **Steps:**
  1. Type `**bold** `, then `_it_ `, then `` `code` `` and a space, then `~~s~~ `.
  2. Type `a**b**`.
- **Should:** Each wrapped word gets its mark, the markers disappear, and the next text is plain. The input `a**b**` gives the same result as on stable.
- **Must not:** Letters are lost or reordered. The markers stay as text where stable converts them. The mark spreads to the text you type next.
- **Minutes:** 5

### AF-2 · Block rules, and undo right after one
- **Browsers:** Chrome, Safari
- **Start:** An empty paragraph, as in AF-1.
- **Steps:**
  1. Type `1. a`, press Enter, then type `[] b`.
  2. On a new empty paragraph, type `# ` and press Cmd+Z straight away.
- **Should:** You get a numbered item "a" and a to-do "b". Undo right after `# ` gives back the literal text, as on stable.
- **Must not:** Undo deletes the paragraph or the text. The list rule fires twice.
- **Minutes:** 3

## slash-command

### SC-1 · Open, filter, run and keep typing
- **Browsers:** Chrome, Safari, Firefox, iPhone
- **Start:** Click the end of the last bullet and press Enter twice to get an empty paragraph.
- **Steps:**
  1. Type `/` and then `head`.
  2. Press Down Arrow and Enter (on iPhone, tap "Heading 2").
  3. Type `Title`.
- **Should:** The menu opens at the caret on "/" and filters on "head". The block becomes the chosen heading with "/head" removed. "Title" goes into it.
- **Must not:** The "h" after "/" is lost. The menu opens away from the caret. "/head" stays in the text. The caret goes to another block.
- **Minutes:** 5

### SC-2 · Escape, mid-word slash, and inserting a table
- **Browsers:** Chrome, Safari
- **Start:** An empty paragraph, as in SC-1.
- **Steps:**
  1. Type `a/`.
  2. Type a space and then `/`, press Escape, and type `k`.
  3. On a new empty paragraph, type `/table` and press Enter, then type `c`.
- **Should:** "a/" opens no menu. Escape closes the menu and keeps "/k" as text. The table is inserted and "c" goes into its first cell.
- **Must not:** The menu opens mid-word. The menu reopens after Escape. "c" goes outside the new table.
- **Minutes:** 3

## toc

### TC-1 · Click a TOC entry
- **Browsers:** Chrome, Safari, iPhone
- **Start:** Scroll the demo so its TOC is visible.
- **Steps:**
  1. Click "Benefits of Using TOC" in the TOC.
  2. Click "Subsection".
- **Should:** Each click scrolls its heading into view below the site header, the same way stable does.
- **Must not:** No scroll. The heading ends up hidden under the header or off-screen. The page jumps to the top.
- **Minutes:** 3

### TC-2 · TOC follows heading edits
- **Browsers:** Chrome, Firefox
- **Start:** The TOC demo, unchanged.
- **Steps:**
  1. Click in "Subsection" and type `Two`.
  2. On a new empty paragraph at the end, type `## New`.
  3. Press Cmd+Z three times.
- **Should:** The TOC updates as you type, adds "New", and steps back with each undo.
- **Must not:** The TOC shows stale text, misses the new heading, or keeps an entry after its heading is undone.
- **Minutes:** 3

## callout

### CO-1 · Emoji picker from the callout icon
- **Browsers:** Chrome, Safari, iPhone
- **Start:** The callout demo, unchanged.
- **Steps:**
  1. Click the 💡 icon.
  2. Without clicking the search box, type `fire`.
  3. Pick 🔥, then click into the callout text and type `k`.
- **Should:** The picker opens and its search takes the typing. 🔥 replaces 💡 and the picker closes. "k" goes into the callout text.
- **Must not:** The typed letters go into the document instead of the search. The picker stays open. The icon does not change.
- **Minutes:** 4

### CO-2 · Enter and Backspace inside a callout
- **Browsers:** Chrome, Firefox
- **Start:** Click the end of the Tip callout's text.
- **Steps:**
  1. Press Enter and type `n`.
  2. Press Backspace twice.
  3. Press Cmd+Z twice.
- **Should:** Enter and Backspace keep the text inside or move it out of the callout exactly as on stable, and undo restores the callout.
- **Must not:** The behaviour differs from stable. The callout or its icon is lost. Text jumps into the next callout.
- **Minutes:** 3
exit=0
