1. **K1. `tables`, caret position**  
   Fix: `a94fe72bd`, 2025-03-17.
   
   **What the user saw:** Clicking beside the table displayed a caret outside its cells.  
   **Actions:** Click inside a cell, then click the blank editor space immediately to the table's right; repeat near its left edge.  
   **Browser/device:** Not specified.  
   **Notice:** The caret appears beside the table rather than inside a cell. This was a visual correction; the report says typing still followed Slate's internal selection. [PR #5821](https://github.com/ianstormtaylor/slate/pull/5821)

2. **K2. `images`, selection paint**  
   Fix: `e25c30c7a`, 2020-05-05.
   
   **What the user saw:** The selection highlight disappeared when a mouse selection reached an image's edge.  
   **Actions:** Start selecting text in the paragraph below an image; keep the mouse button held and drag upward into the image.  
   **Browser/device:** Chrome 81.0.4044.122 on macOS 10.14.6 was specifically reported.  
   **Notice:** The highlighted range collapses as the pointer reaches the image, interrupting the continuous selection. [Issue #3647](https://github.com/ianstormtaylor/slate/issues/3647), [issue #3648](https://github.com/ianstormtaylor/slate/issues/3648)

3. **K3. `shadow-dom`, focus**  
   Fix: `ec9e5f0a3`, 2024-07-08.
   
   **What the user saw:** The editor accepted one character at the beginning and then stopped responding to continued typing.  
   **Actions:** Click before the paragraph's first character and type several letters; then click within the text and press Space.  
   **Browser/device:** Firefox is the browser targeted by this fix.  
   **Notice:** Only the first letter appears, or the attempted space never appears. The fix corrects Slate's focus tracking inside the shadow root. [Issue #5321](https://github.com/ianstormtaylor/slate/issues/5321), [PR #5676](https://github.com/ianstormtaylor/slate/pull/5676)

4. **K4. `mentions`, typing and deletion**  
   Fix: `a3bc97af3`, 2021-06-09.
   
   **What the user saw:** Pressing Backspace or Delete failed to remove a selected mention.  
   **Actions:** Click an existing mention, such as `@R2-D2`, so it is selected; press Backspace or Delete.  
   **Browser/device:** Safari 14.0.3 on macOS Catalina 10.15.7.  
   **Notice:** The selected mention remains in the document after the deletion keypress. [Issue #4330](https://github.com/ianstormtaylor/slate/issues/4330)

5. **K5. `richtext`, line-break deletion**  
   Fix: `06b21fdca`, 2025-06-25.
   
   **What the user saw:** Forward Delete at a paragraph's end removed the next paragraph's first character while leaving the paragraph break intact.  
   **Actions:** On Android, place the caret at the end of a paragraph followed by another nonempty paragraph; press the forward `DEL` key once.  
   **Browser/device:** Chrome on Android, with a keyboard providing forward Delete.  
   **Notice:** The next paragraph loses its first character, but the paragraphs remain separate; another Delete is needed to join them. [Issue #5730](https://github.com/ianstormtaylor/slate/issues/5730), [PR #5908](https://github.com/ianstormtaylor/slate/pull/5908)

6. **K6. `richtext`, undo**  
   Fix: `68915e8cf`, 2025-03-22.
   
   **What the user saw:** Choosing Undo from the browser's context menu failed to undo the latest edit.  
   **Actions:** Type text into the editor, right-click inside it, and choose Undo from the browser menu.  
   **Browser/device:** The issue lists all browsers and operating systems.  
   **Notice:** The newly typed text remains. This commit adds context-menu Undo support; its PR explicitly notes that Redo remains unavailable in that menu. [Issue #5188](https://github.com/ianstormtaylor/slate/issues/5188), [PR #5822](https://github.com/ianstormtaylor/slate/pull/5822)

7. **K7. `paste-html`, HTML paste**  
   Fix: `b629be339`, 2019-12-06.
   
   **What the user saw:** Pasting text with nested formatting crashed the editor.  
   **Actions:** From another browser page, copy the rendered text represented by `<em>One <u>Two</u></em>`; click inside `paste-html` and paste normally. Copy the rendered words, not the HTML source.  
   **Browser/device:** The linked issue lists Chrome, Safari, Firefox and Edge.  
   **Notice:** The paste fails with an editor error instead of inserting both italic words with `Two` also underlined. [PR #3264](https://github.com/ianstormtaylor/slate/pull/3264), [issue #3188](https://github.com/ianstormtaylor/slate/issues/3188)

8. **K8. `plaintext`, Android clipboard paste**  
   Fix: `9825d29b8`, 2023-03-16. The page mapping is inferred from the shared React input handler.
   
   **What the user saw:** Pasting multiline text from the Android keyboard's clipboard inserted a break but lost the text.  
   **Actions:** Copy two lines, `one` and `two`, from another app; tap inside `plaintext`; open the keyboard's clipboard panel and tap the copied clip.  
   **Browser/device:** Android. The fix was tested on Pixel 4 with Android 12 and Samsung Galaxy devices with Android 12/13, using Gboard, SwiftKey and Samsung Keyboard.  
   **Notice:** The words do not appear even though the editor inserts a break. [Issue #5190](https://github.com/ianstormtaylor/slate/issues/5190), [PR #5359](https://github.com/ianstormtaylor/slate/pull/5359)

9. **K9. `custom-placeholder`, input method**  
   Fix: `05263b544`, 2025-05-24. The page mapping is inferred from the shared placeholder renderer.
   
   **What the user saw:** Japanese conversion failed to display the first converted character when composition began with a placeholder visible.  
   **Actions:** Enable the macOS Japanese input method; click the empty editor while its placeholder is visible; type `sinn`; open conversion candidates, choose one with Up/Down, and confirm it.  
   **Browser/device:** Firefox on macOS with a Japanese IME.  
   **Notice:** Compare the selected candidate with the editor text: the first converted character is missing or candidate changes fail to appear. [Issue #5766](https://github.com/ianstormtaylor/slate/issues/5766), [PR #5881](https://github.com/ianstormtaylor/slate/pull/5881)

10. **K10. `images`, void-element drag and drop**  
    Fix: `2ee2753d7`, 2021-10-27.
    
    **What the user saw:** An image disappeared after a drag that could not place it at the destination.  
    **Actions:** Drag the first image onto the second image and release over the second image itself.  
    **Browser/device:** Not specified.  
    **Notice:** The dragged image disappears from its original position without appearing at a new position; the destination image remains. This sequence appears in the PR's before recording. [PR #4631](https://github.com/ianstormtaylor/slate/pull/4631)

11. **K11. `richtext`, scrolling**  
    Fix: `f8be509e4`, 2021-03-31.
    
    **What the user saw:** Editing a paragraph taller than the viewport caused unwanted scrolling even when the caret was already visible.  
    **Actions:** Paste one long paragraph without paragraph breaks until it exceeds the viewport height; scroll into its middle; click a visible word and type a character.  
    **Browser/device:** Chrome 78.0.3904.108 on Windows 10 was reported.  
    **Notice:** The viewport jumps toward another part of the paragraph despite the insertion point already being onscreen. [Issue #3146](https://github.com/ianstormtaylor/slate/issues/3146), [PR #3746](https://github.com/ianstormtaylor/slate/pull/3746)

12. **K12. `search-highlighting`, highlight rendering**  
    Fix: `c46c42153`, 2024-06-28.
    
    **What the user saw:** A visible search phrase failed to highlight when it crossed a formatting boundary.  
    **Actions:** In the example's search box, enter `adds`; then replace the query with `adds decorations`, which crosses into the bold word `decorations`.  
    **Browser/device:** Not specified.  
    **Notice:** `adds` highlights, but the longer phrase loses its highlight even though the complete phrase is present in the paragraph. [PR #5670](https://github.com/ianstormtaylor/slate/pull/5670)
