---
'plitejs': patch
---

- Stop every collapsed delete at a grid cell's edge, so Backspace, Delete, word, line and longer deletes never join two cells' text or drop a cell
- Compile grid and grid cell roles as isolating, and reject `isolating: false` on them
- Do nothing on a collapsed delete inside a read-only grid row or cell, and stop a collapsed delete of any unit before a read-only row or cell beside the caret
- Move the caret to the end of a grid's last writable text on Backspace at the start of a block right after the grid, instead of joining that block into a cell. The first block of a quote after a grid counts, and so does a block after a quote that ends in a grid. An isolating block does not
- Delete an empty block beside a grid with one key, or the container that holds only it, moving the caret into the nearest cell, unless its parent needs it
- Refuse a merge that would pour a grid, or another isolating block, into a block that cannot hold it
- Stop word, line and longer deletes at a callout's or other isolating block's edge, as single-character deletes already did
- Keep an empty isolating inline, such as an inline grid cell, on Backspace at its start
- Change the schema fingerprint of a schema that declares a grid, because its grid and cell roles now compile as isolating

**Migration:** If your schema declares a grid, bump its `version` when it has one. History saved with the old schema no longer restores, and an upgraded client cannot join a Yjs room made with the old schema, so upgrade every client in a room at once.
