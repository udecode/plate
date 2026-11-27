---
'plitejs': patch
---

- Move focus to the view that made a step when an undo or redo key in another view of the same `Editable` replays it, such as Mod+Z in the page after typing in a synced block's second copy. The caret goes back to where it was before that typing. Focus stays where the key was pressed when that view is gone, hidden or read-only, or when the step's selection ran from one view into another. It also stays when either view renders in a slot that passes `nodeSelectionFocus`. A step whose plugin history effect settles after the replay, such as creating a comment thread, also leaves focus where the key was pressed.
- Keep focus in a focused external control when its undo or redo changes a root that another view shows, such as a synced block's copy.
- Keep the caret in a view where an undo or redo key was pressed when the step was made in another root. After undoing a Delete that the page made across into one synced copy, a Delete in another copy now edits that copy instead of the first one.
- Keep the caret in the editable that a focus handler moves focus into, instead of moving it back to the editable that received focus first.
