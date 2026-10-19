# Plite beta vs Slate: hands-on QA checklist

**Hands-on time: 145 min.** Mac (Chrome, Safari, Firefox) and iPhone (Safari).

## How to run

- **Pages.** Beta is `https://beta.platejs.org/examples/plite/<name>`. Slate is `https://www.slatejs.org/examples/<name>`.
- **Order.** Run each check on the Slate page first, then on beta, in the same browser. Reload both pages first. Unless a check says otherwise, "Should" means "does what Slate just did".
- **Chrome profile.** Use your everyday Chrome profile with its extensions on, and write down which extensions are on. Several bugs reached beta because tests ran in a clean profile.
- **Typing.** Type one key at a time and never paste, unless a step says to paste. Keys are Mac keys.
- **Applies to every check (must not):** a red error overlay, a blank editor, an editor that stops taking input, or a red error in the Chrome DevTools console. Keep the console open in Chrome.
- **Recording.** For anything visual or brief, record the screen (Cmd+Shift+5 on the Mac, Control Center on the iPhone). Flicker, a second highlight layer or a misplaced menu often disappears before a screenshot.
- **Logging.** Write one line per failure: ID, browser, what happened, recording.
- **Out of scope:** features only beta has. Examples are the huge-document Rendering, Overscan, size and height controls, the code-highlighting shortcuts and multi-line Tab, the `?case=` pages, and dragging voids.
- **Known differences** are marked **Known** in the check where they show up. Record what you see; you don't have to argue the bug.

---

## Every page (6 min)

### G-1 · Load sweep
- **Where:** all 22 pages · Safari, Firefox, iPhone · 6 min. Chrome is covered by the page checks below.
- **Start:** open `check-lists` on beta.
- **Steps:**
  1. Open each page from the Examples sidebar (on iPhone, from the "Examples" dropdown).
  2. Click or tap once in the first paragraph.
- **Should:** the editor shows the same opening words as Slate, and one click puts the caret there. `read-only` shows no caret.
- **Must not:** an error screen; "Loading…" for more than 3 s; text that overlaps or is cut off; horizontal page scrolling on the iPhone.

---

## check-lists (7 min)

### CL-1 · Click a checkbox, then type
- **Where:** Chrome, Safari, Firefox · 3 min
- **Start:** fresh load.
- **Steps:**
  1. Click right after "Criss-cross." (the unchecked item).
  2. Click its checkbox.
  3. Without clicking anything else, type `x`.
  4. Click the checkbox again.
- **Should:** each click flips the box. The checked item gets a line through it and is dimmed. `x` lands where it lands on Slate, or nowhere if Slate drops it.
- **Must not:** the box needs two clicks; the line-through appears on another item; `x` lands in another block or at the start of the document; a caret shows inside the checkbox.

### CL-2 · Backspace at the start of an item
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Start:** fresh load.
- **Steps:**
  1. Put the caret just before the "C" of "Criss-cross!". On iPhone, tap, then drag the caret there.
  2. Press Backspace once.
  3. Type `y`.
- **Should:** the item becomes a plain paragraph with no checkbox and unchanged text, and `y` comes before "Criss-cross!".
- **Must not:** the item merges into the line above; characters are deleted; `y` lands somewhere else, or letters come out in the wrong order.

---

## code-highlighting (6 min)

### CH-1 · Change the language, then keep editing
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Click at the end of `// Add the initial value.`
  2. In the first code block's language menu, pick Python.
  3. Click again at the end of the same line and type ` ok`.
- **Should:** that block switches to Python colors right away. ` ok` lands at the end of the line and is colored with it.
- **Must not:** the other code block changes color; the old colors stay until the next key; the text lands in another block; the menu jumps back to its old value.

### CH-2 · Enter, then Tab, in code
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Click at the end of `// Add the initial value.`
  2. Press Enter, then Tab, then type `x`.
- **Should:** a new line in the same code block that starts with two spaces and then `x`.
- **Must not:** Tab moves focus to the language menu or out of the editor; a paragraph appears below the code block; the caret shows in the wrong column.

---

## custom-placeholder (7 min)

### CP-1 · First click and first key on an empty editor
- **Where:** Chrome, Safari, Firefox, iPhone · 3 min
- **Start:** fresh load. Click nothing else first.
- **Steps:**
  1. Click or tap once on "Type something".
  2. Type `a`.
  3. Press Backspace.
