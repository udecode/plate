---
'@udecode/plate-list': minor
---

Enables the developer to enable or disable the checkbox state inheritance when creating a new todo list item.

The option is configurable for when a line break is inserted from the start of the node or the end of the node.

The plugin now has two new optional options:

```tsx
createTodoListPlugin(
    options:{
        inheritCheckStateOnLineStartBreak: false,
        inheritCheckStateOnLineEndBreak: false
    }
)
```


`inheritCheckStateOnLineStartBreak` option will create a new todo item on **top** of the current one, and the new todo item will inherit the checkbox state of the current todo item. Default value is `false`.

`inheritCheckStateOnLineEndBreak` option will create a new todo item **below** the current one, and the new todo item will inherit the checkbox state of the current todo item. Default value is `false`.
