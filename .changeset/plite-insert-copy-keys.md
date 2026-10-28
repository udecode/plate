---
'plitejs': patch
---

- Fix inserting a node that a root still holds, or a new block holding one, giving the copy its source's key; the copy now gets its own key
- Fix `editor.key` throwing after a discarded transaction spec removed a block and inserted the same object again
- Fix a discarded transaction spec that removed a pasted block and inserted it again leaving the block with the spec's key
- Fix a discarded transaction spec that inserted a block an update had just pasted leaving the spec's key on that block
- Fix a plugin command that copies a block from its filtered view giving the copy the block's key
- Fix a key read in a nested `state.transaction` renaming blocks that the outer transaction changed in another root