- **Should:** one click puts the caret at the start. `a` hides the placeholder and its hint, and Backspace brings both back.
- **Must not:** it needs a second click; the caret shows after the placeholder text or on a second line; the placeholder overlaps `a`; the placeholder does not come back; the iPhone keyboard does not open.

### CP-2 · Japanese input over the placeholder
- **Where:** Safari, Chrome, iPhone · 4 min (includes setup)
- **Start:**
  - Mac: add "Japanese – Romaji" in System Settings › Keyboard › Input Sources.
  - iPhone: add the Japanese Romaji keyboard.
  - Fresh load.
- **Steps:**
  1. Click the editor and switch to Japanese.
  2. Type `nihon`, press Space to convert, then Enter to commit.
  3. Switch back to English and type ` ok`.
- **Should:** the text you are composing shows underlined in place, the placeholder is hidden while you compose, and the result is `日本 ok` exactly once.
- **Must not:** the placeholder shows behind the composing text; the text doubles (`にほん日本`); it commits after the first letter; the caret ends up before the committed text.

---

## editable-voids (9 min)

### EV-1 · Moving focus between the text, the inputs and the inner text
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Steps:**
  1. Click at the end of the first paragraph and type `1`.
  2. Click the Name input and type `Ann`.
  3. Click the "Right" radio button.
  4. Click after "much better than a" in the "Tell us about yourself" text and type `2`.
  5. Click at the end of the first paragraph again and type `3`.
- **Should:** every key lands where you just clicked. "Right" stays selected. Only one caret shows at a time.
- **Must not:** keys typed in the input land in the document; the first key after a click is lost; the outer text still shows a blue highlight while you type in an input; focus jumps back to the outer editor; the iPhone keyboard closes between steps.

### EV-2 · Drag a selection across the void, both ways
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Press in the middle of the first paragraph, drag down past the form to the bottom of the editor, and release.
  2. Do it the other way: press at the bottom and release in the first paragraph.
- **Should:** one continuous selection, highlighted as on Slate, and the selection ends where you released.
- **Must not:** a second, darker highlight on top; highlight inside the Name box; the selection snaps into the inner text.

### EV-3 · Mark shortcuts in the inner rich text
- **Where:** Chrome · 2 min
- **Steps:**
  1. Double-click "rich" in the "Tell us about yourself" text.
  2. Press Cmd+B, then Cmd+I.
- **Should:** both marks apply, as on Slate. Slate's inner editor has its own toolbar and the Cmd+B, I, U and ` shortcuts.
- **Known:** beta's inner text has no toolbar and no mark shortcuts. Confirm and log it as one parity gap.

---

## embeds (6 min)

### EM-1 · Edit the URL input
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Click in the URL input under the video.
  2. Press Cmd+A.
  3. Type `https://player.vimeo.com/video/76979871`.
- **Should:** Cmd+A selects only the input's text, every key stays in the input, and the video updates as on Slate.
- **Must not:** Cmd+A selects the document; characters land in a paragraph; the input loses focus after the first character; the video disappears.

### EM-2 · From the video back to the text
- **Where:** Chrome, Safari, iPhone · 3 min
- **Steps:**
  1. Click play on the video.
  2. Click once at the end of the "Try it out! This editor is built to handle Vimeo embeds…" paragraph.
  3. Type `q`.
- **Should:** that one click gives a caret, and `q` appears.
- **Must not:** it needs a second click; `q` is lost; the embed still looks selected.

---

## forced-layout (4 min)

### FL-1 · Title and paragraph keep their places
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Steps:**
  1. Click at the end of "Enforce Your Layout!", press Enter and type `p`. Compare the block types with Slate.
  2. Reload.
  3. Click in the paragraph and press Cmd+A (on iPhone, tap › Select All).
  4. Press Backspace, then type `Hi`.
- **Should:** step 1 gives the same block types as Slate. After step 4 there is still a heading and a paragraph, and `Hi` is in the heading.
- **Known:** Slate puts "Untitled" back in the title. Beta leaves the title empty with its "Enter a title…" placeholder. Record which one you see.
- **Must not:** only one block is left; `Hi` looks like body text; two headings; no visible caret.

---

## hovering-toolbar (9 min)

