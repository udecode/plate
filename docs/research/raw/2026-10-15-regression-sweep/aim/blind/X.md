# Beta docs QA checklist: beta.platejs.org vs platejs.org

## How to run it

- **Where:** Mac Chrome (**Ch**), Mac Safari (**Sa**) and Mac Firefox (**Ff**), all current versions, with each window at least 1280 px wide. Also iPhone Safari (**iOS**), not in private mode. ⌘ means Cmd.
- **Pairs.** Run every check on `https://platejs.org/docs/<name>` first, then on `https://beta.platejs.org/docs/<name>`, in the same browser. Keep one tab per site.
- **Reset.** Reload the page before each check so the demo starts with its built-in content. Wait for the demo editor itself to appear, not just the page heading or a "Loading…" placeholder.
- **Typing.** Type on the real keyboard. Paste only when a step says to. Turn off extensions that write into text fields, such as Grammarly or password managers.
- **Scope.** Every demo includes the full editor (toolbars, slash menu, drag handles). Test only the feature the check names.
- **Results.** Log the check id, the browser and one result. Add a screenshot or recording for anything other than Pass.
  - **Pass:** beta does what *Expect* says and is no worse than stable.
  - **Bug:** beta fails, or does something under *Must not*, where stable works.
  - **Both:** stable fails the same way. Log it as low priority.
  - **N/A:** stable doesn't have the feature. Skip the beta half.
