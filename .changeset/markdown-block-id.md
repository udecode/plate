---
"@platejs/markdown": patch
---

Added support for preserving block IDs in markdown serialization to enable AI comment tracking.

### Changes:

- **Block ID Wrapping**: New `wrapWithBlockId()` utility wraps mdast nodes with block elements containing ID attributes
- **Enhanced Serialization**: Updated `serializeMd` to support `preserveBlockIds` option for maintaining block references
- **List Improvements**: Better handling of list items with block ID preservation during serialization

### Example:

```typescript
// Serialize with block IDs preserved
const markdown = serializeMd(editor, {
  preserveBlockIds: true
});
// Output: <block id="block-1">Content here</block>
```