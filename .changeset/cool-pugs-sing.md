---
"@udecode/plate-core": minor
---

- new `PlatePlugin` property:
  - `renderAboveSlate` – Render a component above `Slate`
- `id` is no longer required in plate hooks:
  - `usePlateId()` is getting the closest editor id
  - it's used in all store hooks if no store is found with the given (or omitted) id
