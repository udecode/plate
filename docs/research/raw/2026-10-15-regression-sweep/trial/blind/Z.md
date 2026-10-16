# Sweep P1: beta Plite examples vs Slate

**How to run it.** Open the beta page and its Slate reference side by side. Do every step on both pages: `expect` is whatever the reference does. On the Mac, keep the console open in each browser. Each card's minutes cover every browser it lists. The total is 139 minutes for 38 cards. Tick a box when that browser passes. When a box fails, run Maintainer's issue-draft with a beta recording and a reference recording, name the card id in the draft, and write the draft's path next to the box.

**Scope.**
- These are the 22 pages you named. `android-tests` is also in the P1 list, but you didn't name it, so it's left out.
- Anything only the beta page has is a P3 check, so it's not here. That covers code auto-indent, the clear-formatting button, extra hotkeys, Tab between table cells, virtualized-rendering controls, numbered-list shortcuts and the extra HTML paste mappings.
- Undo is checked only where the reference page has undo. Eight beta pages don't load the undo (history) plugin, but their Slate originals have undo: check-lists, hovering-toolbar, iframe, images, markdown-preview, search-highlighting, shadow-dom and tables. Expect those undo steps to fail.

**Browser names.** Chrome, Safari and Firefox mean the Mac browsers. iPhone means Safari on the iPhone.

---

### SWEEP-CHECK-LISTS-001 Clicking a checkbox toggles one item
- page: https://beta.platejs.org/examples/plite/check-lists
- reference: https://www.slatejs.org/examples/check-lists
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded
- do: click (tap on iPhone) the checkbox of "Criss-cross." twice. On the Mac, click once more, then press Cmd+Z.
- expect: each click checks or unchecks only that item. A checked item shows strike-through and faded text. Cmd+Z undoes the last toggle, as on the reference.
- must-not: a click toggles a neighbor or toggles twice; the page scrolls; text gets selected; a console error
- miss: focus and first click (#5126); features used together (undo after the action)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-CHECK-LISTS-002 Backspace at the start of an item turns it into a paragraph
- page: …/plite/check-lists · reference: …/examples/check-lists
- on: Chrome, Safari, iPhone
- given: caret at the start of "Criss-cross!" (the checked item)
- do: Backspace, then type "a". On the Mac, press Cmd+Z twice.
- expect: the item becomes a plain paragraph with no checkbox and its text intact. "a" lands at the start of that paragraph. Undo restores the checked item, as on the reference.
- must-not: the text merges into "Criss-cross."; the caret jumps; on iPhone, the keyboard closes or Backspace deletes a character instead
- miss: native keys (7cbec2435f)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] iPhone

