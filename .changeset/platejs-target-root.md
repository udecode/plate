---
'platejs': major
---

- Edit the named root that holds the caret when a command such as Code block, Indent, List, Details, Column or Blockquote runs on the editor, instead of the primary document; a command whose result that root's schema forbids throws, as it does through that root's view
- Throw when a plugin update method that takes arguments is called with one and wraps it in none of `txLocate`, `txSelection` or `txOnly`, including a method nested in a namespace
- Edit the root that holds the target in `lint.fix`
- Clear the root that holds the caret when `ai.removeMarks` or `ai.removeNodes` runs without `at`
- Accept a node selection as `at` in `columnGroup.toggle`, wrap the block a block selection holds, and resize a column group that the target or the selection names instead of nesting a new one inside it
- Add a new footnote definition at the end of the root the command runs in, numbered within that root
- Write and select an AI answer in the root of the target it captured: a main selection captured through a named root's view stays in main, insert-mode accept writes the target's root, and the caret stays in that root after the answer

**Migration:** Wrap each plugin update method that takes arguments. Use `txLocate(locateAt(0), method)` when its first argument's `at` names the target, or `txLocate(false, method)` when its arguments hold no location.
