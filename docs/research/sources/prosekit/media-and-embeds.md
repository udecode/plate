# ProseKit: media and embeds

## Image atoms

- **Image atoms.** In `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test`, `image-view.test.ts`, `gap-cursor.test.ts` and `drop-cursor.test.ts` pin that a click selects a block image, that ArrowDown from a selected image puts a gap cursor between two stacked images, and that native drag and drop reorders images. Plite's `apps/plite/tests/plite-browser/donor/examples/images.test.ts` covers click selection, navigation between adjacent image voids, the drop cursor, internal moves, select-all and deletion. ProseKit's gap cursor is ProseMirror machinery (`docs/editor-test-harvester/prosekit/report.md:141`, 184-185).
