---
"@platejs/ai": minor
---

- Add `applyAISuggestions` utility for applying AI-generated content as suggestions with diff tracking
- Add `replacePlaceholders` template system supporting `{prompt}`, `{block}`, `{blockSelection}`, `{editor}` placeholders
- Improve `acceptAIChat` transform to handle transient suggestions properly
- Add block selection mode support with `_replaceIds` tracking
- Fix suggestion acceptance and cleanup in chat mode