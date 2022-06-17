---
"@udecode/plate-core": minor
---

- fix: `Plate` children were rendered before `Editable`, making slate DOM not resolvable on first render. Fixed by moving `Editable` as the first child of `Slate` and `children` as the last children of `Slate`.
- `Plate` new props:
  - `firstChildren`: replaces the previous behavior of `children`, rendered as the first children of `Slate`
  - `editableRef`: Ref to the `Editable` component.
- Plate store - new field:
  - `isRendered`: Whether `Editable` is rendered so slate DOM is resolvable. Subscribe to this value when you query the slate DOM outside `Plate`.
