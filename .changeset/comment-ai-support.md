---
"@platejs/comment": patch
---

Enhanced comment plugin to support AI-generated comments and improved draft comment key generation.

### Changes:

- **AI Comment Support**: Added `isAI` option to `BaseCommentPlugin` for identifying AI-generated comments
- **Improved Key Generation**: Enhanced `getDraftCommentKey()` to handle undefined values gracefully
- **Better Type Support**: Improved TypeScript types for comment-related functionality