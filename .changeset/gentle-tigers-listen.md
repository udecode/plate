---
'@platejs/dnd': patch
---

Improved drag and drop state management

- Added `_isOver` state tracking to the DnD plugin for better drag-over detection
- Simplified `useDndNode` hook implementation by removing complex preview logic
- Fixed state reset issues by properly clearing `_isOver` state on drop and focus events
- Improved preview handling with dedicated `resetPreview` helper function