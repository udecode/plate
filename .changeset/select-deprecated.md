---
'@udecode/plate-select': major
---

- Package `@udecode/plate-select` has been deprecated.
- `SelectOnBackspacePlugin` has been removed. This behavior is now built into Plate by default: delete (backward/forward) at the start of a block will select the previous/next void block instead of removing it.
- `DeletePlugin` has been removed. This behavior is now built into Plate by default: delete (backward/forward) from an empty block will remove it instead of merging.
- Migration:
  - Remove `@udecode/plate-select` from your dependencies.
  - Remove any usage of `SelectOnBackspacePlugin`, `DeletePlugin` from your project.
