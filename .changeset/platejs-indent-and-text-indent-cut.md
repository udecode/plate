---
'platejs': patch
---

Unify `BaseIndentPlugin` update options and remove `BaseTextIndentPlugin`.

- Flatten `BaseIndentPlugin.update.increase` and `decrease` to `WithNodeTarget<NodeSetNodesOptions<Element>>`, remove `IndentChangeOptions`, and add list-family-safe `set` and `clear` commands.
- Require positive safe integer `indent` values (`validationVersion: 2`), clamp or unset `indentMax` safely, compose caller `match` with `targetPlugins`, and skip locked blocks in indent, line-height, and alignment updates.
- Remove `BaseTextIndentPlugin`, `TextIndentPlugin`, `PLUGINS.textIndent`, `data-text-indent`, and Word paste `textIndent` emission, stripping legacy `indent: 0` and undeclared `textIndent` during v54 migration.
