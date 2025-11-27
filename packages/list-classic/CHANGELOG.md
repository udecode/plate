# @platejs/list-classic

## 52.0.1

### Patch Changes

- [#4750](https://github.com/udecode/plate/pull/4750) by [@zbeyens](https://github.com/zbeyens) – Add React Compiler support.

## 52.0.0

### Major Changes

- [#4747](https://github.com/udecode/plate/pull/4747) by [@zbeyens](https://github.com/zbeyens) – ESM-only

## 51.1.2

### Patch Changes

- [#4732](https://github.com/udecode/plate/pull/4732) by [@zbeyens](https://github.com/zbeyens) – Format code with Biome

## 51.0.0

## 49.1.0

### Minor Changes

- [`36211fa`](https://github.com/udecode/plate/commit/36211fa20dbcb7f7f9b075adff5c826de5c2da49) by [@zbeyens](https://github.com/zbeyens) – Added task list functionality to **@platejs/list-classic**.

  - Added **BaseTaskListPlugin** with support for task lists (checklists)
  - Added `checked` property to `TTodoListItemElement` type for tracking task completion state
  - Added `useTodoListElement` and `useTodoListElementState` hooks for task list item management
  - Added `getPropsIfTaskList` utility to check if an element is a task list
  - Added normalization logic to ensure consistent `checked` property state
  - Added `toggleTaskList` transform to convert between regular lists and task lists

  ```tsx
  // Before - only regular lists
  createListPlugin();

  // After - with task list support
  createListPlugin();

  // Toggle task list
  editor.tf.toggle.list({ listType: "taskList" });
  ```

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - **Removed Default Shortcuts** for `BulletedListPlugin` and `NumberedListPlugin`.
    - These shortcuts must now be configured manually using the `shortcuts` field.
    - Example:
      ```tsx
      BulletedListPlugin.configure({
        shortcuts: { toggle: { keys: "mod+alt+5" } },
      });
      NumberedListPlugin.configure({
        shortcuts: { toggle: { keys: "mod+alt+6" } },
      });
      ```
  - Package `@udecode/plate-list` has been moved to `@platejs/list-classic`.
    - **Migration**:
      - Rename all import paths from `@udecode/plate-list` to `@platejs/list-classic`.
      - Update your `package.json`: remove `@udecode/plate-list` and add `@platejs/list-classic`.
  - For changelogs of `@udecode/plate-list` version `<=48`, refer to its [archived changelog](https://github.com/udecode/plate/blob/7afd88089f4a76c896f3edf928b03c7e9f2ab903/packages/list/CHANGELOG.md).
