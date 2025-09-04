---
"@platejs/ai": minor
---

Added **AI Comment** functionality to provide AI-powered text feedback and suggestions.

### New Features:

- **AI Comment Integration**: New utilities for AI-generated comments on selected text
  - `aiCommentToRange()` - Convert AI comments to text ranges with proper block mapping
  - `findTextRangeInBlock()` - Find text ranges within blocks for accurate comment positioning
  - `getAICommentPrompt()` - Generate prompts for AI comment requests
  - `submitAIComment()` - Submit text for AI comment generation

- **Enhanced AI Chat**: Improved chat functionality with comment support
  - Added `commentPromptTemplate` option to `AIChatPlugin`
  - New `toolName` property in chat helpers for tracking AI tools
  - Support for AI comment prompts in chat submissions

- **Text Matching**: Advanced text matching algorithms
  - Longest Common Subsequence (LCS) algorithm for fuzzy text matching
  - Support for multi-block text selection and comment ranges
  - Accurate text position tracking across block boundaries

### Example:

```typescript
// Submit text for AI comments
submitAIComment(editor, 'Please provide feedback on this paragraph');

// Convert AI comment to text range
aiCommentToRange(editor, {
  blockId: 'block-1',
  content: 'Selected text',
  comment: 'Consider adding more detail here'
}, (commentWithRange) => {
  // Handle the comment with its text range
});
```