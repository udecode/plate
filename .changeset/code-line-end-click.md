---
'plitejs': patch
---

Fix a click in the blank space right of a line of decorated text, such as highlighted code, putting the caret before the line's last undecorated characters, such as `) {` or ` userData;`. The click now follows the browser's own caret placement when it lands in the same text, so the caret goes to the line's end.
