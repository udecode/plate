---
'@platejs/ai': minor
---

Added **AI Comment** functionality to provide AI-powered text feedback and suggestions.And upgrade to AI SDK 5.

### New Features:

- **AI Comment Integration**: New utilities for AI-generated comments on selected text
  - `aiCommentToRange()` - Convert AI comments to text ranges with proper block mapping
  - `findTextRangeInBlock()` - Find text ranges within blocks for accurate comment positioning

- **Enhanced AI Chat**: Improved chat functionality with comment support

  - New `toolName` property in chat helpers for tracking AI tools
  - Support for AI comment prompts in chat submissions
  - Added `mode`, `toolName` params to `submitAIChat`
  - New `toolName` plugin option.

- **Text Matching**: Advanced text matching algorithms
  - Longest Common Subsequence (LCS) algorithm for fuzzy text matching
  - Support for multi-block text selection and comment ranges
  - Accurate text position tracking across block boundaries

### Example:

```typescript
// Convert AI comment to text range
const range = aiCommentToRange(editor, {
  blockId: 'block-1',
  content: 'Selected text',
  comment: 'Consider adding more detail here',
});
```
