---
'platejs': patch
---

- Fix a comment thread whose text was deleted still reading as attached over nothing. Its range now reads `status: 'unavailable'` until its text comes back, such as through undo, and `idsAt` no longer answers it at the spot where its text was.
- Refuse to create, send or publish a thread over a range that covers no letter and no embedded item, as for a draft whose selected text was deleted before it was sent. Starting a draft over such a range between two blocks takes the first block.
- Load a saved thread whose range covers nothing as unavailable.
- Notify attachment listeners when a thread's text is deleted or comes back, even when its range keeps the same points, and answer `pendingRange()` with `null` once the pending draft's text is deleted.
