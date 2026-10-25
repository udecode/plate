---
'plitejs': patch
---

Fix edits beside a pending join whose review marks, once everything was accepted, gave a different document than the editor showed:

- A delete that joins a line into a title, or into another line a root or container needs, lands the line there instead of in the deleted line kept as the required line. The same delete made while Suggesting now records, where before it left the document unchanged.
- A delete that joins into a line holding another author's pending suggestion stays pending until that suggestion is decided, so either decision keeps the joined text.
- Letters typed at the end of the last line a pending join pulls up show in that line, with the caret after them. Before, the editor drew them in the empty line below it, and accepting the join moved them up.
- Delete at the end of a line before lines another author deletes keeps the caret at the end of that line. Before, with two such lines, the caret moved into the empty line the preview adds.
- A preview draws the caret in the empty line it adds after a pending join only after you place the caret there, and only until it moves. Otherwise it draws the caret at the end of the line above, where edits act. With a caret placed there, Backspace deletes the last letter of the line above, where before it did nothing.
- Enter at the start or end of a joined line, and a two-line paste at its end, split the line. Before, Enter at the start wrote nothing, and Enter at the end and the paste were refused. Accepting everything drops an empty line the preview added at the end once nothing needs it.
- A plugin write that types into the empty line a preview adds after a pending join, then adds or moves a line after it, records what the editor showed. Before, the letter joined the line above, or the write was refused or threw.
- A write that accepting everything would change is refused with `diverged`, or `reordered` when only the order changes. Before, these were stored:
  - a plugin's insert before the empty line a preview adds after pending joins, which merged into the line above;
  - a plugin write that adds a line at the end and removes the first;
  - a line added after a line another author deletes where the root needs one, and a suggested line after a required title another author deletes.