- **Known intentional change (don't file):** beta's table of contents no longer highlights the current heading while you scroll.

**Total: 145 min**

---

## Setup and phone sweep

### S-01 · all pages · Setup
- **Where:** Ch, Sa, Ff, iOS
- **Start:** Fresh browser windows.
- **Steps:**
  1. In each Mac browser, open the stable and beta tabs for `basic-blocks`.
  2. Set both sites to the light theme.
  3. On the iPhone, open both URLs in Safari tabs.
- **Expect:** Both sites load, and you can click into the demo editor and type a letter.
- **Must not:** A login wall, a certificate warning or an error overlay on beta.
- **Time:** 3 min

### SM-01 · all 16 pages · Phone layout sweep
- **Where:** iOS
- **Start:** Portrait, top of each page.
- **Steps:** For each of the 16 pages, on stable and then beta:
  1. Scroll from top to bottom.
  2. Try to swipe the page sideways.
  3. Look at the first demo and its toolbar.
- **Expect:**
  - The page fits the screen width, and the demo fills the content column.
  - The toolbar either wraps or scrolls inside its own strip.
  - Code samples scroll inside their own box.
  - Text is readable without zooming.
- **Must not:** The whole page scrolls sideways. The demo is squeezed into a narrow column or cut off. The demo never loads, or an error page shows.
- **Time:** 12 min

---

## basic-blocks

### BB-01 · basic-blocks · Markdown block shortcuts
- **Where:** Ch, Sa, Ff
- **Start:** Click at the end of the demo's last paragraph and press Enter.
- **Steps:**
  1. Type `## Title`.
  2. Press Enter and type `> Quote`.
  3. Press Enter twice and type `---`.
- **Expect:**
  - `## ` turns the line into Heading 2, and "Title" goes into the heading.
  - Enter after the heading gives a normal paragraph.
  - `> ` makes a blockquote.
  - `---` becomes a horizontal rule, with the caret in an empty paragraph below it.
- **Must not:** The `##`, `>` or `-` characters stay in the text. Letters are lost or reordered (for example "itleT"). The caret jumps to the start of the line.
- **Time:** 5 min

### BB-02 · basic-blocks · Heading and quote hotkeys
- **Where:** Ch
- **Start:** Caret in a normal paragraph.
- **Steps:**
  1. Press ⌘⌥1, then ⌘⌥2, then ⌘⌥3.
  2. Press ⌘⇧. (period).
  3. Make a new empty Heading 1 and press Enter.
- **Expect:**
  - The block becomes H1, then H2, then H3.
  - ⌘⇧. turns the blockquote on and off.
  - Enter on an empty heading leaves a normal paragraph.
  - Beta matches stable on each step. Mark any hotkey stable lacks as N/A.
- **Must not:** Chrome runs its own command for the key instead, or text is lost.
- **Time:** 3 min

### BB-03 · basic-blocks · Moving past the horizontal rule
- **Where:** Sa, Ff
- **Start:** Caret at the end of the paragraph just above the demo's horizontal rule.
- **Steps:**
  1. Press ArrowDown twice.
  2. Click the rule itself.
  3. Press Backspace.
  4. Press ⌘Z.
- **Expect:**
  - The arrow keys move the caret past the rule into the next paragraph.
  - Clicking the rule shows it as selected.
  - Backspace removes the rule, and ⌘Z brings it back.
- **Must not:** The caret disappears or gets stuck on the rule. Typed text goes nowhere. The rule is duplicated, or the paragraph next to it is deleted.
- **Time:** 3 min

---

## basic-marks

### BM-01 · basic-marks · Mark hotkeys and tooltips
- **Where:** Ch, Sa, Ff
- **Start:** A new empty paragraph at the end of the demo.
- **Steps:**
  1. Press ⌘B, type `bold`, press ⌘B again and type ` plain`.
  2. Do the same with ⌘I, ⌘U and ⌘E (inline code).
  3. Select a word and press ⌘⇧X (strikethrough), then ⌘⇧H (highlight).
  4. Hover the toolbar's Strikethrough button and press the shortcut its tooltip shows.
- **Expect:**
  - Each mark applies to what you type after the first press and stops after the second.
  - The toolbar button shows as active while the caret is inside the mark.
  - Every tooltip shortcut works.
- **Must not:** The browser runs its own command instead (for example Firefox opens the page source on ⌘U, or the home page opens on ⌘⇧H). A mark carries on into ` plain`. A tooltip shows a shortcut that does nothing.
- **Time:** 6 min

### BM-02 · basic-marks · Markdown marks
- **Where:** Ch, iOS
- **Start:** A new empty paragraph.
- **Steps:** Type each of these. On the iPhone, use the on-screen keyboard.
  1. `**bold** `
  2. `*it* `
  3. `` `code` `` followed by a space
  4. `~~gone~~ `
- **Expect:** Each one becomes its mark with the symbols removed, and the text after it is plain.
- **Must not:** Leftover `*`, `` ` `` or `~`. The mark carries on to the next word. On iOS, autocorrect rewrites the word or doubles letters.
- **Time:** 3 min

---

## list

### LI-01 · list · Make, nest and leave a list
- **Where:** Ch, Sa, Ff
- **Start:** A new empty paragraph at the end of the demo.
- **Steps:**
  1. Type `- a`, press Enter and type `b`.
  2. Press Tab, type `c`, then press Shift+Tab.
  3. Press Enter on the empty item.
  4. Type `1. one`, press Enter and type `two`.
  5. Press Enter twice and type `[] task`.
- **Expect:**
  - Tab indents the bullet and Shift+Tab outdents it.
  - Enter on an empty item leaves the list.
  - The numbered items read 1 and 2.
  - `[] ` makes a to-do item with an empty checkbox.
- **Must not:** Tab moves focus out of the editor. A nested item is lost. The numbering is wrong. The markdown characters stay in the text.
- **Time:** 6 min

### LI-02 · list · To-do checkbox
- **Where:** Sa, iOS
- **Start:** The demo's "Todo 1" (checked) and "Todo 2" (unchecked).
- **Steps:**
  1. Click (or tap) the checkbox of "Todo 1", then the one of "Todo 2".
  2. Type a letter.
- **Expect:** Each box flips once and the item's style updates. The letter goes where the caret was before the click.
- **Must not:** A box toggles twice or not at all. The item text gets selected. The page jumps. On iOS, the page zooms in.
- **Time:** 3 min

---

## details

### DE-01 · details · Collapse, expand and edit
- **Where:** Ch, iOS
- **Start:** Open stable `/docs/details` first. If the page is missing or has no demo, mark this check N/A.
- **Steps:**
  1. Click the arrow next to "Why use semantic Details?" to collapse it, then click it again to expand.
  2. Click at the end of that title line and type `!`.
  3. Press Enter.
- **Expect:**
  - The content hides, then comes back intact, including the nested item.
  - `!` goes into the title line.
  - Enter does the same thing as on stable.
- **Must not:** Content is lost after collapsing. The caret gets stuck inside the hidden content. On iOS, tapping the arrow opens the keyboard or zooms the page.
- **Time:** 3 min

---

## table

### TA-01 · table · Insert a table and move between cells
- **Where:** Ch, Ff
- **Start:** Caret in an empty paragraph below the demo table.
- **Steps:**
  1. In the toolbar's Table menu, pick a 3×3 grid.
  2. Type `a`, press Tab, type `b`, then press Shift+Tab.
  3. Press ArrowDown.
  4. Click the last cell and press Tab.
- **Expect:**
  - The table appears at the caret.
  - Text lands in the cell that has the caret.
  - Tab and Shift+Tab move one cell. ArrowDown moves to the cell below.
  - Tab in the last cell does what it does on stable.
- **Must not:** Tab moves focus out of the editor. Text goes into the wrong cell. An empty paragraph appears inside a cell.
- **Time:** 4 min

### TA-02 · table · Select and merge several cells
- **Where:** Ch, Ff, Sa
- **Start:** The first table demo.
- **Steps:**
  1. Press the mouse in the "Heading" cell, drag down and right by one cell, and release.
  2. Merge the cells from the table toolbar.
  3. Press ⌘Z.
- **Expect:**
  - The covered cells show as selected.
  - The merged cell keeps the text from every cell.
  - ⌘Z restores the original cells.
  - Firefox behaves the same as Chrome.
- **Must not:** Two selection highlights show at once (blue text plus a cell highlight that don't line up). The selection jumps to the whole table. Text is lost in the merge.
- **Time:** 5 min

### TA-03 · table · Resize a column
- **Where:** Ch, Sa
- **Start:** The first table demo.
- **Steps:**
  1. Hover the border between the first and second columns.
  2. Drag it about 50 px to the right and release.
  3. Click a cell and type.
- **Expect:** A resize cursor shows on hover. The column widens and stays at that width after you let go. Typing still works.
- **Must not:** Cell text gets selected while dragging. The column snaps back. The page scrolls.
- **Time:** 3 min

### TA-04 · table · Phone editing in a table
- **Where:** iOS
- **Start:** The first table demo, in portrait.
- **Steps:**
  1. Tap the "Void" header cell and type `x`.
  2. Swipe sideways across the table.
- **Expect:** `x` lands in that cell, and the cell stays visible above the keyboard. A table wider than the screen scrolls inside its own box.
- **Must not:** The whole page scrolls sideways. The caret ends up in a different cell. The keyboard hides the cell and you can't scroll it back into view.
- **Time:** 3 min

---

## code-block

### CB-01 · code-block · Make and edit a code block
- **Where:** Ch, Sa, Ff
- **Start:** A new empty paragraph at the end of the first demo.
- **Steps:**
  1. Type three backticks (```` ``` ````), plus Enter or a space if stable needs one.
  2. Type `const a = 1`, press Enter and type `b`.
  3. Press Tab.
  4. Type `**x**`.
  5. Switch the block's language to Python.
