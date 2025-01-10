---
'@udecode/plate-core': patch
---

- If deleting a block that turns `editor.children` empty (`[]`), directly insert a default block before normalization.
- `PlateStatic` element and leaf rendering is now memoized with `React.memo` so you can safely update `editor.children`. For elements, it compares the `element` reference or `element._memo` value. The latter can be used to memoize based on the markdown string instead of the `element` reference. For example, `deserializeMd` with `memoize: true` will set `element._memo` for that purpose.