### HT-1 · Backward selection, menu clicks, scrolling
- **Where:** Chrome, Safari, Firefox · 4 min
- **Steps:**
  1. Press at the end of "menu will appear", drag right to left to the start of "select", and release.
  2. Click B, then I.
  3. Scroll the page a little while the menu is open.
  4. Click somewhere else in the text.
- **Should:**
  - The dark menu fades in above the selection.
  - B and I apply to exactly the selected text, and the selection and menu stay.
  - The menu stays with the selection while you scroll.
  - The menu goes away when the selection collapses.
- **Must not:** the menu shows at the top-left, off screen or over the selection; the menu flickers or closes on a click; the selection shrinks or collapses; a mark lands on the wrong text; the menu stays after the selection collapses.

### HT-2 · Release outside the editor, then use a shortcut
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Press in the middle of "Try it out yourself!", drag down below the editor and release there.
  2. Press Cmd+B.
- **Should:** the menu appears even though you released outside, and Cmd+B bolds the selection as on Slate.
- **Must not:** no menu appears; Cmd+B does nothing in a browser where Slate bolds; Firefox opens its bookmarks sidebar.

### HT-3 · iPhone selection and menu
- **Where:** iPhone · 2 min
- **Steps:**
  1. Double-tap a word in the first paragraph and drag a handle to extend the selection.
  2. Tap B.
- **Should:** the same as Slate: the menu is visible and not covered by the iOS callout, the tap bolds the text, and the selection stays.
- **Must not:** the tap collapses the selection without bolding; the menu stays after you deselect.

---

## huge-document (8 min)

Beta scrolls inside a 420px box and Slate scrolls the whole page. That difference is intended.

### HD-1 · Typing after scrolling away and back
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Start:** defaults (10,000 blocks).
- **Steps:**
  1. Click in the first paragraph and type `abc`.
  2. Scroll the editor quickly to about the middle (drag the scrollbar on the Mac, flick on the iPhone).
  3. Wait 1 s, then scroll back to the top.
  4. Type `d`.
- **Should:** `abcd` is together at the first caret position; the caret is visible; content fills in while you scroll; typing feels as quick as on Slate.
- **Must not:** rows stay blank for more than 1 s; the caret is gone, or `d` lands somewhere else; the view jumps when you type; typing is clearly slower than Slate.

### HD-2 · Drag past the bottom edge to autoscroll
- **Where:** Chrome, Safari, Firefox · 4 min
- **Steps:**
  1. Press in a paragraph near the top of the editor.
  2. Drag below the editor's bottom edge, hold for 2 s, and release.
  3. Press Backspace.
- **Should:** the editor scrolls while you hold and the selection grows with it. Backspace removes exactly the highlighted text.
- **Must not:** the scroll stalls at the edge or reverses; Backspace deletes text other than what was highlighted; blank rows after the delete.

---

## iframe (6 min)

### IF-1 · Bold from the toolbar outside the iframe, then keep typing
- **Where:** Chrome, Safari, Firefox · 4 min
- **Steps:**
  1. Double-click "useful" inside the frame.
  2. Click B in the toolbar above the frame.
  3. Press → and type `!`.
  4. Click on the page outside the frame.
  5. Click at the end of the last paragraph and type `z`.
- **Should:**
  - "useful" turns bold and B shows as active.
  - `!` lands in the frame without another click.
  - Clicking outside clears the selection, as on Slate.
  - Clicking back in gives a caret.
- **Must not:** the toolbar click loses the selection; nothing turns bold; `!` is lost; two carets; no visible caret in the frame.

### IF-2 · Shortcuts inside the frame
- **Where:** Chrome, Safari, Firefox · 2 min
- **Steps:**
  1. Click at the end of the first paragraph.
  2. Press Cmd+B, type `bold`, press Cmd+B, type ` plain`.
- **Should:** only "bold" is bold.
- **Must not:** the browser runs its own Cmd+B action (the Firefox bookmarks sidebar); the first letter of `bold` is not bold.

---

## images (9 min)

Slate's Unsplash images may not load. If so, compare the frame, the ring and the delete button, not the picture.

### IM-1 · Select an image and delete it
- **Where:** Chrome, Safari, Firefox, iPhone · 3 min
- **Steps:**
  1. Click the second image.
  2. Click outside the editor.
  3. Click the image again, then click the ✕ at its top left.
