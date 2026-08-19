---
"@platejs/layout": major
---

Require React and React DOM 19.2 or newer.

Remove the one-consumer `useDebouncePopoverOpen` React hook.

Own group mutations through `BaseColumnPlugin` and item mutations through
`BaseColumnItemPlugin`:

- `editor.plugin(BaseColumnPlugin).update.insert(input?, nodeOptions?)`
- `editor.plugin(BaseColumnPlugin).update.setColumns`
- `editor.plugin(BaseColumnPlugin).update.toggle`
- `editor.plugin(BaseColumnItemPlugin).update.moveMiddle`
- `editor.plugin(BaseColumnItemPlugin).update.selectAll`

The group transaction is available as `editor.update.columnGroup`; item
operations are available as `editor.update.column`.

Remove the standalone column query, transform, resize, and width-helper
exports. `BaseColumnPlugin` owns the `columnGroup` schema and installs
`BaseColumnItemPlugin`. Group elements persist under `columnGroup`.

Remove the unused `columnGroup.layout` property. Each child Column remains the
sole owner of its persisted `width`.
