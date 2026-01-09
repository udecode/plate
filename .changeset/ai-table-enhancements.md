---
"@platejs/ai": minor
---

Upgraded AI SDK from v5 to v6:

- Updated `ai` peer dependency to `^6.0.0`
- Updated `@ai-sdk/react` peer dependency to `^3.0.0`

Enhanced AI capabilities with better table cell handling:

- Added `applyTableCellSuggestion` utility for handling single-cell table operations
- Added `nestedContainerUtils` for managing nested containers in table cells
- Enhanced `getMarkdown` with improved table structure handling and better cell content serialization
- Improved `applyAISuggestions` with more robust cell manipulation support
- Added comprehensive tests for markdown generation from complex table structures
