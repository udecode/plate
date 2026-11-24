---
'plitejs': patch
---

- Add `editor.read.ranges.isEmpty(range)`, which answers whether a range covers no letter and no whole void element, such as a mention.
- Add the `hideEmpty` option to `createAnnotationStore`. An annotation whose range covers nothing then resolves with `range: null`, leaves `getAnnotationsAt`, and its listeners hear when its text is deleted or comes back, or when a plugin reconfigure changes what counts as content.
- Fix a view without a preview reading the preview its editor shows. It now reads the stored document.