- **Should:** the selected image gets a ring and the ✕. Both go away when focus leaves, as on Slate. The ✕ deletes only that image.
- **Must not:** both images have a ring; the ring stays after you click away; an unselected image shows a ✕; the delete also removes text around the image.

### IM-2 · Arrow keys around an image
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Click at the end of "…like images or videos."
  2. Press ArrowDown twice, then ArrowUp twice.
  3. Select the image and press Backspace.
- **Should:** the same stops as Slate. The image is selected on one stop and the caret is in the next paragraph on the next. The way back retraces the way down, and Backspace removes the image.
- **Must not:** a caret drawn on the image; the image is skipped; the caret gets stuck; Backspace deletes text.

### IM-3 · Paste a real image
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. In another tab, right-click any picture › Copy Image.
  2. Click at the end of the "This example shows images in action…" paragraph and press Cmd+V.
- **Should:** the same as Slate: the image is inserted as a block followed by an empty paragraph.
- **Must not:** nothing happens; a broken image where Slate shows one; a URL is pasted as text; two images.

---

## inlines (7 min)

### IN-1 · Caret stops at the link edges
- **Where:** Chrome, Safari, Firefox · 4 min
- **Steps:**
  1. Click just before "hyperlink".
  2. Press ArrowRight one at a time through the link and past it, counting the stops.
  3. At the end of the link, type `X`.
  4. Press ArrowLeft back to the start.
- **Should:** the same number of stops as Slate in both directions, and `X` is inside or outside the link exactly as on Slate.
- **Must not:** an invisible caret at any stop; a press that moves two characters; the caret goes into the "Approved" badge; different stops going left and going right.

### IN-2 · Editable button and read-only badge
- **Where:** Chrome, Safari, Firefox, iPhone · 3 min
- **Steps:**
  1. Click inside "editable button" and type `Z`.
  2. Double-click "Approved".
  3. Triple-click the first paragraph.
- **Should:** `Z` lands inside the button. The badge cannot be edited. The double-click and the triple-click select the same text as on Slate.
- **Must not:** a caret inside the badge; typing deletes the badge text; a second highlight layer; on iPhone, tapping the button does not let you type in it.

---

## markdown-preview (4 min)

### MP-1 · Styling appears while you type
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Steps:**
  1. Click at the end of "Try it out for yourself!"
  2. Type ` **bo`, then `ld**`, then ` _it_`.
  3. Press Enter and type `## T`.
- **Should:** bold shows as soon as the closing `**` is typed, `_it_` shows as italic, and the `## T` line shows as a heading. The caret stays after the last character typed.
- **Must not:** the caret jumps after the styling changes; letters come out of order or go missing; the styling waits for the next key.

---

## markdown-shortcuts (7 min)

### MS-1 · Shortcut markers turn paragraphs into blocks
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Steps:**
  1. Click at the very start of "The editor gives you full control…" and type `-` then Space.
  2. Click at the very start of "Order when you start a line with…" and type `#`, `#`, Space.
  3. Click at the very start of "Try it out for yourself!…" and type `>` then Space.
  4. On the Mac only, press Cmd+Z once.
- **Should:** each Space turns the paragraph into a bulleted list, a heading and a quote, with the marker gone and the caret at the start of the text. Cmd+Z does what it does on Slate.
- **Must not:** the marker text stays; the caret lands at the end of the block; on iPhone, Space does not trigger where Slate's does.

### MS-2 · Backspace turns a block back into a paragraph
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Click at the start of the "Try it out!" heading and press Backspace.
  2. Click at the start of "A wise quote." and press Backspace.
- **Should:** each block becomes a plain paragraph with its text intact.
- **Must not:** it merges into the block above; a character is deleted.

---

## mentions (9 min)

### MN-1 · Mention menu with the keyboard
- **Where:** Chrome, Safari, Firefox · 4 min
- **Steps:**
  1. Click at the end of "…or @Mace Windu!" and type Space, then `@`, `m`, `a`.
  2. Press ArrowDown twice, then ArrowUp once.
  3. Press Enter and type ` ok`.
- **Should:**
  - The menu opens after `@m`, right below the text, and narrows as you type.
  - The arrows move the highlighted name and wrap around as on Slate.
  - Enter replaces `@ma` with a mention, and ` ok` comes after it.
