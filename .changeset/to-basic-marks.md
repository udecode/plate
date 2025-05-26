---
'@udecode/plate-kbd': major
'@udecode/plate-highlight': major
---

Deprecated package, moved to `@udecode/plate-basic-marks`. Migration:

- Remove `@udecode/plate-<name>` from your dependencies.
- If using `BasicMarksPlugin`, remove `*Plugin` from the `plugins` array.
- If not using `BasicMarksPlugin`, import `*Plugin` from `@udecode/plate-basic-marks`.
