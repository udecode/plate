---
'platejs': patch
---

- Add the lasso to `platejs/ink/react`. `setTool({ type: 'lasso' })` draws a loop that picks the marks with more than half their samples inside it, and its press focuses the Editable so the keys reach the pick. While the lasso is on, Backspace or Delete removes the picked marks in one undo step and Escape clears the pick. Keys with Alt, Control or Meta, input method keys and the repeats of a held key leave the pick alone. Any other tool and hiding ink clear the pick. An eraser or lasso contact now ends when its primary button lifts while another button stays down.
