---
"@udecode/plate-headless": major
---

- `@udecode/plate-selection` package moved out from `@udecode/plate` because of https://github.com/Simonwep/selection/issues/124
- Migration:
  - If not using `createBlockSelectionPlugin`, no migration is needed.
  - Otherwise, install `@udecode/plate-selection` and import `createBlockSelectionPlugin` from that package.
