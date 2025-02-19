---
'@udecode/plate-utils': patch
'@udecode/plate-core': patch
---

Add `belowRootNodes` render option to render content below root element but above children. Similar to `belowNodes` but renders directly in the element rather than wrapping. This is used in `PlateElement` to render the `BlockSelection` component below the root element.
