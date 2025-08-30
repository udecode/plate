---
"@platejs/ai": minor
---

Added **AIReviewPlugin** that enables AI-powered document review functionality. This feature allows AI to analyze document content and suggest comments on specific text sections.

### New APIs:

- **AIReviewPlugin** - Main plugin for AI review functionality
  - `generateComment()` - Trigger AI review on selected text or entire document
  - Configurable `promptTemplate` and `systemTemplate` options
- **useEditorCompletion** - Hook for AI completion setup with streaming responses
- **useAIEditorReview** - Hook for processing AI-generated markdown content
- **applyAIReview** - Transform function to apply AI suggestions to the editor
  - Uses advanced text matching with LCS algorithm
  - Provides `onComment` callback for comment system integration
- **getAIReviewCommentKey** - Utility function for generating AI comment keys

### Example:

```typescript
const editor = createPlateEditor({
  plugins: [
    AIReviewPlugin.configure({
      promptTemplate: (params) => 'Review this document...',
      systemTemplate: (params) => 'You are a helpful editor...'
    })
  ]
});

// Trigger AI review
editor.api.aiReview.generateComment();
```