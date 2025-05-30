---
'@udecode/plate-basic-elements': major
---

- Package `@udecode/plate-basic-elements` has been deprecated.
- Its plugins have been moved to the new `@platejs/basic-nodes` package.
- Migration:
  - Replace `@udecode/plate-basic-elements` with `@platejs/basic-nodes` in your dependencies.
  - Update import paths from `@udecode/plate-basic-elements/react` to `@platejs/basic-nodes/react`.
  - For detailed changes to individual plugins, default HTML tags, and shortcut configurations, refer to the changeset for `@platejs/basic-nodes`.
