---
'platejs': patch
---

- Land list items in dragged text at the depth of the item they drop on, as a paste does. Moved items keep their own list unless they join the drop item's list
- Join a dragged block copy of list items to the list beside it, or give it a list of its own, instead of numbering it with the list it was copied from
- Join list items moved by a block drag or a keyboard move to a list of their kind beside where they land. A move inside its own list, or beside no list of its kind, keeps its list and its starts
- Change the schema fingerprint of an editor that includes `BaseListPlugin` or `BaseIndentPlugin`, because they declare which list and indent properties follow a drop. Such an editor refuses snapshots, persisted history and authored comparisons written with the old fingerprint, and old and new clients cannot share a Yjs room. A named schema needs a higher version before `plate migrate` scaffolds its migration
