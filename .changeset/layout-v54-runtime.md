---
"@platejs/layout": major
---

Own column-item mutations through `BaseColumnItemPlugin` or
`ColumnItemPlugin`:

- `editor.plugin(BaseColumnItemPlugin).update.insert`
- `editor.plugin(BaseColumnItemPlugin).update.insertGroup`
- `editor.plugin(BaseColumnItemPlugin).update.moveMiddle`
- `editor.plugin(BaseColumnItemPlugin).update.selectAll`
- `editor.plugin(BaseColumnItemPlugin).update.set`
- `editor.plugin(BaseColumnItemPlugin).update.toggle`

The same transaction group is available as `editor.update.column`.

Remove the standalone column query, transform, resize, and width-helper
exports. `BaseColumnPlugin` owns the `columnGroup` schema and installs
`BaseColumnItemPlugin`; it publishes no command surface. Group elements persist
under `columnGroup`.
