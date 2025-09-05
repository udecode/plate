---
"@platejs/markdown": patch
---

Added support for preserving block IDs in markdown serialization to enable AI comment tracking.

### Changes:

- **Enhanced Serialization**: Updated `serializeMd` to support `withBlockId` option for maintaining block references

### Example:

```typescript
// Serialize with block IDs preserved
const markdown = serializeMd(editor, {
  withBlockId: true
});
// Output: <block id="block-1">Content here</block>
```