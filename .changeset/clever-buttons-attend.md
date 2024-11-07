---
'@udecode/plate-selection': patch
---

New api `editor.getApi(BlockSelectionPlugin).blockSelection.focus();`
Fix the issue where block selection should not be unselect when the block context menu is open.