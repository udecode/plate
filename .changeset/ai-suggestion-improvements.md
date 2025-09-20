---
"www": patch
"@platejs/ai": minor
"@platejs/comment": patch
"@platejs/diff": minor
"@platejs/markdown": minor
"@platejs/selection": patch
"@platejs/suggestion": minor
"@platejs/list": patch
---

### AI Suggestions

**@platejs/ai:**
- Add `applyAISuggestions` utility for applying AI-generated content as suggestions with diff tracking
- Add `replacePlaceholders` template system supporting `{prompt}`, `{block}`, `{blockSelection}`, `{editor}` placeholders
- Improve `acceptAIChat` transform to handle transient suggestions properly
- Add block selection mode support with `_replaceIds` tracking
- Fix suggestion acceptance and cleanup in chat mode

**@platejs/suggestion:**
- Add `SkipSuggestionDeletes` utility to extract text while excluding removed suggestions
- Add transient suggestions support with `getTransientSuggestionKey` and filtering options
- Unify adjacent insert/remove suggestion IDs for better UI handling
- Improve `acceptSuggestion` to support inline elements like links
- Add `transient` parameter to `getSuggestionProps` and `suggestion.nodes()` APIs

**@platejs/diff:**
- Add `ignoreProps` option to skip diffing specific properties
- Improve diffing of inline elements with same type
- Add line break proxy characters for better offset handling

**@platejs/markdown:**
- Add `plainMarks` option to exclude specific marks from markdown serialization
- Improve mark handling in text serialization

**Other packages:**
- **@platejs/comment**: Add `getTransientCommentKey` utility for temporary comments
- **@platejs/selection**: Improve `insertBlocksAndSelect` to handle fragment insertion better
- **@platejs/list**: Fix list operations with improved selection handling
- **www**: Enhance AI UI with loading states, comment system, and improved streaming