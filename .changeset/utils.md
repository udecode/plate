---
'@udecode/plate-utils': patch
---

- `PlateElement` add `data-block-id` if `element.id` is defined, after editor mount to support SSR hydration.
