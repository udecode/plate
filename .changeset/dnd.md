---
'@udecode/plate-dnd': major
---

The following changes were made to improve performance:

- Refactored `useDraggable` hook to focus on core dragging functionality:
  - Removed `dropLine`. Use `useDropLine().dropLine` instead.
  - Removed `groupProps` from the returned object – `isHovered`, and `setIsHovered` from the returned state. Use CSS instead.
  - Removed `droplineProps`, and `gutterLeftProps` from the returned object. Use `useDropLine().props`, `useDraggableGutter().props` instead.