### SWEEP-CODE-HIGHLIGHTING-001 The language select re-highlights the block
- page: …/plite/code-highlighting · reference: …/examples/code-highlighting
- on: Chrome, Safari, Firefox
- given: caret inside the first code block
- do: set that block's language select to Python, then back to its original language. Click into the block and type "x".
- expect: the colors change with each language, the code text stays the same, and "x" lands where you clicked
- must-not: the select doesn't open on the first click; text changes; the colors drift off their words; a console error
- miss: focus and first click (`665b2bb598`)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-CODE-HIGHLIGHTING-002 Tab and Enter inside code
- page: …/plite/code-highlighting · reference: …/examples/code-highlighting
- on: Chrome, Safari, Firefox, iPhone (Enter only)
- given: caret in the middle of a line in the first code block
- do: Tab, type "x", then Enter and type "y"
- expect: Tab inserts two spaces. "y" sits on a new line inside the same code block, and highlighting continues on both lines, as on the reference. The beta page may also indent the new line; that's fine.
- must-not: Tab moves focus out of the editor; Enter leaves the code block or makes an ordinary paragraph; the caret is drawn on a different line from where typing lands
- miss: native keys (7cbec2435f); caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-CODE-HIGHLIGHTING-003 The code button turns a paragraph into a code block
- page: …/plite/code-highlighting · reference: …/examples/code-highlighting
- on: Chrome, Safari
- given: caret in "There you have it!"
- do: click the code toolbar button once, type "z", then Cmd+Z twice
- expect: the paragraph becomes a highlighted code block on the first click, "z" lands in it, and undo restores the paragraph
- must-not: a second click is needed; the caret leaves the editor; other paragraphs get converted
- miss: focus and first click (#5085)
- layer: browser
- minutes: 2
- [ ] Chrome [ ] Safari

### SWEEP-CUSTOM-PLACEHOLDER-001 The custom placeholder hides and comes back
- page: …/plite/custom-placeholder · reference: …/examples/custom-placeholder
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded, editor empty
- do: click (tap) the editor, type "a", then Backspace
- expect: the custom placeholder ("Type something" plus the renderPlaceholder note) shows while empty and hides on "a". After Backspace it comes back with a visible caret at the start of the line.
- must-not: the caret lands inside or after the placeholder text; the placeholder stays visible while there's text; the line height jumps
- miss: caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-EDITABLE-VOIDS-001 Typing in the Name input stays in the input
- page: …/plite/editable-voids · reference: …/examples/editable-voids
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded
- do: click the "Name:" input, type "Ada", press Left Arrow, Backspace, then click the "Right" radio
- expect: the input reads "Aa" with the caret where you left it, "Right" is selected, and the editor text is unchanged
- must-not: characters or Backspace act on the editor; focus jumps to the editor after one key; the radio needs two clicks
- miss: focus and first click (#5085)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-EDITABLE-VOIDS-002 A new card's text box takes its own typing
- page: …/plite/editable-voids · reference: …/examples/editable-voids
- on: Chrome, Safari
- given: caret at the end of the first paragraph
- do: click the add toolbar button. Click into the new card's "Tell us about yourself" text box and type "hi". Then click the end of the first paragraph and type "x".
- expect: a second card appears after the first paragraph, "hi" lands in the new card's text box, and "x" lands in the first paragraph. The new card's starting text differs between the pages; ignore that.
- must-not: "hi" lands in the outer editor or the first card; a click needs repeating; the selection is painted in two places
- miss: caret and selection paint (d282fd8a33)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari

### SWEEP-EMBEDS-001 Editing the URL swaps the video
- page: …/plite/embeds · reference: …/examples/embeds
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded
- do: play the video for a second. Click the URL input under it, select all in the input, and type `https://player.vimeo.com/video/76979871`.
- expect: the first video plays, the input keeps focus through every character, and the new video loads, as on the reference
- must-not: keystrokes land in the editor; the input loses focus after one character; the player stays blank or won't play (the beta iframe is sandboxed)
- miss: demo wiring and deploy (98bc0c03a6)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-FORCED-LAYOUT-001 Enter at the end of the title adds a line
- page: …/plite/forced-layout · reference: …/examples/forced-layout
- on: Chrome, Safari, iPhone
- given: caret at the end of the title
- do: Enter, then type "a"
- expect: "a" sits in a new paragraph under the title, as on the reference
- must-not: "a" joins the title; a second title appears; a console error
- miss: demo wiring and deploy (98bc0c03a6)
- layer: unit
- minutes: 2
- [ ] Chrome [ ] Safari [ ] iPhone

### SWEEP-FORCED-LAYOUT-002 Deleting everything keeps a title and a paragraph
- page: …/plite/forced-layout · reference: …/examples/forced-layout
- on: Chrome, Safari, Firefox
- given: caret in the paragraph
- do: Cmd+A, Backspace, type "T", Enter, type "b", then Cmd+Z until the original text returns
- expect: a title line remains. The reference briefly fills it with "Untitled" selected, so "T" replaces it. "T" ends up in the title and "b" in a paragraph under it. Undo restores the original two blocks.
- must-not: the title becomes a paragraph; "b" lands in the title; an empty block can't be typed into; a console error
- miss: tests that pinned the bug (e1fb01295e)
- layer: unit
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-HOVERING-TOOLBAR-001 The menu formats the selection on the first click
- page: …/plite/hovering-toolbar · reference: …/examples/hovering-toolbar
- on: Chrome, Safari, Firefox
- given: page freshly loaded
- do: double-click "hovering". Click Bold, then Italic. Press Right Arrow and type "z". Then Cmd+Z.
- expect: the menu appears just above "hovering", each click applies on the first try, the word stays selected in one highlight color, and the menu hides once the selection collapses. Undo removes the last change, as on the reference.
- must-not: the selection collapses after a click; the menu covers the word or sits elsewhere; two highlight layers; a console error
- miss: focus and first click (#5085)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-HOVERING-TOOLBAR-002 The iPhone menu keeps the keyboard and survives a scroll
- page: …/plite/hovering-toolbar · reference: …/examples/hovering-toolbar
- on: iPhone
- given: page loaded, tap into the first paragraph
- do: long-press "hovering" to select it, tap Bold, scroll the page a little, then tap Italic
- expect: the menu appears above the word and moves with it while scrolling. Both taps apply. The keyboard and the selection stay up.
- must-not: Bold closes the keyboard or drops the selection; the menu stays put while the text scrolls; dragging on the menu applies a mark
- miss: native keys (iPhone Bold closing the keyboard); layout that moves during a gesture (#5113)
- layer: device
- minutes: 3
- [ ] iPhone

### SWEEP-HUGE-DOCUMENT-001 Typing deep in the document
- page: …/plite/huge-document · reference: …/examples/huge-document
- on: Chrome, Safari, Firefox
- given: default settings, scrolled to about the middle of the document
- do: click in a paragraph, type "hello", Enter, type "x". Scroll to the top, then back.
- expect: the text stays where it was typed, the caret is visible after each key, and the page doesn't move while typing. "Last keypress (ms)" is in the same range as the reference's.
- must-not: the caret or the scroll position jumps; blank gaps or missing blocks after scrolling back; typed text lost
- miss: layout that moves during a gesture (#5113)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-HUGE-DOCUMENT-002 Select all and copy the whole document
- page: …/plite/huge-document · reference: …/examples/huge-document
- on: Chrome, Safari
- given: "Blocks:" set to 1,000 on both pages
- do: click in the editor, Cmd+A, Cmd+C, and paste into TextEdit
- expect: the pasted text runs from the first heading to the last paragraph, with the same block count as the reference's paste
- must-not: only the visible part is copied; the selection highlight covers only part of the document; the page freezes
- miss: clipboard and paste (#4612)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari

### SWEEP-IFRAME-001 The outside toolbar formats text inside the iframe
- page: …/plite/iframe · reference: …/examples/iframe
- on: Chrome, Safari, Firefox
- given: page freshly loaded
- do: double-click "particularly". Click Bold, press Cmd+I, then Cmd+Z. Then click outside the iframe.
- expect: Bold applies on the first click, Cmd+I toggles italic, the word stays selected inside the iframe, and undo reverts the last change, as on the reference. Clicking outside clears the selection.
- must-not: the toolbar click loses the iframe selection; hotkeys do nothing; button states don't match the selection; a console error
- miss: focus and first click (#5085)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-IMAGES-001 Select an image and delete it
- page: …/plite/images · reference: …/examples/images
- on: Chrome, Safari, Firefox, iPhone
- given: page loaded. The reference's images may show as broken because its image host is gone; compare behavior, not pictures.
- do: click (tap) the first image, click its delete button, type "x", then Cmd+Z on the Mac
- expect: the image gets a blue ring and a delete button, one click removes it, "x" lands next to where it was, and undo brings it back, as on the reference
- must-not: two rings or a ring plus a text highlight; the delete button needs two clicks; the caret disappears after the deletion
- miss: caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-IMAGES-002 Arrow keys across an image
- page: …/plite/images · reference: …/examples/images
- on: Chrome, Safari, Firefox
- given: caret at the end of the paragraph above an image
- do: Right Arrow twice, then Left Arrow twice
- expect: the first Right selects the image (blue ring) and the second puts the caret at the start of the next block. Left retraces the same stops in reverse, as on the reference.
- must-not: a step skips the image or gets stuck; the caret is invisible next to the image; the ring stays after leaving
- miss: caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-IMAGES-003 The image button inserts from a URL
- page: …/plite/images · reference: …/examples/images
- on: Chrome, Safari
- given: caret at the end of the first paragraph
- do: click the image button and enter `https://picsum.photos/id/10/160/90.jpg`. Repeat with `https://example.com`.
- expect: the first URL inserts an image followed by an empty paragraph. The second shows "URL is not an image".
- must-not: the image lands somewhere other than the caret; no empty paragraph after it; the prompt needs two clicks
- miss: focus and first click (#5085)
- layer: browser
- minutes: 2
- [ ] Chrome [ ] Safari

### SWEEP-INLINES-001 Arrow keys step in and out of inlines
- page: …/plite/inlines · reference: …/examples/inlines
- on: Chrome, Safari, Firefox
- given: caret just before "hyperlink"
- do: press Right Arrow until past the link and type "x". Put the caret before "editable button", repeat, and type "y".
- expect: the arrow stops and where "x" and "y" land (inside or outside the inline) match the reference exactly
- must-not: a stop is skipped; the caret is invisible at an inline edge; the read-only "Approved" badge takes the caret
- miss: caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-INLINES-002 Typing a space and Enter inside the editable button
- page: …/plite/inlines · reference: …/examples/inlines
- on: Chrome, Safari, iPhone
- given: caret between "editable" and "button" inside the button inline
- do: type " ok ", then press Enter
- expect: " ok " is inserted inside the button, spaces included, and Enter does what it does on the reference
- must-not: spaces or Enter are swallowed; a focus ring appears on the button; focus leaves the editor
- miss: native keys (7cbec2435f)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] iPhone

### SWEEP-INLINES-003 Pasting a URL over a selection makes a link
- page: …/plite/inlines · reference: …/examples/inlines
- on: Chrome, Safari
- given: `https://example.com` copied from the address bar
- do: double-click "unusual", Cmd+V, then Cmd+Z
- expect: "unusual" becomes a link to example.com with its text unchanged, and undo removes the link, as on the reference
- must-not: the URL text replaces the word; the link wraps more or less than the word; nothing happens
- miss: clipboard and paste (#4612)
- layer: browser
- minutes: 2
- [ ] Chrome [ ] Safari

### SWEEP-MARKDOWN-PREVIEW-001 Markdown decorations follow the typing
- page: …/plite/markdown-preview · reference: …/examples/markdown-preview
- on: Chrome, Safari, Firefox, iPhone
- given: caret at the end of the last paragraph
- do: Enter, type `# Hi`, Enter, type `**bold** and _it_`, then Cmd+Z on the Mac
- expect: the heading and the bold and italic styles appear as each token closes, the caret stays right after the last character typed, and undo reverts typing, as on the reference
- must-not: the caret jumps when a style applies; a character is lost or doubled; styles stick after the markers are deleted
- miss: caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-MARKDOWN-SHORTCUTS-001 Shortcut prefixes make blocks and Backspace reverts them
- page: …/plite/markdown-shortcuts · reference: …/examples/markdown-shortcuts
- on: Chrome, Safari, Firefox, iPhone
- given: caret at the end of the last paragraph
- do: Enter, type `> q`, Backspace twice. Type `- a`, Backspace twice. Type `### h`.
- expect: `> ` makes a quote. Backspace at its start turns it back into a paragraph. `- ` makes a bulleted item, which Backspace at its start turns back into a plain paragraph. `### ` makes a heading three. All as on the reference.
- must-not: the prefix text stays visible; the caret leaves the block; on iPhone, autocorrect or smart punctuation stops the shortcut on beta but not on the reference
- miss: input methods and mobile (#5137)
- layer: browser
- minutes: 5
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-MENTIONS-001 Picking a mention with the keyboard
- page: …/plite/mentions · reference: …/examples/mentions
- on: Chrome, Safari, Firefox
- given: caret at the end of the last paragraph
- do: type ` @ma`, ArrowDown, ArrowUp, Enter, then type ` hi`. Type ` @lu` and press Escape.
- expect: the list opens under the caret with the same names as the reference, the highlight moves and wraps around, and Enter replaces `@ma` with a chip. " hi" follows the chip. Escape closes the list and leaves `@lu` as text.
- must-not: the list opens away from the caret or off screen; Enter adds a new line; the caret lands before the chip; a console error
- miss: layout that moves during a gesture (af8b477822)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-MENTIONS-002 Picking a mention by click or tap
- page: …/plite/mentions · reference: …/examples/mentions
- on: Chrome, Safari, iPhone
- given: caret at the end of the last paragraph
- do: type ` @r` and click (tap) "R2-D2" in the list. Click (tap) right after the chip and type "x".
- expect: the chip replaces `@r` exactly, the list closes, and "x" lands after the chip
- must-not: `@r` text remains; the chip lands elsewhere; the list stays open; the iPhone keyboard covers the list
- miss: focus and first click (#5126)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] iPhone

### SWEEP-PASTE-HTML-001 Pasting rich HTML keeps basic formatting
- page: …/plite/paste-html · reference: …/examples/paste-html
- on: Chrome, Safari, Firefox
- given: on https://www.slatejs.org/examples/richtext, select from the first paragraph through "A wise quote." and copy
- do: paste at the end of each editor, then Cmd+Z
- expect: bold, italic, code and the block quote come through with the same blocks and line breaks as the reference's paste, and one undo removes the whole paste
- must-not: a plain-text paste; lost or extra line breaks; extra empty paragraphs; the caret is not at the end of the pasted content
- miss: tests that pinned the bug (e1fb01295e)
- layer: browser
- minutes: 5
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-PASTE-HTML-002 Pasting plain text
- page: …/plite/paste-html · reference: …/examples/paste-html
- on: Chrome, Safari
- given: two lines of plain text copied from TextEdit in plain-text mode
- do: paste in the middle of the first paragraph
- expect: the line split matches the reference's paste
- must-not: lines are merged or doubled; the text after the caret moves to the wrong block
- miss: clipboard and paste (#4612)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari

### SWEEP-PLAINTEXT-001 Native Mac editing keys
- page: …/plite/plaintext · reference: …/examples/plaintext
- on: Chrome, Safari, Firefox
- given: caret in the middle of the line
- do: Option+Left, Option+Shift+Right, Option+Backspace, Cmd+Backspace, then Cmd+Z and Cmd+Shift+Z
- expect: each key moves, extends or deletes by word or to the line start, exactly as on the reference, and undo and redo restore the text and the caret
- must-not: a key deletes one character instead of a word; the caret is drawn somewhere other than where typing lands; undo restores the text but not the caret
- miss: native keys (7cbec2435f)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-PLAINTEXT-002 iPhone input methods
- page: …/plite/plaintext · reference: …/examples/plaintext
- on: iPhone
- given: an English keyboard and a second language, such as Pinyin, enabled
- do: type "teh " to trigger autocorrect, tap a predictive word, double-space for a period, and hold the space bar to move the caret. Switch to Pinyin and enter "ni hao".
- expect: each input lands as it does on the reference, and the caret stays where the text goes
- must-not: autocorrect duplicates or drops text; composed Pinyin text is doubled or lost; the caret jumps after composing
- miss: input methods and mobile (#5137)
- layer: device
- minutes: 4
- [ ] iPhone

### SWEEP-READ-ONLY-001 Text can be selected but not changed
- page: …/plite/read-only · reference: …/examples/read-only
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded
- do: double-click (long-press) "editable" and copy it. Type "x", press Backspace, and paste.
- expect: the word selects and copies, and the text never changes. On iPhone, no keyboard opens.
- must-not: any edit lands; a caret appears; selection is blocked
- miss: demo wiring and deploy (b1e70bb257)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-RICHTEXT-001 Toolbar marks apply on the first click and keep the selection
- page: …/plite/richtext · reference: …/examples/richtext
- on: Chrome, Safari, Firefox
- given: page freshly loaded
- do: double-click "editable". Click Bold, then Underline. Press Right Arrow and type "z". Then Cmd+Z twice and Cmd+Shift+Z.
- expect: each click applies on the first try, "editable" stays selected in one highlight color, and the active buttons match its marks. "z" takes the marks it takes on the reference. Undo and redo step through the changes.
- must-not: a click needs repeating; the selection collapses or is drawn twice; button states go stale; a console error
- miss: focus and first click (#5085)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-RICHTEXT-002 Block buttons together with lists and undo
- page: …/plite/richtext · reference: …/examples/richtext
- on: Chrome, Safari
- given: caret in "Since it's rich text…"
- do: click Heading one twice. Click Bulleted list, press End, then Enter, and type "b". Click Numbered list, then Align center. Press Cmd+Z until the paragraph returns.
- expect: Heading one toggles on and off. The bulleted list wraps the block, Enter makes a second item for "b", and Numbered list switches the list type. Align center centers. Undo walks back each step. All as on the reference.
- must-not: a button acts on the wrong block; the list is left half-wrapped; undo skips steps or loses "b"
- miss: features used together (nested lists and headings)
- layer: unit
- minutes: 4
- [ ] Chrome [ ] Safari

### SWEEP-RICHTEXT-003 Mark hotkeys with a collapsed caret
- page: …/plite/richtext · reference: …/examples/richtext
- on: Chrome, Safari, Firefox
- given: caret at the end of the first paragraph
- do: Cmd+B, type "bo", Cmd+B, type "x". Repeat with Cmd+I, Cmd+U and Cmd+`.
- expect: only the text typed while a mark is on gets that mark, and the button states match, as on the reference
- must-not: the browser's own shortcut fires (for example, Cmd+` switching windows on beta only); a mark sticks after it's toggled off
- miss: native keys (7cbec2435f)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-RICHTEXT-004 iPhone toolbar keeps the keyboard
- page: …/plite/richtext · reference: …/examples/richtext
- on: iPhone
- given: tap into the first paragraph
- do: long-press "editable" to select it and tap Bold. Swipe across the toolbar as if scrolling, then tap Italic.
- expect: Bold and Italic apply, and the keyboard and the selection stay up
- must-not: Bold closes the keyboard; the swipe applies a format; a tap needs repeating
- miss: native keys (iPhone Bold closing the keyboard)
- layer: device
- minutes: 3
- [ ] iPhone

### SWEEP-SEARCH-HIGHLIGHTING-001 Highlights track the search and the edits
- page: …/plite/search-highlighting · reference: …/examples/search-highlighting
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded
- do: type "text" in the search box. Click inside a highlighted word in the editor and type "s". Cmd+Z on the Mac. Clear the search box.
- expect: every lowercase "text" is highlighted, the highlights update as you edit, undo reverts the edit, as on the reference, and clearing the box removes all highlights
- must-not: the search box loses focus while typing; the caret jumps when the highlights redraw; stale highlights remain
- miss: caret and selection paint (d282fd8a33)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-SHADOW-DOM-001 Editing inside nested shadow roots
- page: …/plite/shadow-dom · reference: …/examples/shadow-dom
- on: Chrome, Safari, Firefox, iPhone
- given: page freshly loaded
- do: click (tap) mid-sentence and type "x". Double-click "nested". On the Mac, press Option+Shift+Right, then Cmd+Z.
- expect: the caret appears where you clicked, "x" lands there, the selection paints and extends as on the reference, and undo reverts
- must-not: the caret is drawn somewhere other than where typing lands; the selection is invisible or doubled; a console error
- miss: caret and selection paint (d282fd8a33)
- layer: browser
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-STYLING-001 Both styled editors render and edit separately
- page: …/plite/styling · reference: …/examples/styling
- on: Chrome, Safari, Firefox
- given: page freshly loaded
- do: click the empty yellow area under the first editor's text and type "a". Click the second editor and type "b".
- expect: the yellow box, its green outline, the second editor's "fancy" style and the spacing match the reference. "a" lands at the end of the first editor and "b" in the second.
- must-not: a click in the empty area does nothing; text lands in the other editor; the styles are missing
- miss: demo wiring and deploy (b1e70bb257)
- layer: browser
- minutes: 2
- [ ] Chrome [ ] Safari [ ] Firefox

### SWEEP-TABLES-001 Cell edges block Backspace, Delete and Enter
- page: …/plite/tables · reference: …/examples/tables
- on: Chrome, Safari, Firefox, iPhone
- given: caret at the start of "Dog"
- do: Backspace. Put the caret at the end of "Human" and press Fn+Delete (Mac only). In the cell "4", press Enter and type "9". On the Mac, press Cmd+Z.
- expect: Backspace, Delete and Enter change nothing, "9" lands in that cell, and undo removes it, as on the reference
- must-not: cells merge; a new line or row appears; the caret leaves the cell; on iPhone, Backspace deletes across the cell edge
- miss: native keys (7cbec2435f)
- layer: unit
- minutes: 4
- [ ] Chrome [ ] Safari [ ] Firefox [ ] iPhone

### SWEEP-TABLES-002 Arrow keys move between cells
- page: …/plite/tables · reference: …/examples/tables
- on: Chrome, Safari, Firefox
- given: caret in the "2" cell
- do: Down, Right, Up, Left, then type "x"
- expect: each key lands in the same cell as on the reference, the caret is visible after each one, and "x" lands in the last cell reached
- must-not: the caret disappears or stops in a spot outside any cell; a key skips a cell; the caret leaves the table
- miss: caret and selection paint (`8b80aa771a`)
- layer: browser
- minutes: 3
- [ ] Chrome [ ] Safari [ ] Firefox