- **Must not:** the menu opens in a corner or far from the text; the arrows move the editor caret; Enter makes a new line; `@ma` is left behind; the first key after the mention is lost.

### MN-2 · Pick with the mouse; close with Escape
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Type Space, then `@ob`.
  2. Click a name in the menu and type `x`.
  3. Type Space, then `@lu`, and press Escape.
- **Should:** the click inserts the mention and keeps focus, so `x` comes right after it without another click. Escape closes the menu and leaves `@lu` as text.
- **Must not:** the click takes focus out of the editor; `x` is lost; Escape removes text.

### MN-3 · Mentions on iPhone
- **Where:** iPhone · 2 min
- **Steps:**
  1. Tap at the end of the second paragraph and type ` @ma`.
  2. Tap a name in the menu.
- **Should:** the menu is visible above the keyboard, the tap inserts the mention, the keyboard stays open, and typing continues after the mention.
- **Must not:** the menu is hidden by the keyboard; the tap closes the keyboard without inserting; predictive text doubles the text.

---

## paste-html (5 min)

### PH-1 · Paste from a real web page
- **Where:** Chrome, Safari, Firefox, iPhone · 5 min
- **Steps:**
  1. Open any Wikipedia article. Select from a section heading through a paragraph with a link and a bulleted list, and copy it. On iPhone, long-press › Copy.
  2. In each editor, click at the end of "This is an example of doing exactly that!" and paste.
  3. Press Cmd+Z (Mac only).
- **Should:** the headings, paragraphs, links, lists and bold or italic text come in as they do on Slate. Extra styling on beta, such as colors, is fine. The caret ends after the pasted content, and one Cmd+Z removes the whole paste.
- **Must not:** HTML tags show as text; everything lands in one paragraph; links lose their targets; the caret jumps to the start; part of the paste survives the undo.

---

## plaintext (6 min)

### PT-1 · Delete shortcuts and undo
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Click at the end of the text and type ` hello world`.
  2. Press Option+Backspace, then Cmd+Backspace.
  3. Press Cmd+Z, then Cmd+Shift+Z.
- **Should:** each delete and each undo or redo step removes or restores the same text as on Slate, and the caret stays where the edit happened.
- **Must not:** undo groups the changes differently from Slate; the caret jumps to the start of the document after an undo.

### PT-2 · iPhone autocorrect, suggestions, dictation
- **Where:** iPhone · 3 min
- **Steps:**
  1. Tap at the end of the text and type `teh ` (let autocorrect fix it).
  2. Type `sushi` quickly.
  3. Tap a suggestion above the keyboard.
  4. Dictate "hello world".
- **Should:** you get `the`, then `sushi` in order, the suggestion replaces its word in place, and the dictation goes in at the caret.
- **Must not:** `tehthe`; `ushis` or any other reordering; doubled dictation; the caret jumps.

---

## read-only (2 min)

### RO-1 · Nothing can be edited; text can be selected and copied
- **Where:** Chrome, Safari, Firefox, iPhone · 2 min
- **Steps:**
  1. Click the text and type `x`.
  2. Press Cmd+V.
  3. Drag-select a word and press Cmd+X.
  4. Drag-select a word, press Cmd+C, and paste into the address bar.
- **Should:** the text never changes and no caret blinks, but selecting and copying work.
- **Must not:** the text changes; a caret shows; you cannot select.

---

## richtext (8 min)

### RT-1 · Toolbar mark on a selection that crosses styles
- **Where:** Chrome, Safari, Firefox · 4 min
- **Steps:**
  1. Drag from the middle of "rich" to the middle of "much".
  2. Click B and look at the B button's state.
  3. Click B again.
  4. Press → and type `Q`.
- **Should:** the same as Slate: the first click makes the whole range bold, the second undoes it, and the selection stays visible after each click. The B state matches Slate.
- **Must not:** a click loses the selection; only part of the range changes; a second highlight layer; `Q` lands somewhere else.

### RT-2 · Turn a mark on, then type
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min
- **Steps:**
  1. Click at the end of "A wise quote."
  2. Press Cmd+I, type `it`, press Cmd+I again, and type `no`. On iPhone, tap the I button instead.
  3. Click the U button and type `un`.
