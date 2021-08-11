---
"@udecode/plate-list": patch
---

partial fix pasting into lists, if the selection is in `li`:
- `preInsert`: override the default (do not run `setNodes`)
- filter out `ul` and `ol` from the fragment to paste only `li`
- override `insertFragment` by `insertNodes`. Note that it implies that the first fragment node children will not be merged into the selected `li`.