- **Expect:**
  - The code block appears at the same keystroke as on stable.
  - Enter adds a line inside the block.
  - Tab indents the same way as on stable.
  - `**x**` stays as plain characters.
  - The syntax colours change when you switch language.
- **Must not:** Enter starts a new block outside the code. A mark or markdown shortcut fires inside the code. Characters are lost.
- **Time:** 5 min

### CB-02 · code-block · Copy button
- **Where:** Sa, Ff
- **Start:** The demo's JavaScript block.
- **Steps:**
  1. Click the block's copy button.
  2. Paste into TextEdit or the address bar.
- **Expect:** The pasted text is the block's code, exactly as you get from stable.
- **Must not:** Nothing is copied, a permission error appears, or the text has changed.
- **Time:** 2 min

---

## link

### LK-01 · link · Add, edit and remove a link
- **Where:** Ch, Sa
- **Start:** The demo's second paragraph.
- **Steps:**
  1. Double-click "Effortlessly".
  2. Open the link form with the toolbar's Link button, then try ⌘K too. Mark ⌘K N/A if it doesn't open the form on stable.
  3. Type `https://example.com` and press Enter.
  4. Click inside the new link, then edit its text from the popover.
  5. Remove the link (Unlink).
  6. Open the form again, type `example.com` with no `https://`, press Enter, and note what each site does.
- **Expect:**
  - The form opens next to the word, with focus in its field.
  - The link covers only the selected word.
  - The popover's edit, open and unlink actions all work.
  - Escape closes the form.
- **Must not:** The popover opens off-screen. Typing goes into the document while the form is open. The link covers the wrong text. If beta handles `example.com` differently from stable in step 6, log it as Bug with both results.
- **Time:** 5 min

