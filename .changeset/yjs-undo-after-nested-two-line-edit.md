---
'plitejs': patch
---

- Fix undo in a Yjs room after a teammate's one change edits two lines inside the same block, such as two lines of a quote. The undone text now comes back where it was on every peer, instead of landing after the teammate's edit and scrambling the lines.
- Fix line edits inside a quote that a teammate moves or deletes at the same time. Edits in the moved quote stay on it, even beside an identical quote, and edits beside it keep their place. When the teammate deletes the quote, it stays deleted instead of coming back.
