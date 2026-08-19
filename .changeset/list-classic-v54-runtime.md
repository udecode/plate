---
"@platejs/list-classic": major
---

Require React and React DOM 19.2 or newer.

Export complete `ListPluginState`, `ListItemPluginState`,
`TaskListPluginState`, and `TodoListPluginState` contracts.

Move classic-list behavior to Plite transactions and scoped plugin updates.
Preserve compound command targets after earlier edits in the same transaction.

**Migration:** Replace exported list queries and transforms with `editor.read`
and the plugin-scoped commands:

```ts
const list = editor.plugin(ListPlugin);

list.update.toggle({
  type: editor.plugin(BulletedListPlugin).schema.type,
});
list.update.indent();
list.update.outdent();
```

Configure additional list-item children through
`ListItemPlugin.configure({ initialState: { validLiChildren } })`.

Classic list elements persist as `bulletedList`, `numberedList`, `listItem`,
`listItemContent`, and `todoList`.

Infer classic-list renderer props from their owning descriptors. Copy
`list-classic-node` for todo checkbox behavior and
`list-classic-toolbar-button` for toolbar state and toggling.
