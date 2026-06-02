---
"@platejs/slate": patch
---

Add experimental `editor.tf.setNodesBatch` for exact-path node prop updates on large documents

- Cut the large-document `set_node` hot path from `18.56 ms` to `2.63 ms` at `1k` blocks (`7.05x` faster)
- Cut the same path from `118.54 ms` to `4.92 ms` at `5k` blocks (`24.10x` faster)
- Let `@platejs/core` batch live `nodeId` normalization instead of paying one `setNodes` call per missing id
- Keep `editor.tf.setNodesBatch` explicitly temporary. It is experimental and will be removed in a future release
