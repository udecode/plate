---
'@udecode/plate-link': major
---

- `createLinkPlugin`
  - removed `onKeyDownLink` for floating link
  - removed `hotkey` for `triggerFloatingLinkHotkeys`
- removed:
  - `getAndUpsertLink` for `upsertLink`
  - `upsertLinkAtSelection` for `upsertLink`
- `LinkToolbarButton`:
  - `onClick` now calls `triggerFloatingLink`