# ProseKit: history and undo

## Revision restore versus undo

- **Revision restore.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/change-tracking.test.ts` (L9) pins a product flow: Save records a commit with a Restore button, and restoring an older commit remounts the editor with that version's content. The test does not touch undo. The harvest reads it as product revision history kept apart from editor undo, which is policy for Plate's suggestion feature and application versioning, not editor law (`docs/editor-test-harvester/prosekit/report.md:140`).
