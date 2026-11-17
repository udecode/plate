---
'plitejs': patch
---

- Add `coverage: 'full'` to `read.nodes.blocks` and `tx.nodes.blocks`, which reads only the blocks whose whole content the target covers, at every depth. A path covers its block and every block inside it. A range that ends at a block's start does not cover that block, an empty block counts as covered when the range reaches its start, and a block that holds other blocks counts only when each of them and its own text does. `mode` then picks among the covered blocks.
