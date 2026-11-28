---
'plitejs': patch
---

- Add `ScrollMargin` and `ScrollIntoViewOptions.scrollMargin` to clear overlays with `scrollMode: 'if-needed'` and merge with CSS `scroll-margin` via `Math.max`
- Deduplicate commit-triggered decoration reads for node keys an observer already refreshed at the same editor version, keeping first-frame paint fresh while eliminating duplicate reads
