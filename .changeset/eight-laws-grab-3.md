---
"@udecode/slate-plugins-core": minor
---

- New plugin option `deserialize.getFragment`: Function called on `editor.insertData` to filter the fragment to insert.
- New plugin option `deserialize.preInsert`: Function called on `editor.insertData` just before `editor.insertFragment`. Default: if the block above the selection is empty and the first fragment node type is not inline, set the selected node type to the first fragment node type. If returns true, the next handlers will be skipped.
