---
'plitejs': patch
---

- Add `editor.read.nodes.isContent(node)`, also on `tx.nodes`. It answers false for a node that a capability keeps in the document but out of its content, such as text a pending suggestion deletes. Code that derives a value from children can skip that node and still write at each child's real path
- The authored review tree records each suggested property write as its own tag on that property, linked to the tags it was written over, so deciding stacked or concurrent suggestions on one property gives the same result in every allowed order
- The authored review tree records an Enter inside a link or another inline element as a cut on both halves, and rejecting the Enter joins the halves back into one element
- A suggestion that leaves an element short of its required content records what an edit would build there, as struck content kept in place or as an insertion, and a decision builds what is still missing at the element's final place
- Fix the Yjs bridge reading an insertion with no previous children as a text split

- Preserve restored container identities when undoing an unwrap in authored views
- Fix a deletion that empties a line next to a pending join or split. The editor keeps the emptied line, so the leftover text no longer merges into the line before and the suggestion stays on the line it was made on
