---
'@platejs/list': major
---

Require React and React DOM 19.2 or newer.

Remove modern list toolbar and todo renderer prop hooks. Registry components call list reads and updates directly. `@platejs/list-classic` remains a maintenance-only compatibility surface.

Export `BaseListPluginState` as the complete mutable state contract for `BaseListPlugin`.

Expose state-bound list queries through `editor.read.list`, pure list services through `editor.api.list`, and mutations through `editor.update.list`, including sibling traversal, active-state checks, descendant expansion, and location-aware toggle, indent, and outdent updates. Register list and indentation properties in compiled schemas. Clear list start and restart metadata when outdenting a root item.

**Migration:** Replace raw editor-bound list helpers with the scoped API:

```tsx
editor.read.list.expandItemsWithChildren(entries);
editor.read.list.isActive('disc');
editor.read.list.getPrevious(entry);
editor.read.list.getNext(entry);
editor.update.list.toggle({ listStyleType: 'disc' });
editor.update.list.indent();
editor.update.list.outdent();
```

Generic package code can use the same groups through `editor.plugin(ListPlugin).read` and `editor.plugin(ListPlugin).update`. Configure list targets through `targetPlugins`.

Use `listStart` for conditional numbered-list starts, `listRestart` for forced boundaries, validate both as signed safe integers, and derive display ordinals without persisting them.
