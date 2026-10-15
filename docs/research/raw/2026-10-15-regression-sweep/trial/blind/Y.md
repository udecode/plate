# Plite beta examples: hand QA against Slate

**Pages.** Beta: `https://beta.platejs.org/examples/plite/<name>`. Slate: `https://www.slatejs.org/examples/<name>`.
**Devices.** Mac: Chrome, Safari, Firefox. iPhone: Safari.
**Hands-on time.** 145 min.

## How to run it

- **Order.** Run each Mac check in every browser it lists before moving on, then do all the iPhone checks in one batch at the end. Before each check, reload both pages so the starting state is clean. One exception: search-highlighting keeps its search term in the URL, so remove `?q=…` before reloading.
- **Parity rule.** Do every step on the Slate page first, then on the beta page. A check passes when the beta page behaves the way Slate does in that same browser. If Slate is itself broken in that browser, write "Slate also" and move on.
- **What fails every check.** Each check lists its own must-not states. These four fail any check:
  - a red error overlay, or a new console error (keep DevTools' console open on the Mac);
  - text that is doubled, lost or reordered (`sushi` turning into `ushis`);
  - a caret that jumps somewhere you didn't put it;
  - an editor that stops taking input until you reload.
- **Follow-up key.** End every check by typing one more word where the caret is. That word must land there.
- **How to record a finding.** Write down:
  - the check id and the browser with its version (or the iOS version);
  - pass, fail, or "differs from Slate";
  - a screenshot or screen recording of anything visual;
  - the exact text of any console error.

## Known gaps to confirm, not to hunt for

Reading the source turned up these differences before testing. Record each one when its check reaches it; don't spend extra time on them.

- **Undo.** Slate has Cmd+Z on these pages, but the beta source installs no undo history: check-lists, hovering-toolbar, iframe, images, markdown-preview, search-highlighting, shadow-dom, tables.
- **forced-layout.** If you delete everything, Slate refills the title with "Untitled"; the beta source leaves an empty title.
- **editable-voids.** Slate's card contains a full rich-text editor with its own toolbar. The beta card's body has no toolbar or hotkeys.
- **search-highlighting.** Slate is case-sensitive and matches across a bold boundary; the beta source ignores case and matches only inside one text run.
- **tables.** Slate ignores Enter whenever the selection is inside the table; the beta source ignores it only for a collapsed caret.
- **markdown-shortcuts.** Slate converts any block; the beta source converts only paragraphs.
- **read-only.** Slate's editor is `contenteditable=false`. The beta editor stays `contenteditable=true` with `aria-readonly`.

## Out of scope (beta-only features)

Don't test these, and don't mark them as failures:

- **Page chrome:** the left sidebar, the "New" dots, the "Examples" mobile menu.
- **richtext:** the Clear formatting button; Cmd+Alt+0/1/2; Cmd+Shift+E/J/L/R; Cmd+\; Enter leaving a heading.
- **code-highlighting:** Cmd+Shift+C; Cmd+Alt+C; Shift+Tab; multi-line Tab; Enter keeping indentation; Backspace being blocked at the start of a block.
- **tables:** Tab and Shift+Tab between cells.
- **inlines:** URL splitting while you type; the caret jumping outside a new link.
- **markdown-shortcuts:** `1. `; non-breaking-space triggers; merging adjacent lists.
- **paste-html:** tables, colors, font sizes, alignment, sub and sup, Google Docs styles.
- **huge-document:** the Virtualized and Complete DOM toggle, overscan, block size, editor height, the DOM stats.
- **embeds:** dragging the video block.
- **images:** the `?case=` fixtures.
- **search-highlighting:** the `?q=` URL state.

Equally, don't test Slate-only controls that the beta page doesn't have, such as huge-document's chunking options.

---

## Setup

### QA-00 · all pages · Mac (all three browsers), iPhone · 5 min
- **Start:** nothing open.
- **Steps:**
  1. On the Mac, put the Slate window and the beta window side by side.
  2. Add the Japanese – Romaji input source in System Settings → Keyboard → Input Sources, and check that Ctrl+Space switches to it.
  3. Open DevTools' console in Chrome, Safari (turn on Develop menu first) and Firefox.
  4. On the iPhone, check that Predictive and Auto-Correction are on.
- **Should:** both pages load in every browser and on the iPhone.
- **Must not:** a page that fails to load. If one does, stop and report it.

---

## plaintext

### PT-1 · plaintext · Chrome, Safari, Firefox · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Click at the end of the text and type ` hello`.
  2. Press Enter twice, then type `world`.
  3. Press Option+Backspace, then Cmd+Backspace.
  4. Press Cmd+Z three times, then Cmd+Shift+Z.
  5. Copy a bold heading from any web page and paste it here.
- **Should:** steps 1–4 behave as on Slate: the edits land in place, Option+Backspace removes a word, Cmd+Backspace removes to the start of the line, and undo and redo walk the same steps. The pasted heading arrives as plain text.
- **Must not:** pasted formatting; a caret that ends up somewhere else after undo.

### PT-2 · plaintext · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Tap the end of the text and type `teh ` so that autocorrect fires.
  2. Pick a word from the predictive bar.
  3. Double-tap a word and type over it.
  4. Press Return and type.
- **Should:** autocorrect and predictive text replace the word exactly once, and the replace and the new line both work as on Slate.
- **Must not:** a doubled word; the keyboard closing; a caret that lands at the start of the line.

## richtext

### RT-1 · richtext · Chrome · 5 min
- **Start:** fresh load.
- **Steps:**
  1. Type with Cmd+B, Cmd+I, Cmd+U and Cmd+`, each pressed before typing and again to turn it off.
  2. Select one word at a time and click each toolbar button in turn: bold, italic, underline, code, H1, H2, quote, numbered list, bulleted list, and the four alignments.
  3. Press Cmd+Z until you're back at the start, then Cmd+Shift+Z twice.
  4. Triple-click a paragraph and type `x`.
- **Should:** every mark and block change looks the way it does on Slate, the button state shows what's active, undo and redo step through the edits in the same order, and the triple-click replaces only that paragraph.
- **Must not:** a toolbar click that applies to a different selection; a mark that sticks after you turn it off.

### RT-2 · richtext · Safari, Firefox · 4 min
- **Start:** fresh load, with the Japanese – Romaji input source on.
- **Steps:**
  1. Put the caret in the middle of the bold word **rich**, type `nihongo`, press Space to convert, then Enter to commit.
  2. Repeat at the end of a paragraph.
  3. Repeat on an empty new line.
- **Should:** the committed text appears once, in place, and inside the bold word it stays bold, as on Slate.
- **Must not:** both romaji and kana left behind; text that lands after the caret; the underline staying after commit.

### RT-3 · richtext · iPhone · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Tap into the second paragraph.
  2. Tap Bold and type `abc`.
  3. Double-tap a word and tap Italic.
  4. Tap the bulleted-list button.
  5. Type one more word.
- **Should:** each tap applies to the caret or selection while the keyboard stays open, as on Slate.
- **Must not:** a toolbar tap that does nothing because focus was lost; the selection disappearing before the mark applies.

## check-lists

### CL-1 · check-lists · Chrome, Safari, Firefox · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Click the checkboxes for items 1 and 3.
  2. Click into item 4's text and type.
  3. Put the caret at the start of item 5 and press Backspace.
  4. Press Cmd+Z.
- **Should:** a checked item gets a line-through and fades; clicking a checkbox doesn't move the caret; Backspace turns item 5 into a plain paragraph; Cmd+Z undoes it as on Slate. The beta page probably has no undo (see the known gaps).
- **Must not:** the checkbox click putting the caret inside the checkbox or selecting text; Backspace merging the item into item 4.

### CL-2 · check-lists · iPhone · 2 min
- **Start:** fresh load.
- **Steps:**
  1. Tap a checkbox.
  2. Tap into an item's text and type.
- **Should:** the checkbox toggles on the first tap; the typed text lands where you tapped.
- **Must not:** the keyboard opening on the checkbox tap; a tap that needs to be repeated.

## code-highlighting

### CH-1 · code-highlighting · Chrome · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Click into the first paragraph and click the code-block button.
  2. Change the language select to TypeScript, then Python, then back.
  3. Inside a code block, type `const x = 1` and press Tab.
  4. Press Enter and type `y`.
- **Should:**
  - The paragraph becomes a code block.
  - The highlighting colors change with the language.
  - Tab inserts two spaces.
  - Enter starts a new line inside the same code block, as on Slate. Ignore the beta page's auto-indent.
- **Must not:** colors that stay stale after the language changes; Enter leaving the code block.

### CH-2 · code-highlighting · Safari, Firefox · 3 min
- **Start:** fresh load, with Japanese – Romaji on.
- **Steps:**
  1. Put the caret mid-token inside a highlighted line, type `nihongo`, convert and commit.
  2. Switch back to the ABC input source and type `foo`.
- **Should:** the text commits once, and the highlighting redraws after commit.
- **Must not:** the composition breaking or committing early when colors redraw; duplicated text.

## custom-placeholder

### CP-1 · custom-placeholder · Chrome, Safari, Firefox, iPhone · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Check the placeholder: "Type something" plus the `<pre>` note.
  2. Click or tap into the editor and type `a`.
  3. Delete it.
  4. In Safari only: type `nihongo` with Japanese – Romaji into the empty editor and commit.
- **Should:**
  - The placeholder looks the way it does on Slate.
  - The caret blinks at the start, not after the placeholder text.
  - The placeholder hides on the first character and comes back when the editor is empty.
  - The IME text commits once.
- **Must not:** placeholder text getting selected or copied; the caret drawn at the end of the placeholder; on the iPhone, autocorrect adding placeholder words.

## editable-voids

### EV-1 · editable-voids · Chrome, Firefox · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Type a name into the Name input and press ArrowLeft twice.
  2. Pick Right.
  3. Type into the "Tell us about yourself" body.
  4. Click the add (+) button.
  5. Press Cmd+Z.
- **Should:**
  - The keys stay in the input.
  - The radio button works.
  - The body accepts text.
  - The add button inserts a second card.
  - Cmd+Z removes that card.
  - Slate's nested toolbar is missing on the beta page (a known gap): note it.
- **Must not:** keystrokes from the input showing up in the outer editor; picking a radio in the new card changing the first card; focus jumping to the outer text after you type in the body.

### EV-2 · editable-voids · Safari, iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Tap or click the Name input and type.
  2. Tap the body and type.
  3. Tap the paragraph below the card and type.
- **Should:** each tap focuses its own target, and the keyboard stays open.
- **Must not:** text landing in the previous target; the page scrolling away from the caret.

## embeds

### EM-1 · embeds · Chrome, Safari · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Check that the Vimeo video renders.
  2. Click the URL input and delete the last digit.
  3. Type it back.
  4. Replace the URL with `javascript:alert(1)`.
  5. Restore the original URL with Cmd+Z in the input, or by pasting it back.
  6. Click into the paragraph after the video and press ArrowUp and ArrowLeft.
- **Should:** the iframe follows the URL as you type; `javascript:` gives a blank frame; the arrow keys move across the video block as on Slate.
- **Must not:** an alert dialog; input keystrokes reaching the editor; the caret getting stuck in the video block.

## forced-layout

### FL-1 · forced-layout · Chrome, Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Press Cmd+A, then Backspace.
  2. Type `Title`, press Enter, and type `Body`.
  3. Click into the title and press Enter in the middle of it.
- **Should:**
  - The first block always stays an H2 title and the second a paragraph, as on Slate.
  - After Cmd+A and Backspace, Slate shows "Untitled" selected. The beta page shows an empty title (a known gap): note it.
- **Must not:** the title disappearing or becoming a paragraph; a third block appearing above the title.

## hovering-toolbar

### HT-1 · hovering-toolbar · Chrome, Safari, Firefox · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Drag-select a few words.
  2. Click B, then I, then U.
  3. Click away so the selection collapses.
  4. Select again and press Cmd+Z.
- **Should:**
  - The menu fades in just above the selection.
  - Each button toggles its mark while the selection stays.
  - The menu hides when the selection collapses.
  - Undo works as on Slate (the beta page probably has none; see the known gaps).
- **Must not:** the menu staying open or ending up far from the selection; a click that loses the selection; the menu showing for a collapsed caret.

### HT-2 · hovering-toolbar · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Long-press a word to select it, then drag the handles to widen the selection.
  2. Tap B on the menu.
- **Should:** the menu shows above the selection and isn't covered by the iOS callout any more than on Slate; B applies to the whole selection.
- **Must not:** tapping B dropping the selection; the menu getting stuck after you tap elsewhere.

## huge-document

### HD-1 · huge-document · Chrome · 4 min
- **Start:** fresh load of both pages, each at 10,000 blocks (the default).
- **Steps:**
  1. Check how long each page takes to load.
  2. Drag the scrollbar to the bottom, then back to the middle.
  3. Click inside a paragraph and type a full sentence.
  4. Read the keypress timing stats on both pages.
- **Should:** the beta page loads and types at least as fast as Slate; text shows up right away while scrolling.
- **Must not:** blank gaps that stay after scrolling stops; the caret jumping after a scroll; keypress times clearly worse than Slate's.

### HD-2 · huge-document · Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Scroll to the bottom and note a distinctive word in the last block.
  2. Scroll to the top and use Cmd+F to find that word.
  3. Press Cmd+A, type `x`, then Cmd+Z.
- **Should:** Cmd+F finds the word as it does on Slate; Cmd+A and typing replace the whole document; Cmd+Z brings it all back.
- **Must not:** the find coming up empty on the beta page while Slate finds the word; a freeze longer than 2 s; a partly restored document.

### HD-3 · huge-document · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Fling-scroll a long way down.
  2. Tap into a paragraph and type.
  3. Scroll away and back, then type again.
- **Should:** scrolling stays smooth and typing lands where you tapped, as on Slate.
- **Must not:** blank screens; the page jumping back to the top; the keyboard opening without a caret.

## iframe

### IF-1 · iframe · Chrome, Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Double-click a word inside the framed editor.
  2. Click the parent toolbar's B.
  3. Type a word.
  4. Press Cmd+I and type.
  5. Press Cmd+Z.
- **Should:** the toolbar acts on the selection inside the frame, and focus returns to the frame for typing. Undo works as on Slate (the beta page probably has none).
- **Must not:** the toolbar click removing the selection inside the frame; typed text going nowhere.

## images

### IM-1 · images · Chrome · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Click an image, then click its delete button.
  2. Click the image toolbar button and enter `https://example.com`.
  3. Click it again and enter `https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg`.
  4. Press Cmd+Z.
- **Should:**
  - A selected image gets a blue ring and a delete button, and delete removes it.
  - The first URL shows the alert "URL is not an image".
  - The second inserts the flower image with an empty paragraph after it.
  - Undo works as on Slate (the beta page probably has none).
- **Must not:** the delete button showing on an image that isn't selected; an image inserted for the invalid URL.

### IM-2 · images · Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Drag a JPEG from Finder into the middle of the text.
  2. In Finder, copy an image file and press Cmd+V in the editor.
  3. Paste the flower URL from IM-1 as text.
- **Should:** each one inserts an image where you dropped or pasted it, as on Slate.
- **Must not:** the browser opening the file in the tab; nothing inserted; two images for one paste.

### IM-3 · images · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Tap an image, then tap delete.
  2. In Photos, copy a photo, then long-press in the editor and choose Paste.
- **Should:** the image gets selected and deleted, and the photo is inserted as on Slate.
- **Must not:** the keyboard covering the delete button with no way to reach it; a Paste that inserts nothing.

## inlines

### IN-1 · inlines · Chrome, Safari, Firefox · 5 min
- **Start:** fresh load.
- **Steps:**
  1. Walk ArrowRight, then ArrowLeft, across the link, the editable button and the "Approved" badge.
  2. Select a word and use the link button with `https://example.com`.
  3. Use link_off on it.
  4. Use smart_button to insert, then remove, "Edit me!".
  5. Paste `https://example.com` as plain text onto an empty spot.
- **Should:**
  - The caret steps one position at each inline edge and never lands inside the badge.
  - Link, unlink and button all behave as on Slate.
  - The pasted URL becomes a link.
- **Must not:** text typed at a link edge landing in the wrong side of the link when Slate puts it elsewhere; the badge getting selected or edited; a stray empty link.

### IN-2 · inlines · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Tap inside the editable button and type.
  2. Tap the link text.
  3. Tap right after the badge and type.
- **Should:** typing goes into the button; tapping the link behaves as on Slate; text after the badge lands outside it.
- **Must not:** text landing inside the badge; the caret getting stuck at an inline edge.

## markdown-preview

### MP-1 · markdown-preview · Chrome, Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:** on a new line, type each of these, one per line:
  - `# Big`
  - `**bold**`
  - `_it_`
  - `> quote`
  - `- item`
  - `` `code` ``
  - `---`

  Then press Cmd+Z.
- **Should:** each line gets the same decoration style as on Slate while you type; undo works as on Slate (the beta page probably has none).
- **Must not:** the caret jumping when a decoration appears; characters dropped while the style redraws.

## markdown-shortcuts

### MS-1 · markdown-shortcuts · Chrome, Safari, Firefox · 5 min
- **Start:** fresh load.
- **Steps:**
  1. On new empty lines, type each of these followed by text: `* `, `- `, `+ `, `> `, `# `, `## `, `### `, `###### `.
  2. Press Backspace at the start of each converted block.
  3. Put the caret at the start of "A wise quote.", type `# ` and note the result.
  4. Press Cmd+Z after a conversion.
- **Should:**
  - Each trigger converts the block and removes the marker; Backspace turns it back into a paragraph.
  - Step 3 matches Slate (Slate converts the block; see the known gaps).
  - Undo restores the marker text as on Slate.
- **Must not:** the marker text staying in the block; a space swallowed without converting.

### MS-2 · markdown-shortcuts · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. On a new line, type `# ` then `Hello`.
  2. Type `- ` then `item`.
  3. Type `> ` then `quote`.
- **Should:** each converts as on Slate, even with autocorrect and auto-capitalization on.
- **Must not:** the conversion missed because iOS changed the space or the marker; the text after the marker doubled.

## mentions

### MN-1 · mentions · Chrome · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Type ` @ja`.
  2. Press ArrowDown past the last item, then ArrowUp.
  3. Press Enter.
  4. Type ` @lu`, press Tab, then type ` @ma` and press Escape.
  5. Type ` @ja` and click an item.
  6. Put the caret after a mention and press Backspace.
- **Should:**
  - The menu lists up to 10 matches next to the caret, and arrows wrap.
  - Enter, Tab and a click each insert the highlighted character.
  - Escape closes the menu.
  - Backspace deletes the whole mention.
  - The next typed word lands right after the mention.
- **Must not:** the menu staying open after an insert; the `@ja` text left behind; the first key after closing the menu getting lost.

### MN-2 · mentions · Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Walk ArrowRight across "R2-D2", then Shift+ArrowRight across it.
  2. Copy a range that contains a mention and paste it at the end.
  3. With Japanese – Romaji, type `nihongo` right after a mention and commit.
- **Should:** the mention moves and selects as one unit; the paste brings the mention back intact; the IME text commits once after the mention.
- **Must not:** the caret landing inside the mention; the pasted mention arriving as plain text when Slate pastes a mention.

### MN-3 · mentions · iPhone · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Tap the end of a paragraph and type ` @lu`.
  2. Tap a menu item.
  3. Type a word.
- **Should:** the menu shows near the caret above the keyboard; the tap inserts the mention; the keyboard stays open.
- **Must not:** the menu hidden behind the keyboard; the tap closing the keyboard or the menu without inserting.

## paste-html

### PH-1 · paste-html · Chrome, Safari, Firefox · 5 min
- **Start:** fresh load. In another tab, open a Wikipedia article that has a heading, a list, a link, bold or italic text, and a code sample or quote.
- **Steps:**
  1. Copy a section that contains those elements.
  2. Paste it at the end of each editor.
  3. Press Cmd+Z.
- **Should:**
  - Headings, lists, links, bold, italic, code, quotes and images come in the way Slate shows them.
  - Undo removes the whole paste in one step, as on Slate.
- **Must not:** element types that Slate keeps going missing; raw HTML tags shown as text; the paste landing somewhere other than the caret.

### PH-2 · paste-html · iPhone · 2 min
- **Start:** fresh load.
- **Steps:**
  1. In Safari, select and copy a paragraph with a link from any page.
  2. Long-press in the editor and choose Paste.
- **Should:** the link and the text come in as they do on Slate.
- **Must not:** an empty paste; the caret ending up at the start of the document.

## read-only

### RO-1 · read-only · Chrome, Safari, Firefox · 2 min
- **Start:** fresh load.
- **Steps:**
  1. Click the text and type.
  2. Select a sentence, press Cmd+C, and paste it into the URL bar.
- **Should:** nothing changes and no caret is drawn; the copied text is exact.
- **Must not:** a blinking caret; text entered by typing, pasting or cutting.

### RO-2 · read-only · iPhone · 2 min
- **Start:** fresh load.
- **Steps:**
  1. Tap the text.
  2. Long-press to select a word and copy it.
- **Should:** behaves as on Slate: no keyboard, and selecting and copying work.
- **Must not:** the keyboard opening (Slate opens none); the Paste or Cut options changing the text.

## search-highlighting

### SH-1 · search-highlighting · Chrome, Safari · 3 min
- **Start:** fresh load, with no `?q=` in the URL.
- **Steps:**
  1. In the search box, type `text`.
  2. Clear it and type `this`.
  3. Clear it and type `decorations`.
  4. With `text` in the box, click into the editor and type ` text`.
  5. Press Cmd+Z.
- **Should:**
  - The highlights follow each term the way Slate's do.
  - The case and bold-boundary differences are known gaps: record them.
  - The new word gets highlighted as you type.
  - Focus stays in the box while you type there.
- **Must not:** the search box losing focus on a keystroke; old highlights left on text that no longer matches.

## shadow-dom

### SD-1 · shadow-dom · Chrome, Safari, Firefox · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Click mid-sentence and type.
  2. Double-click a word and type over it.
  3. Press Shift+ArrowLeft three times, then Backspace.
  4. Press Enter and type.
  5. Copy a word and paste it.
  6. Press Cmd+Z.
- **Should:** all of it behaves as on Slate; undo probably fails on the beta page (see the known gaps).
- **Must not:** typing that does nothing in Safari; a selection drawn somewhere other than the real one; text inserted at the start of the editor.

### SD-2 · shadow-dom · iPhone · 2 min
- **Start:** fresh load.
- **Steps:**
  1. Tap mid-sentence and type.
  2. Double-tap a word and type over it.
- **Should:** the same as on Slate.
- **Must not:** the keyboard opening with no caret; text landing at the start.

## styling

### ST-1 · styling · Chrome, Safari · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Compare both editors' look with Slate: yellow background and green outline on the first, the `fancy` class on the second.
  2. Type in editor 1, then in editor 2.
  3. In editor 2, press Cmd+Z.
- **Should:** the styles match Slate's; each editor keeps its own undo.
- **Must not:** undo in editor 2 changing editor 1; the focus ring or caret showing in the wrong editor.

## tables

### TB-1 · tables · Chrome, Firefox · 4 min
- **Start:** fresh load.
- **Steps:**
  1. In the "Dog" cell, press Backspace at its start and Delete at its end.
  2. With a collapsed caret in a cell, press Enter.
  3. Drag-select from "Human" to "4" and press Enter.
  4. Drag a selection from a cell into the paragraph below.
  5. Type in a cell, then press Cmd+Z.
- **Should:**
  - Backspace, Delete and collapsed Enter do nothing at cell edges, as on Slate.
  - Range Enter: Slate ignores it; record what the beta page does.
  - The drag selection looks the same as on Slate.
  - Undo works as on Slate (the beta page probably has none).
- **Must not:** cells merging or splitting; a cell's text moving into its neighbor; a table row losing a cell.

### TB-2 · tables · Safari · 3 min
- **Start:** fresh load, with Japanese – Romaji on.
- **Steps:**
  1. Type `nihongo` at the end of the "Cat" cell and commit.
  2. Press Backspace at the start of the "9" cell.
  3. Triple-click a cell.
- **Should:** the IME text stays in its cell; Backspace does nothing; the triple-click selects that one cell as on Slate.
- **Must not:** text escaping into the next cell; the triple-click selecting the whole row or table when Slate doesn't.

### TB-3 · tables · iPhone · 2 min
- **Start:** fresh load.
- **Steps:**
  1. Tap the "Cat" cell and type.
  2. Press Backspace past the cell start.
- **Should:** text goes into the tapped cell, and Backspace stops at the cell start.
- **Must not:** the tap landing in the wrong cell; cells merging.

---

## Time budget

| Group | Checks | Minutes |
| --- | --- | ---: |
| Setup | QA-00 | 5 |
| Text and rich text | PT-1, PT-2, RT-1, RT-2, RT-3 | 20 |
| Blocks and voids | CL-1, CL-2, CH-1, CH-2, CP-1, EV-1, EV-2, EM-1, FL-1 | 30 |
| Overlays and frames | HT-1, HT-2, IF-1, SH-1, SD-1, SD-2, ST-1 | 22 |
| Scale | HD-1, HD-2, HD-3 | 10 |
| Media and inlines | IM-1, IM-2, IM-3, IN-1, IN-2, MN-1, MN-2, MN-3 | 27 |
| Markdown and paste | MP-1, MS-1, MS-2, PH-1, PH-2 | 18 |
| Read-only and tables | RO-1, RO-2, TB-1, TB-2, TB-3 | 13 |
| **Total** | 43 checks | **145** |
