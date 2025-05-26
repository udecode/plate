---
'@udecode/plate-horizontal-rule': major
'@udecode/plate-block-quote': major
---

Deprecated package, moved to `@udecode/plate-basic-elements`. Migration:

- Remove `@udecode/plate-<name>` from your dependencies.
- If using `BasicElementsPlugin`, remove `*Plugin` from the `plugins` array.
- If not using `BasicElementsPlugin`, import `*Plugin` from `@udecode/plate-basic-elements`.