### LK-02 · link · Pasted and typed URLs
- **Where:** Ch, Ff
- **Start:** A new empty paragraph.
- **Steps:**
  1. Copy `https://example.com` from the address bar and paste it.
  2. Type ` https://platejs.org` and a space.
  3. Type `[docs](https://platejs.org)`.
  4. Type ` after`.
- **Expect:**
  - The pasted and typed URLs become links.
  - The `[docs](…)` form becomes a link labelled "docs". Mark this N/A if stable doesn't do it.
  - ` after` is plain text.
- **Must not:** The link carries on into the text typed after it. The markdown characters stay in the text.
- **Time:** 3 min

---

## mention

### MN-01 · mention · Mention menu
- **Where:** Ch, Sa, Ff
- **Start:** The end of the demo's last paragraph.
- **Steps:**
  1. Type ` @bo`.
  2. Press ArrowDown, then Enter.
  3. Type ` hi`.
  4. Press Backspace until the mention is gone.
  5. Type `a@`.
  6. Type ` @`, then press Escape.
- **Expect:**
  - The menu filters as you type.
  - Enter replaces `@bo` with a mention chip, and ` hi` goes after the chip.
  - Backspace deletes the chip.
  - `a@` opens no menu.
  - Escape closes the menu.
- **Must not:** The menu stays open after you pick. Text lands before the chip. The chip appears twice. The caret disappears next to the chip (watch Safari).
- **Time:** 5 min

### MN-02 · mention · Mentions on the phone
- **Where:** iOS
- **Start:** Tap at the end of the last paragraph.
- **Steps:**
  1. Type ` @b`.
  2. Tap a name.
  3. Type ` ok`.
- **Expect:** The menu shows above the keyboard. The tap inserts the chip, the keyboard stays open, and ` ok` goes after the chip.
- **Must not:** The menu is hidden behind the keyboard. The tap closes the keyboard and loses the pick.
- **Time:** 2 min

---

## comment

### CM-01 · comment · Read, add and resolve comments
- **Where:** Ch, Sa
- **Start:** The first comment demo.
- **Steps:**
  1. Click the highlighted word "overlapping".
  2. Type a reply, press Enter, then press Escape.
  3. Select "Alice" in the last paragraph.
  4. Click the toolbar's Comment button, then try ⌘⇧M too. Mark ⌘⇧M N/A if it doesn't start a comment on stable.
  5. Type `test` and press Enter.
  6. Click the new highlight and resolve the thread.
- **Expect:**
  - The thread opens next to the text with its existing messages and avatars.
  - Your reply appears in the thread.
  - The new comment highlights exactly "Alice".
  - Resolving clears or dims that highlight, the same as on stable.
- **Must not:** The popover covers the text and won't close. A reply is lost. Focus stays in the comment box after Escape. The highlight covers the wrong text.
- **Time:** 6 min

### CM-02 · comment · Comment popover on the phone
- **Where:** iOS
- **Start:** The first comment demo.
- **Steps:**
  1. Tap a highlighted comment.
  2. Tap the Reply box, type `ok` and send.
- **Expect:** The popover fits on screen, the Reply box stays visible above the keyboard, and the reply posts.
- **Must not:** The page zooms in when the Reply box gets focus. The keyboard covers the Reply box and you can't scroll it into view.
- **Time:** 3 min

---

## suggestion

### SG-01 · suggestion · Suggest, accept and reject
- **Where:** Ch, Ff, Sa
- **Start:** The first suggestion demo. On both sites, set the toolbar's Mode menu to Suggestion.
- **Steps:**
  1. Type ` extra` at the end of a paragraph.
  2. Select an existing word and press Backspace.
  3. Accept one of the demo's suggested insertions, then press ⌘Z.
  4. Reject one of the demo's suggestions.
  5. Switch Mode to Editing and type. Then switch to Viewing and try to type.
- **Expect:**
  - ` extra` shows as a coloured insertion.
  - The deleted word stays visible with a line through it.
  - Accept turns the insertion into normal text, and ⌘Z brings the suggestion back.
  - Reject does the same as on stable.
  - In Editing mode you type normal text. In Viewing mode you can't type.
- **Must not:** Suggestion mode actually deletes the word. Accept or Reject hits the wrong suggestion. Undo leaves a half-applied change.
- **Time:** 7 min

