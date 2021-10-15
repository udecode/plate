---
'@udecode/plate-alignment': major
---

breaking changes:
- `createAlignPlugin`:
  - this plugin is no longer wrapping a block, but instead setting an `align` field to an existing block 
  - removed `pluginKeys`, `renderElement` and `deserialize`
- removed:
  - `ELEMENT_ALIGN_LEFT`
  - `ELEMENT_ALIGN_CENTER`
  - `ELEMENT_ALIGN_RIGHT`
  - `ELEMENT_ALIGN_JUSTIFY`
  - `KEYS_ALIGN` in favor of `KEY_ALIGN`
  - `getAlignDeserialize`
  - `upsertAlign` in favor of `setAlign`