- **Should:** `it` is italic, `no` is plain and `un` is underlined. The caret stays in the text after the toolbar click.
- **Must not:** the first letter of any of these gets the wrong style; the toolbar click takes focus away so `un` is lost; the iPhone keyboard closes when you tap the toolbar while Slate's stays open.

---

## search-highlighting (3 min)

### SH-1 · Highlights while typing a search
- **Where:** Chrome, Safari, Firefox · 3 min
- **Steps:**
  1. Type `t`, `e`, `x`, `t` into the search box one at a time.
  2. Click at the end of the first paragraph and type ` text`.
  3. Clear the search box.
  4. Search `adds decorations`, then search `This`.
- **Should:** the highlights update on every key and match Slate's. The new "text" is highlighted right away, and clearing the box removes every highlight.
- **Known:** beta ignores upper and lower case and does not match across a bold boundary, so `This` and `adds decorations` will differ from Slate. Record what you see.
- **Must not:** highlights stay after the box is cleared; the box loses focus while you type; highlights land on the wrong letters.

---

## shadow-dom (4 min)

### SD-1 · Editing inside nested shadow roots
- **Where:** Chrome, Safari, Firefox, iPhone · 4 min. Watch Safari most closely.
- **Steps:**
  1. Click in the middle of "nested" and type `x`.
  2. Double-click "Editor".
  3. Drag-select "rendered within".
  4. Press ArrowLeft three times.
  5. Press Enter and type `y`.
- **Should:** the caret goes where you click, double-click selects the word, the drag highlights the text, the arrows move one character each, and `y` lands on a new line.
- **Must not:** the caret jumps to the start after a click; text goes in at the wrong position; no selection highlight; Enter does nothing.

---

## styling (2 min)

### ST-1 · The two styled editors
- **Where:** Chrome, Safari, Firefox · 2 min
- **Steps:**
  1. Compare both editors with Slate's.
  2. Click in the empty lower part of editor 1 and type `a`.
  3. Click in editor 2, type `b`, and press Cmd+Z.
- **Should:** they look the same as Slate's (yellow background, green outline, same height). The click in the empty area puts the caret at the end of the text. Cmd+Z removes only `b`.
- **Must not:** clicking the empty area does nothing; the undo changes editor 1.

---

## tables (7 min)

### TB-1 · Cells keep their boundaries
- **Where:** Chrome, Safari, Firefox, iPhone · 3 min
- **Steps:**
  1. Click before "Dog" and press Backspace.
  2. Click after "Dog" and press Delete (fn+Delete on a laptop).
  3. Click in the "Cat" cell and press Enter.
  4. Click in the empty top-left cell and type `x`.
- **Should:** Backspace, Delete and Enter do nothing, and `x` goes into the empty cell.
- **Must not:** cells merge; a new line appears inside a cell; text moves into another cell.

### TB-2 · Selection across several cells
- **Where:** Firefox, Chrome, Safari · 4 min. Firefox selects whole cells, so start there.
- **Steps:**
  1. Press in "Human", drag to "9", release, and press Backspace.
  2. Reload, make the same drag, and press Enter.
  3. Type `x`.
- **Should:** the same result as Slate in each browser. The table stays 3 rows by 4 columns, and Enter does nothing (Slate ignores Enter whenever the selection is in the table).
- **Known:** in beta's source, Enter is blocked only when the selection is a single caret. Expect step 2 to differ from Slate.
- **Must not:** cells or rows disappear; text outside the highlighted cells is deleted; Enter splits a cell.

---

## Undo across pages (4 min)

### X-1 · Undo where Slate has it
- **Where:** check-lists, hovering-toolbar, iframe, images, tables, markdown-preview, search-highlighting, shadow-dom · Chrome · 4 min
- **Steps:**
  1. On each page, type `abc` in the first paragraph, or in a cell on tables.
  2. Press Cmd+Z.
- **Should:** Cmd+Z removes `abc`, as it does on Slate.
- **Known:** beta's source has no undo on these eight pages. A failure is expected; log it as one finding listing the pages, not eight findings.

---

**Total: 145 min.** Every page has at least one check in Chrome, Safari and Firefox. The iPhone runs G-1, CL-2, CP-1, CP-2, EV-1, EM-2, FL-1, HT-3, HD-1, IM-1, IN-2, MP-1, MS-1, MN-3, PH-1, PT-2, RO-1, RT-2, SD-1 and TB-1.
