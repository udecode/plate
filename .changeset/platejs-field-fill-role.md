---
'platejs': patch
---

- Add `fillRole` to `BaseFieldPlugin`'s state. While it is set, the editor refuses every local change except a fitting or cleared value on that role's fields, and undo or redo returns `blocked` at a step that changed anything else.
- Start a new undo step when a field write's role differs from the step before it, so a fill never shares an undo step with an author's edit.
- Refuse the whole update instead of throwing when, while a fill role is set, `update` names a field that no longer exists or a value that no longer fits it.
