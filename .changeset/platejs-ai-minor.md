---
"@platejs/ai": minor
---

Added `rejectAISuggestions` utility and refactored `acceptAISuggestions` into a reusable module

- **Added** new `rejectAISuggestions` utility function that rejects all transient AI suggestions in the editor
- **Refactored** `acceptAISuggestions` logic from `acceptAIChat` transform into a standalone utility module
- **Exported** both `acceptAISuggestions` and `rejectAISuggestions` from the ai-chat utils for reuse across different transforms

These utilities provide a consistent way to accept or reject AI-generated suggestions, enabling better control over AI-assisted content in the editor.