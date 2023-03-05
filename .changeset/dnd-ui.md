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