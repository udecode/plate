---
"@udecode/plate-ui-dnd": major
---

renamed:
- `useDndBlock` options:
  - `blockRef` -> `nodeRef`
  - `removePreview` -> `preview.disable`
- `useDropBlockOnEditor` -> `useDropBlock`
- `useDropBlock` options:
  - `blockRef` -> `nodeRef`
  - `setDropLine` -> `onChangeDropLine`
signature change:
- `getHoverDirection`:
```tsx
// before
(
  dragItem: DragItemBlock,
  monitor: DropTargetMonitor,
  ref: any,
  hoverId: string
)
// after
{
  dragItem,
  id,
  monitor,
  nodeRef,
}: GetHoverDirectionOptions
```
