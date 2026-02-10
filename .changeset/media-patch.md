---
'@platejs/media': patch
---

- Fixed placeholder nodes persisting after page refresh during upload when `disableEmptyPlaceholder` is `true`. Added `normalizeInitialValue` to remove stale placeholder nodes on editor initialization.
