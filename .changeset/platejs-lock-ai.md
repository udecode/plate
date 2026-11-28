---
'platejs': patch
---

Add `editor.api.markdown.parsePlaceholders`, lock-aware AI prompt helpers (`hasEditableAISelection`, `serializeAIEditContext`, `serializeAISelectionMarkdown`, `LOCKED_BLOCK_PLACEHOLDER_TAG`, and optional `AIChatRequestRefs.lockedBlocks`), and aligned `AIChatPlugin` document and multi-cell table editing around locked blocks and cells.
