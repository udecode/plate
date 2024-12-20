---
'@udecode/plate-dnd': patch
---

Additional breaking changes to v41:

- Remove `useDraggableState`. Use `const { isDragging, previewRef, handleRef } = useDraggable`
- Remove `useDraggableGutter`. Set `contentEditable={false}` to your gutter element
- Remove `props` from `useDropLine`. Set `contentEditable={false}` to your drop line element
- Remove `withDraggable`, `useWithDraggable`. Use [`DraggableAboveNodes`](https://github.com/udecode/plate/pull/3878/files#diff-493c12ebed9c3ef9fd8c3a723909b18ad439a448c0132d2d93e5341ee0888ad2) instead
