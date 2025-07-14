---
'@platejs/dnd': patch
---

Added support for dragging multiple blocks using editor's native selection

- **Breaking improvement**: Multiple blocks can now be dragged using the editor's native selection, not just with block-selection
- Added `_isOver` state tracking to the DnD plugin for better drag-over detection during multi-block operations
- Simplified `useDndNode` hook implementation by removing complex preview logic
- Fixed state reset issues by properly clearing `_isOver` state on drop and focus events
- Improved preview handling with dedicated `resetPreview` helper function for multi-block dragging