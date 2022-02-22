---
"@udecode/plate-core": minor
---

- `Plate` props are merged into the initial store state to override the default values.
  - the initial value will be `editor.children` if `editor` prop is defined.
- `PlateProvider` accepts `PlateProps` so set the initial store state