---

## media

### ME-01 · media · Media already in the demo
- **Where:** Ch, Sa, iOS
- **Start:** The media demo.
- **Steps:**
  1. Scroll through the image, file, audio, video and YouTube embed.
  2. Play the audio, the video and the embed.
- **Expect:**
  - Everything that shows on stable shows on beta, including the caption.
  - Each item plays.
  - On iOS the video plays in the page, not fullscreen.
- **Must not:** A broken-image icon, a blank embed, a player that won't start, or media wider than the screen on iOS.
- **Time:** 4 min

### ME-02 · media · Resize, caption and insert by URL
- **Where:** Ch
- **Start:** The media demo.
- **Steps:**
  1. Click the image and drag its right resize handle inward.
  2. Click the caption and type `x`.
  3. Right-click the image and choose Copy Image Address.
  4. Click the arrow on the toolbar's Image button, choose "Insert via URL", paste the address and press Enter.
- **Expect:** The image resizes smoothly and keeps its alignment. The caption keeps what you typed. A second copy of the image is inserted.
- **Must not:** The width jumps or resets. The caption text is lost when you click away. Nothing is inserted, or a valid address shows "Invalid URL".
- **Time:** 3 min

### ME-03 · media · Upload an image
- **Where:** Ch, iOS
- **Start:** The media demo. Have a small PNG or JPG (under 1 MB) ready, or a photo on the iPhone.
- **Steps:**
  1. Click the toolbar's Image button.
  2. Choose the file (on iOS, from the photo library).
  3. Wait 30 seconds.
- **Expect:** An upload placeholder with progress appears, then the image shows, the same as on stable.
- **Must not:** Beta shows an upload error or toast while stable succeeds, or the upload gets stuck at a percentage. If there's an error, write down its exact text.
- **Time:** 3 min

---

## dnd

### DD-01 · dnd · Drag blocks
- **Where:** Ch, Sa, Ff
- **Start:** The first drag-and-drop demo.
- **Steps:**
  1. Hover "Second item" and drag its grip handle (in the left margin) above "First item". Watch the screen while you drag.
  2. Drop it.
  3. Drag "First item", which has a nested item under it, below "Third item" and drop it.
  4. Press ⌘Z.
- **Expect:**
  - While you drag, a line follows the pointer and shows where the block will land.
  - The block moves and the numbering updates.
  - The nested item moves with its parent.
  - ⌘Z undoes the move.
- **Must not:** The drop line is missing or flickers. A block is duplicated or lost. The drag selects text instead of moving the block. The page jumps.
- **Time:** 6 min

### DD-02 · dnd · Drag handle on the phone
- **Where:** iOS
- **Start:** The first drag-and-drop demo.
- **Steps:**
  1. Tap "Second item".
  2. If a handle appears, long-press it and try to drag.
- **Expect:** Beta behaves the same as stable, whether stable allows a drag or not.
- **Must not:** A block is deleted or duplicated. The page stops scrolling. Text is left selected in an odd way.
- **Time:** 2 min

---

## autoformat

### AF-01 · autoformat · Text replacements
- **Where:** Ch, Sa, Ff
- **Start:** A new empty paragraph at the end of the demo.
- **Steps:**
  1. Type `->`, then press ⌘Z.
  2. Type each of these, followed by a space: `(c)`, `1/2`, `>=`, `"hi"`, `it's`.
- **Expect:**
  - `->` becomes →, and ⌘Z right after brings back `->`, as on stable.
  - The others become ©, ½, ≥, “hi” and it’s, and each matches stable.
- **Must not:** A replacement happens twice. The caret moves. A replacement fires inside inline code or a code block.
- **Time:** 5 min

### AF-02 · autoformat · Markdown shortcuts on the phone
- **Where:** iOS
- **Start:** A new empty paragraph.
- **Steps:** Use the on-screen keyboard.
  1. Type `## Hi`.
  2. Press Return and type `- item`.
  3. Press Return twice and type `"quote"`.
- **Expect:** The heading and the list both apply, and the quote marks come out curly, once.
- **Must not:** Doubled quote marks such as ““. The markdown characters stay in the text. Autocorrect stops the shortcut from firing.
- **Time:** 2 min

---

## slash-command

