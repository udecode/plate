---
'platejs': patch
---

- Add `fillRole` to `BaseFieldPlugin`'s state. While it is set, the editor refuses every local change except a fitting or cleared value on that role's fields. An undo or redo returns `blocked` at the first step that changed anything else.
- Start a new undo step when a field write's role differs from the role of the step before it, no role included, so a fill never shares an undo step with an author's edit.
- While a fill role is set, refuse the whole update instead of throwing when `update` names a field that no longer exists or a value that no longer fits it.
