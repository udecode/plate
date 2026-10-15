1. **K1 — Caret after inserting a quote**
   
   **Page:** [slash-command](https://beta.platejs.org/docs/slash-command) · [stable](https://platejs.org/docs/slash-command)  
   **Fix:** [`37a80351c4`](https://github.com/udecode/plate/commit/37a80351c4), 2026-04-02.  
   **What the user saw:** Inserting a blockquote could leave the caret in the preceding block instead of inside the new quote.  
   **Actions:** In an empty paragraph, type `/quote`, choose **Blockquote**, then type `X` without clicking elsewhere.  
   **Notice:** The caret and `X` must appear inside the quote; watch for typing in the preceding paragraph.

2. **K2 — Transient text-selection paint across table cells**
   
   **Page:** [table](https://beta.platejs.org/docs/table) · [stable](https://platejs.org/docs/table)  
   **Fix:** [`2b45b130f9`](https://github.com/udecode/plate/commit/2b45b130f9), 2026-03-31.  
   **What the user saw:** Extending a selection into another cell briefly painted an ordinary browser text selection before the table-cell highlight appeared.  
   **Actions:** Click at the end of text in a cell with another cell to its right. Press **Shift+Right** once. Collapse the selection and repeat.  
   **Notice:** Watch the transition itself: the cell highlight must appear directly, without an intermediate blue text-range flash.

3. **K3 — Context menu reopens at its previous position**
   
   **Page:** [dnd](https://beta.platejs.org/docs/dnd) · [stable](https://platejs.org/docs/dnd)  
   **Fix:** [`b74ed79fd4`](https://github.com/udecode/plate/commit/b74ed79fd4), 2025-09-07.  
   **What the user saw:** Reopening the block context menu elsewhere could leave it positioned at the previous right-click location.  
   **Actions:** Right-click text near the top of the editor. Press **Escape**. Right-click another paragraph substantially lower and farther right.  
   **Notice:** The second menu must anchor near the second click, rather than remain at the first location.

4. **K4 — Typing does not replace selected blocks**
   
   **Page:** [basic-blocks](https://beta.platejs.org/docs/basic-blocks) · [stable](https://platejs.org/docs/basic-blocks)  
   **Fix:** [`93880a84ed`](https://github.com/udecode/plate/commit/93880a84ed), 2025-08-01.  
   **What the user saw:** Typing a character while whole blocks were selected failed to replace those blocks with the typed text.  
   **Actions:** Create adjacent paragraphs containing `A` and `B`. Drag a selection rectangle from the editor gutter over both paragraphs, then type `X`.  
   **Notice:** Both selected paragraphs must become one paragraph containing `X`, with the caret after it; watch for unchanged content or invisible typing.

5. **K5 — Enter produces a misplaced suggestion marker in a list**
   
   **Page:** [suggestion](https://beta.platejs.org/docs/suggestion) · [stable](https://platejs.org/docs/suggestion)  
   **Fix:** [`094c9f0337`](https://github.com/udecode/plate/commit/094c9f0337), 2026-04-22.  
   **What the user saw:** A suggested line break inside a list placed its return-arrow marker outside the list item.  
   **Actions:** In editing mode, create a bulleted item containing `AlphaBeta`. Put the caret between `Alpha` and `Beta`, switch to suggesting mode, and press **Enter**.  
   **Notice:** The suggested-break marker must sit beside the affected item’s text, inside the item; watch for a detached marker below or outside the list.

6. **K6 — Undo restores a block but loses its caret**
   
   **Page:** [basic-blocks](https://beta.platejs.org/docs/basic-blocks) · [stable](https://platejs.org/docs/basic-blocks)  
   **Fix:** [`f608c7af6b`](https://github.com/udecode/plate/commit/f608c7af6b), 2026-03-26.  
   **What the user saw:** Undoing a whole-block replacement could restore the original text while leaving no usable caret.  
   **Actions:** Create a paragraph containing `Alpha`, followed by another paragraph. Click inside `Alpha`, select that whole paragraph with its block handle, and type `X`. Press **Cmd+Z**, then type `!` without clicking.  
   **Notice:** Undo must restore `Alpha` and a caret in the restored paragraph; the next character must enter there. This uses the commit’s general history fix without invoking AI.

7. **K7 — Copy and plain-text paste loses an empty paragraph**
   
   **Page:** [dnd](https://beta.platejs.org/docs/dnd) · [stable](https://platejs.org/docs/dnd)  
   **Fix:** [`c452f3fc24`](https://github.com/udecode/plate/commit/c452f3fc24), 2025-06-30.  
   **What the user saw:** Copying whole blocks omitted empty paragraphs from the plain-text clipboard content.  
   **Actions:** Create `A`, an empty paragraph, and `B` by typing `A`, **Enter**, **Enter**, `B`. Marquee-select all three blocks and press **Cmd+C**. Click after `B`, press **Enter**, then paste without formatting using **Cmd+Shift+V** in Chrome on Mac.  
   **Notice:** The pasted `A` and `B` must retain one empty paragraph between them; ordinary Plate-fragment paste can conceal this clipboard bug.

8. **K8 — Table rows drag but cannot be dropped**
   
   **Page:** [table](https://beta.platejs.org/docs/table) · [stable](https://platejs.org/docs/table)  
   **Fix:** [`7605dcabc7`](https://github.com/udecode/plate/commit/7605dcabc7), 2025-12-16.  
   **What the user saw:** A table row could be picked up, but other rows showed no drop indicator and the row could not be reordered.  
   **Actions:** Use a table with at least three rows. Grab the first row’s small drag handle, move below the third row, and release.  
   **Notice:** A row drop line must appear during the drag, and the first row must move to the indicated position.

9. **K9 — Drag preview ignores horizontal scrolling**
   
   **Page:** [table](https://beta.platejs.org/docs/table) · [stable](https://platejs.org/docs/table)  
   **Fix:** [`b7c07a5924`](https://github.com/udecode/plate/commit/b7c07a5924), 2025-07-29.  
   **What the user saw:** Dragging a horizontally scrolled table showed a preview starting at the unscrolled left edge instead of the visible columns.  
   **Actions:** Narrow the browser window until the table scrolls horizontally. Scroll the table right so its first column disappears. Start dragging the whole table with its block handle.  
   **Notice:** Compare the preview with the table immediately before dragging: the visible columns and horizontal offset must match.

10. **K10 — Numbering restarts after an intervening bullet**
    
    **Page:** [list](https://beta.platejs.org/docs/list) · [stable](https://platejs.org/docs/list)  
    **Fix:** [`045e348629`](https://github.com/udecode/plate/commit/045e348629), 2026-04-25.  
    **What the user saw:** A numbered list interrupted by a bullet restarted its numbering instead of continuing the earlier numbered sequence.  
    **Actions:** Create four plain paragraphs: `One`, `Two`, `Bullet`, `Three`. Use each paragraph’s block menu → **Turn Into** to make `Bullet` a bulleted item and the other three numbered items, all at the same indentation.  
    **Notice:** The numbered items must read `1`, `2`, `3` around the bullet; watch for the final item restarting at `1`. The commit’s linked [#4954](https://github.com/udecode/plate/pull/4954) was unreachable, so its browser details could not be checked.

11. **K11 — Slash command inserts a duplicate empty block**
    
    **Page:** [slash-command](https://beta.platejs.org/docs/slash-command) · [stable](https://platejs.org/docs/slash-command)  
    **Fix:** [`4f50605920`](https://github.com/udecode/plate/commit/4f50605920), 2025-09-28.  
    **What the user saw:** Choosing a slash command matching the empty block’s existing type inserted another block and left an unwanted blank block behind.  
    **Actions:** Start in an empty paragraph. Type `/text`, choose **Text**, then type `X`.  
    **Notice:** There must be one paragraph containing `X`; watch for an additional empty paragraph immediately before it.

12. **K12 — Native color picking closes the toolbar dropdown**
    
    **Page:** [basic-marks](https://beta.platejs.org/docs/basic-marks) · [stable](https://platejs.org/docs/basic-marks)  
    **Fix:** [`b9824b618e`](https://github.com/udecode/plate/commit/b9824b618e), 2026-03-13.  
    **What the user saw:** Changing a custom color through the native picker prematurely closed the editor’s color dropdown.  
    **Actions:** In Chrome on Mac, select a word, open **Text color**, click **+**, and adjust the color in the native picker.  
    **Notice:** The editor dropdown must remain open while the native picker changes the color, and the selected word must receive the chosen color.
