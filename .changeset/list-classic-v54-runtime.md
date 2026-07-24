---
"@platejs/list-classic": major
---

Move classic-list behavior to Plite transactions and scoped plugin updates.
Preserve compound command targets after earlier edits in the same transaction.

**Migration:** Replace exported list queries and transforms with `editor.read`
and the plugin-scoped commands:

```ts
const list = editor.plugin(ListPlugin);

list.update.toggle({ type: editor.getType(KEYS.ulClassic) });
list.update.indent();
list.update.outdent();
```

Configure additional list-item children through
`ListItemPlugin.configure({ options: { validLiChildren } })`.

The classic todo plugin and command identity is `listTodoClassic`; persisted
elements remain `action_item`.
