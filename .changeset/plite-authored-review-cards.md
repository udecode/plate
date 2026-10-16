---
'plitejs': patch
---

- Read review cards with `read.authored.groups({ at })`. A card groups one author's adjacent pending changes, and its summary holds `id`, `authorId`, `createdAt`, `changeCount` and `revision`. A card's id is its oldest change, so every peer and every reload gives it the same id. `read.authored.groupOf(changeId)` returns the card that holds a change
- Page pending changes in document order with `read.authored.changes({ at, authorId, from, to, group, cursor, limit })`, 50 at a time by default and at most 200
- Decide changes or cards as they were read with `update.authored.decide({ action, changes })` or `{ action, groups }`, and pass several decisions to decide them together. A decision returns `applied`, `unchanged`, `stale`, `invalid`, or `blocked` with the changes it needs in `with`
- `api.authored.subscribeChanges` passes one frozen `{ blocks, changed, groups, removed }` delta for each commit that changes the review, and `api.authored.subscribeRefusals` reports each proposal write or view switch the editor refused
- A view is `{ intent: 'edit' | 'propose' }`, or a `{ preview: 'accepted' | 'proposed' }` that takes no writes
- Typing or pasting inside struck text lands after it, as in a plain editor. An IME composition inside struck text splits the pending deletion around the composed text. A `propose` view records the new text as an insertion
- Pending review marks live in each node's `authored` property and review records in the document's `records`. Every loaded value and commit passes admission, which compacts and checks them, so saving `read.value()` keeps the review
