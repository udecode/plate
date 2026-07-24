---
"@platejs/list": major
---

Expose list reads through `editor.api.list` and mutations through
`editor.update.list`, including sibling traversal, active-state checks,
descendant expansion, and location-aware toggle, indent, and outdent updates.
Register list and indentation properties in compiled schemas. Clear list start
and restart metadata when outdenting a root item.

**Migration:** Replace raw editor-bound list helpers with the scoped API:

```tsx
editor.api.list.expandItemsWithChildren(entries);
editor.api.list.isActive('disc');
editor.api.list.getPrevious(entry);
editor.api.list.getNext(entry);
editor.update.list.toggle({ listStyleType: 'disc' });
editor.update.list.indent();
editor.update.list.outdent();
```

Generic package code can use the same API through `editor.plugin(ListPlugin)`.
Configure list targets through `targetPluginKeys`.
