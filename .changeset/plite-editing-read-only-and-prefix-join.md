---
'plitejs': patch
---

- Refuse Return and paste inside a read-only element, and typing over a selection inside a read-only inline element. Leave the caret in place when the editor refuses typed text.
- Fix Backspace after Enter anywhere in a required prefix block, such as a title, and Delete after Enter at its end. Joining the split back now gives the title and the paragraph that followed it, as before the split, instead of adding an empty paragraph.
- Join the block after an empty required prefix block, such as a title, into it without asking `editorReads.nodes.shouldMergeNodesRemovePrevNode` when the empty block takes that block's content as it stands, so no plugin's merge read removes the title. An editor that records authored changes still asks the read.
- Fix typing or pasting over a selection that spans two blocks on Android, which crashed the page or dropped the selected blocks, and pasting several lines over two differently formatted runs in one block, which split the block and repeated a letter. Both hold when the keyboard sends plain text input rather than a composition.
