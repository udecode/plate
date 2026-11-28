---
'plitejs': patch
---

- Keep the caret inside a trailing or leading content root instead of entering hidden owner text on arrow navigation
- Extend `Shift+ArrowRight` past a two-deep nested content root that ends its host into the next outer block, and preserve projected cross-root `Shift+ArrowDown` selection from nested synced blocks in Firefox
- Keep named-root carets and pending marks unchanged when explicit `main` text or node transforms run
- Revalidate an existing content root's projected grammar when its owner changes
- Scale content-root document loading, validation, and replacement linearly in card count
- Preserve attached document records when reading, fitting, loading, replacing, or viewing documents with `undefined` fields
