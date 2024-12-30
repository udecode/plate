---
'@udecode/plate-core': major
---

- Plugin `normalizeInitialValue` now returns `void` instead of `Value`. Mutating the nodes should keep node references (e.g. use `Object.assign` instead of spread).
- Import `Hotkeys` from `@udecode/plate-core` instead of `@udecode/plate-core/react`
