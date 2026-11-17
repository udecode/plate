---
'platejs': patch
---

- Add `ranges` to `migrateDocument`. Pass saved ranges keyed by thread ID and read them back as `result.ranges`, each mapped through every step and the final fit onto the same words, or `null` when the text it covered is gone, or when the saved entry is not a range in the primary root or points outside the document
- Add `mapRanges` to a migration step result, so a step maps every range in one call. A step that changes the document without it returns `null` for every range, and a step that returns the document unchanged keeps them all. `migrateV54` and `migrateListIdentity` map ranges exactly
- Fit a migrated document with a saved selection as a load without a selection does, so `migrateDocument` returns the same document with or without a selection or ranges
