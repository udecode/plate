---
'platejs': patch
---

- Fix a CodeMirror code block dropping the next keystroke, paste, cut or drop when the editor resets its text during an input method composition, such as after a refused edit or a collaborator's change.
- Keep a CodeMirror code block's caret where the editor puts it when the editor resets its text.
- Leave the Backspace that WebKit sends after an input method empties a CodeMirror code block to CodeMirror, so the block stays a code block.
