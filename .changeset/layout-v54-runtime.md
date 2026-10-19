---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove the one-consumer `useDebouncePopoverOpen` React hook.

Own group mutations through `BaseColumnGroupPlugin` and item mutations through `BaseColumnItemPlugin`:

- `editor.plugin(BaseColumnGroupPlugin).update.insert(input?, nodeOptions?)`
- `editor.plugin(BaseColumnGroupPlugin).update.setColumns`
- `editor.plugin(BaseColumnGroupPlugin).update.toggle`
- `editor.plugin(BaseColumnItemPlugin).update.selectAll`

The group transaction is available as `editor.update.columnGroup`; item operations are available as `editor.update.column`.

Remove the standalone column query, transform, resize, and width-helper exports. `moveMiddleColumn` has no replacement. `BaseColumnGroupPlugin` owns the `columnGroup` schema and installs `BaseColumnItemPlugin`. Group elements persist under `columnGroup`.

Remove the unused `columnGroup.layout` property. Each child Column remains the sole owner of its persisted `width`.

**Migration:** Rename the v53 group plugins `BaseColumnPlugin` to `BaseColumnGroupPlugin` and `ColumnPlugin` to `ColumnGroupPlugin`. `BaseColumnItemPlugin` and `ColumnItemPlugin` keep their names.
