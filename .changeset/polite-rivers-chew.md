---
"@udecode/plate-node-id": minor
---

New plugin option `disableInsertOverrides`: when a node inserted using editor.insertNode(s) has an id, it will be used instead of the id generator, except if it already exists in the document.
Set this option to `true` to disable this behavior.
