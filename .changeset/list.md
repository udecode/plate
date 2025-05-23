---
'@udecode/plate-list': major
---

- Moved `@udecode/plate-list` to `@udecode/plate-list-classic`. **Migration**:
  - Rename all `@udecode/plate-list` to `@udecode/plate-list-classic`.
  - Remove `@udecode/plate-list` from your `package.json`.
  - Add `@udecode/plate-list-classic` to your `package.json`.
- Renamed `IndentListPlugin` to `ListPlugin`, `BaseIndentListPlugin` to `BaseListPlugin`, and more generally `*IndentList*` to `*List*`.
- Plugin key is now `list` instead of `listStyleType`.
- Moved `INDENT_LIST_KEYS` constants to `KEYS` from `@udecode/plate`. Migration:
  - Replace `INDENT_LIST_KEYS.listStyleType` with `KEYS.listType`
  - Replace `INDENT_LIST_KEYS.todo` with `KEYS.listTodo`
  - Replace `INDENT_LIST_KEYS.checked` with `KEYS.listChecked`
  - Replace `INDENT_LIST_KEYS.*` with `KEYS.*`

This package is now used by the previously named `@udecode/plate-indent-list`. See the latter `<=48` changelog [here](https://github.com/udecode/plate/blob/7afd88089f4a76c896f3edf928b03c7e9f2ab903/packages/indent-list/CHANGELOG.md).