### SC-01 · slash-command · Slash menu
- **Where:** Ch, Ff, Sa
- **Start:** A new empty paragraph at the end of the demo.
- **Steps:**
  1. Type `/h2`, press Enter and type `Hi`.
  2. On a new line, type `/`, press ArrowDown twice and press Enter.
  3. On a new line, type `/tab` and press Enter.
- **Expect:**
  - The menu opens at the caret and filters as you type.
  - Enter turns the line into Heading 2, `/h2` disappears, and `Hi` goes into the heading.
  - Enter runs the highlighted item.
  - `/tab` inserts a table.
- **Must not:** The menu opens off-screen. The first key after inserting is lost. The `/…` text is left behind.
- **Time:** 5 min

### SC-02 · slash-command · Slash menu with a code block in the document, Escape, mid-word
- **Where:** Ch
- **Start:** The demo with a code block added, using `/code` or the toolbar.
- **Steps:**
  1. Click a normal paragraph outside the code block and type `/`.
  2. Press Escape.
  3. Type `a/`.
- **Expect:**
  - The menu still opens outside the code block, as on stable.
  - Escape closes the menu and keeps the `/`.
  - `a/` opens no menu.
- **Must not:** The menu stops working everywhere once the document has a code block.
- **Time:** 2 min

### SC-03 · slash-command · Slash menu on the phone
- **Where:** iOS
- **Start:** Tap into a new empty line.
- **Steps:**
  1. Type `/`.
  2. Tap "Heading 1".
  3. Type `Hi`.
- **Expect:** The menu shows above the keyboard. The tap applies the heading, the keyboard stays open, and `Hi` goes into the heading.
- **Must not:** The menu is hidden behind the keyboard. The tap closes the keyboard and loses the pick.
- **Time:** 2 min

---

## toc

### TC-01 · toc · Jump to a heading
- **Where:** Ch, Sa
- **Start:** The table of contents demo.
- **Steps:**
  1. In the table of contents, click "Benefits of Using TOC", then "Subsection".
  2. At the end of the demo, type `## New`.
- **Expect:**
  - The demo box scrolls so each heading sits near its top, as on stable.
  - A "New" entry appears in the table of contents right away.
- **Must not:** The whole page scrolls instead of the demo box. Clicking selects text or puts the caret inside the table of contents. Don't file the missing current-heading highlight.
- **Time:** 3 min

### TC-02 · toc · Table of contents on the phone
- **Where:** iOS
- **Start:** The table of contents demo.
- **Steps:** Tap "Example Content" in the table of contents.
- **Expect:** The demo scrolls to that heading.
- **Must not:** The page zooms in, jumps to the top, or opens the keyboard.
- **Time:** 2 min

---

## callout

### CO-01 · callout · Emoji icon picker
- **Where:** Ch, Ff, Sa
- **Start:** The callout demo, at the 💡 "Tip" callout.
- **Steps:**
  1. Click the 💡 icon and type `fire`.
  2. Pick 🔥, using the keyboard or the mouse.
  3. Type `!` in the callout's text.
  4. Open the picker again and press Escape.
- **Expect:**
  - The picker opens next to the icon, and the search narrows the results.
  - The icon changes to 🔥 and the picker closes.
  - `!` goes into the callout.
  - Escape closes the picker without changing anything.
- **Must not:** The picker opens off-screen. The search letters go into the document. The icon changes back after you type.
- **Time:** 4 min

### CO-02 · callout · Emoji picker on the phone
- **Where:** iOS
- **Start:** The callout demo.
- **Steps:**
  1. Tap a callout icon.
  2. Search for `star`.
  3. Tap an emoji.
- **Expect:** The picker fits on screen, the search box works with the keyboard, and the tapped emoji replaces the icon.
- **Must not:** The page zooms in when the search box gets focus. The picker is cut off or hidden behind the keyboard.
- **Time:** 2 min

---

## Time by group

Each check's minutes cover all of its browsers and devices, on both sites.

| Group | Checks | Minutes |
| --- | --- | --- |
| Setup and phone sweep | S-01, SM-01 | 15 |
| basic-blocks, basic-marks, list, details | BB-01 to DE-01 | 32 |
| table, code-block | TA-01 to CB-02 | 22 |
| link, mention, comment, suggestion, media | LK-01 to ME-03 | 41 |
| dnd, autoformat, slash-command, toc, callout | DD-01 to CO-02 | 35 |
| **Total** | 37 checks | **145** |
