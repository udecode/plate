# @platejs/list-classic

## 49.0.0

### Major Changes

- [#4327](https://github.com/udecode/plate/pull/4327) by [@zbeyens](https://github.com/zbeyens) –
  - **Removed Default Shortcuts** for `BulletedListPlugin` and `NumberedListPlugin`.
    - These shortcuts must now be configured manually using the `shortcuts` field.
    - Example:
      ```tsx
      BulletedListPlugin.configure({
        shortcuts: { toggle: { keys: 'mod+alt+5' } },
      });
      NumberedListPlugin.configure({
        shortcuts: { toggle: { keys: 'mod+alt+6' } },
      });
      ```
  - Package `@udecode/plate-list` has been moved to `@platejs/list-classic`.
    - **Migration**:
      - Rename all import paths from `@udecode/plate-list` to `@platejs/list-classic`.
      - Update your `package.json`: remove `@udecode/plate-list` and add `@platejs/list-classic`.
  - For changelogs of `@udecode/plate-list` version `<=48`, refer to its [archived changelog](https://github.com/udecode/plate/blob/7afd88089f4a76c896f3edf928b03c7e9f2ab903/packages/list/CHANGELOG.md).
