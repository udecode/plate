---
'@udecode/slate': minor
---

- Merged `@udecode/slate-react` and `@udecode/slate-utils` queries and transforms into this package.
- `editor.insertNode`: added an `options` parameter.
- Added `| TNode` to the `at` type of the following methods’ options: `editor.api.above`, `editor.api.edges`, `editor.api.string`, `editor.api.end`, `editor.api.first`, `editor.api.fragment`, `editor.api.last`, `editor.api.leaf`, `editor.api.levels`, `editor.api.next`, `editor.api.nodes`, `editor.api.node`, `editor.api.parent`, `editor.api.path`, `editor.api.point`, `editor.api.after`, `editor.api.before`, `editor.api.positions`, `editor.api.previous`, `editor.api.range`, `editor.api.start`, `editor.api.void`, `editor.tf.insertNode`, `editor.tf.delete`, `editor.tf.focus`, `editor.tf.insertFragment`, `editor.tf.insertNodes`, `editor.tf.insertText`, `editor.tf.liftNodes`, `editor.tf.mergeNodes`, `editor.tf.moveNodes`, `editor.tf.removeNodes`, `editor.tf.select`, `editor.tf.setNodes`, `editor.tf.splitNodes`, `editor.tf.unsetNodes`, `editor.tf.unwrapNodes`, `editor.tf.wrapNodes`
- `match` query option: Added `text` and `empty` options.
  - Added `id` option to query options for finding nodes by id.
  - Added `text?: boolean` option to match only text nodes.
  - Added `empty?: boolean` option to match only empty nodes.
