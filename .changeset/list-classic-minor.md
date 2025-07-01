---
'@platejs/list-classic': minor
---

Added task list functionality to **@platejs/list-classic**.

- Added **BaseTaskListPlugin** with support for task lists (checklists)
- Added `checked` property to `TTodoListItemElement` type for tracking task completion state
- Added `useTodoListElement` and `useTodoListElementState` hooks for task list item management
- Added `getPropsIfTaskList` utility to check if an element is a task list
- Added normalization logic to ensure consistent `checked` property state
- Added `toggleTaskList` transform to convert between regular lists and task lists

```tsx
// Before - only regular lists
createListPlugin()

// After - with task list support
createListPlugin()

// Toggle task list
editor.tf.toggle.list({ listType: 'taskList' })
```