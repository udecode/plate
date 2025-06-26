---
'@udecode/plate-lint': minor
'@udecode/plate-floating': minor
'@udecode/slate-utils': minor
---

Added **Lint Plugin** - A comprehensive text validation system for Plate editors, similar to ESLint for document content.

**@udecode/plate-lint**:
- Added new lint plugin with customizable rule system
- Built-in rules for text case validation and find/replace functionality
- Real-time text validation with inline annotations and fix suggestions
- Popover UI for viewing and applying fixes
- Support for custom lint rules and parsers

**@udecode/plate-floating**:
- Added `useVirtualRefState` hook for virtual reference positioning

**@udecode/slate-utils**:
- Added annotation utilities:
  - `annotationToDecorations` - Convert single annotation to decorations
  - `annotationsToDecorations` - Convert multiple annotations to decorations
  - `getNextRange` - Find next range matching criteria
  - `isSelectionInRange` - Check if selection intersects with range
  - `parseNode` - Parse node content with custom parser options
  - `replaceText` - Replace text at specified range