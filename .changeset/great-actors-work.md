---
'@udecode/plate-link': minor
---

- `upsertLink`:
  - Removed `isUrl`
  - Added `skipValidation`
- Check that URL scheme is valid when:
  - Upserting links
  - Deserializing links from HTL
  - Passing `href` to `nodeProps`
  - Rendering the `OpenLinkButton` in `FloatingLink`
