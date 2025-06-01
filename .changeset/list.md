---
'@udecode/plate-list': major
---

- The previous `@udecode/plate-list` (classic list implementation) has been moved to `@platejs/list-classic`.
  - **Migration for users of the classic list**:
    - Rename all import paths from `@udecode/plate-list` to `@platejs/list-classic`.
    - Update your `package.json`: remove the old `@udecode/plate-list` (if it was a direct dependency) and add `@platejs/list-classic`.
- This package, `@platejs/list`, now contains the functionality previously in `@udecode/plate-indent-list` (indent-based list system).
  - Plugin names have been generalized: `IndentListPlugin` is now `ListPlugin`, `BaseIndentListPlugin` is `BaseListPlugin`, etc. (`*IndentList*` -> `*List*`).
  - The primary plugin key is now `list` (e.g., `ListPlugin.key`) instead of `listStyleType`.
  - Constants for list keys previously in `INDENT_LIST_KEYS` are now available under `KEYS` from `@udecode/plate`.
    - Migration for constants:
      - `INDENT_LIST_KEYS.listStyleType` -> `KEYS.listType`
      - `INDENT_LIST_KEYS.todo` -> `KEYS.listTodo`
      - `INDENT_LIST_KEYS.checked` -> `KEYS.listChecked`
      - Other `INDENT_LIST_KEYS.*` map to `KEYS.*` accordingly.
- For changelogs of the indent-based list system (now in this package) version `<=48` (when it was `@udecode/plate-indent-list`), refer to its [archived changelog](https://github.com/udecode/plate/blob/7afd88089f4a76c896f3edf928b03c7e9f2ab903/packages/indent-list/CHANGELOG.md).
