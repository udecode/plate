---
'plitejs': patch
---

- Keep focus in the active external text control, editor view, or outside button when an undo or redo runs from another external control, a `focusPolicy: 'preserve'` history control, or `editor.api.history.undo()`.
- Return focus and the caret to the forked synced-block copy after keyboard redo of an Unsync and after button undo of single- or nested-level Unsyncs, including keyed and delayed-mount slots.
- Return focus to the last-used slot view when a history control replays a child root rendered by two panes sharing an owner element.
