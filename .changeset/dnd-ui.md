---
'@udecode/plate-ui-dnd': major
---

Unstyled logic has been moved to `@udecode/plate-dnd`
```ts
// before
import { createDndPlugin } from '@udecode/plate-ui-dnd';

// after
import { createDndPlugin } from '@udecode/plate-dnd';
```
Only `withPlateDraggable`, `withPlateDraggables` and `PlateDraggable` are left in `@udecode/plate-ui-dnd`.
Renamed:
- `withDraggables` -> `withPlateDraggables`. In the second parameter, draggable props options have been moved under `draggableProps`:
```tsx
// before
{
  onRenderDragHandle: () => {}
  styles,
}
        
// after
{
  draggableProps: {
    onRenderDragHandle: () => {}
    styles,
  }, 
}
```
