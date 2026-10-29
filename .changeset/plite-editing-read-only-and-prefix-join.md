---
'plitejs': patch
---

- Refuse Return and paste inside a read-only element, and typing over a selection inside a read-only inline element. Leave the caret in place when the editor refuses typed text.
- Fix Backspace after Enter in the middle or at the end of a required prefix block, such as a title. Joining the split back now gives the title and the paragraph that followed it, as before the split, instead of adding an empty paragraph.
