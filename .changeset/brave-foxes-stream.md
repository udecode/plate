---
'@platejs/ai': patch
'@platejs/layout': patch
'@platejs/markdown': patch
---

### AI Streaming Improvements

**@platejs/ai:**
- Fixed empty paragraph removal logic in `streamInsertChunk` to only remove true empty paragraphs (no text content)
- Enhanced streaming support for tables and columns with proper chunk insertion
- Fixed interface name typo: `SteamInsertChunkOptions` → `StreamInsertChunkOptions`
- Improved markdown streaming with better handling of incomplete patterns

**@platejs/layout:**
- Added streaming support for columns in `withColumn`
- Fixed column width calculations to handle edge cases

**@platejs/markdown:**
- Enhanced column deserialization with proper attribute parsing
- Added support for column groups in markdown rules
- Improved attribute parsing in `customMdxDeserialize`