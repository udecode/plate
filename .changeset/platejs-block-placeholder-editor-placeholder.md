---
'platejs': patch
---

- Fix `BlockPlaceholderPlugin` drawing its placeholder on top of the editor `placeholder` when the editor holds only an empty list item. Only the editor placeholder shows there now, and an editor without a `placeholder` still shows the block placeholder on that item.
