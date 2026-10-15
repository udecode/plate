# Where agents missed

These are the kinds of bugs that reached beta from 2026-08-15 to 2026-10-15, grouped from 93 behavioral fix commits on `next`. Counts are per commit. The raw census is in `docs/research/raw/2026-10-15-regression-sweep/census/`. Aim each scenario at one kind, and put the kinds that passed every test first.

| Kind | Fixes | What slipped past the tests | Example commits | Look for |
| --- | --- | --- | --- | --- |
| Focus and first click in popups and toolbars | 14 | The proof covered one control, or started from a different focus than the report | #5085 proven for Bold only while Comment and Turn Into still lost focus; `665b2bb598` date popover proven from the page body, not a heading selection; #5126 two clicks to open a comment | Select real text, click each control once, then type: the text lands in the editor and the selection is kept |
| Caret and selection paint | 10 | A pixel check took two layers for one, or a test asserted the model but not the screen | #5091 a second darker selection layer after a 5 of 5 pixel proof (`d282fd8a33`); caret missing beside a block void (`8b80aa771a`) | One selection color, the caret visible and where the model says, after every action |
| Native keys | 10 | Synthetic key events skipped what the browser does | WebKit keydown without beforeinput (`7cbec2435f`); iPhone Bold closing the keyboard while the simulator passed | Option, Command and Shift arrows, Backspace and Delete by word and line, Enter, in Safari and on the iPhone |
| Layout that moves during a gesture | 10 | The test held the layout still | marquee hit test after a caption grows (`03f2dffc21`); combobox highlight outside its list (`af8b477822`); #5113 drag selection stops following while scrolling | Scroll, resize or grow content in the middle of a drag, a selection or a menu |
| Features used together | 24 | Each feature passed alone | nested Details, lists and headings (12 fixes); suggestions, comments and undo (12) | Undo and redo after the action; the same action inside a list, a table or a toggle |
| Demo wiring and deploy | 8 | Unit tests passed while the page itself broke | every beta demo crashed (`b1e70bb257`); deployed schema crash after green CI (`98bc0c0`); #5064 Enter crash | Load the page, open the console, press Enter and paste once |
| Drag and drop | 3 | The drag spec intercepted the native drag | opaque drag box after 105 green runs (`791a53f92c`); #5070 first block drag crash; #5088 drag makes a text selection | Drag a block, watch the drag image and the drop line, check no text gets selected |
| Clipboard and paste | 4 | A synthetic paste stood in for the real one | Safari block-selection copy (#4612) | Copy and paste with the keyboard between two editors and from another app |
| Input methods and mobile | 2 | Emulation sent no real keyboard events | Android input flush (`24d6596cb5`); Pinyin caret (#5137) | Type with autocorrect and a second keyboard language on a phone |
| Tests that pinned the bug | 3 | The test expected the wrong behavior | Markdown tests pinned the lost line break fixed in `e1fb01295e` | Check the expected result against the reference page, not against today's tests |
