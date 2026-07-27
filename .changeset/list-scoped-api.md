---
"@platejs/list": major
---

Expose state-bound list queries through `editor.read.list`, pure list services
through `editor.api.list`, and mutations through
`editor.update.list`, including sibling traversal, active-state checks,
descendant expansion, and location-aware toggle, indent, and outdent updates.
Register list and indentation properties in compiled schemas. Clear list start
and restart metadata when outdenting a root item.

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

Generic package code can use the same groups through
`editor.plugin(ListPlugin).read` and `editor.plugin(ListPlugin).update`.
Configure list targets through `targetPluginKeys`.
