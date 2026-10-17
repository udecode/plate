---
'plitejs': major
---

- Run each plugin update method in its target's root: a node key, a live node, or a point or range that names its root picks the root, a bare path stays in the root of the editor or view you call, and a call with no target runs in the view's own root or, on the editor, in the root that holds the caret
- Throw when a plugin update method that takes arguments is called with one and wraps it in none of `txLocate`, `txSelection` or `txOnly`, including a method nested in a namespace
- Accept a live node from another root of the same editor as an `at` target, including in `nodes.toArray`, `nodes.blocks`, `nodes.replace`, `blocks.toggle` and `blocks.duplicate`; `nodes.path` still returns `undefined` for it
- Accept a `NodeKey` as `at` in `tx.nodes.replace`
- Read a `NodeSelection` passed without a `root` as the root of the editor or view you call
- Ignore a selection outside a view's root when the view's read or write falls back to the selection
- Fix `nodes.wrap` with a range, and `nodes.unwrap` of an inline's selected text, writing nothing in a named root
- Fix `tx.plugin(plugin)` inside a view's update returning the methods of the calling editor's root instead of the view's root

**Migration:** Wrap each plugin update method that takes arguments. Use `txLocate(locateAt(0), method)` when its first argument's `at` names the target, or `txLocate(false, method)` when its arguments hold no location.
